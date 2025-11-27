import prisma from '../../lib/prismaClient';
import { listCategories, listRegions } from '../catalog/catalog.service';
import { mapSupplierSummary, type SupplierSummaryPayload } from '../suppliers/suppliers.service';

export async function getHomepageContent() {
  const TARGET_SUPPLIER_COUNT = 8;
  
  // First get suppliers with homeRank > 0 (prioritized)
  const suppliersWithHomeRank = await prisma.supplier.findMany({
    where: { homeRank: { gt: 0 } },
    include: {
      region: true,
      categories: { include: { category: true } },
    },
    orderBy: [{ homeRank: 'asc' }, { name: 'asc' }],
    take: TARGET_SUPPLIER_COUNT,
  }) as SupplierSummaryPayload[];

  let featuredSuppliersRaw = suppliersWithHomeRank;

  // If we have fewer than 8 suppliers, fill remaining slots with suppliers without homeRank
  if (featuredSuppliersRaw.length < TARGET_SUPPLIER_COUNT) {
    const remainingCount = TARGET_SUPPLIER_COUNT - featuredSuppliersRaw.length;
    const existingIds = featuredSuppliersRaw.map((s) => s.id);

    const whereClause: any = {
      OR: [
        { homeRank: 0 },
        { homeRank: null },
      ],
    };

    // Exclude already selected suppliers if any exist
    if (existingIds.length > 0) {
      whereClause.NOT = { id: { in: existingIds } };
    }

    const suppliersWithoutHomeRank = await prisma.supplier.findMany({
      where: whereClause,
      include: {
        region: true,
        categories: { include: { category: true } },
      },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }, { name: 'asc' }],
      take: remainingCount,
    }) as SupplierSummaryPayload[];

    // Combine both results
    featuredSuppliersRaw = [...featuredSuppliersRaw, ...suppliersWithoutHomeRank].slice(0, TARGET_SUPPLIER_COUNT);
  }

  const [latestReviews, categories, regions, stats] =
    await Promise.all([
      prisma.review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          supplier: {
            select: {
              slug: true,
              name: true,
              heroImage: true,
              logoImage: true,
            },
          },
        },
      }),
      listCategories(),
      listRegions(),
      Promise.all([
        prisma.supplier.count(),
        prisma.review.count(),
        prisma.category.count(),
      ]),
    ]);

  const [supplierCount, reviewCount, categoryCount] = stats;

  // Get ratings for featured suppliers
  const supplierIds = featuredSuppliersRaw.map((s: SupplierSummaryPayload) => s.id);
  const reviews = await prisma.review.findMany({
    where: {
      supplierId: { in: supplierIds },
      isApproved: true,
    },
    select: {
      supplierId: true,
      ratingOverall: true,
    },
  });

  // Calculate average rating per supplier
  const ratingsBySupplier = new Map<number, { average: number; count: number }>();
  for (const review of reviews) {
    const existing = ratingsBySupplier.get(review.supplierId) || { average: 0, count: 0 };
    existing.average = (existing.average * existing.count + review.ratingOverall) / (existing.count + 1);
    existing.count += 1;
    ratingsBySupplier.set(review.supplierId, existing);
  }

  const featuredSuppliers = featuredSuppliersRaw.map((supplier: SupplierSummaryPayload) => {
    const summary = mapSupplierSummary(supplier);
    const rating = ratingsBySupplier.get(supplier.id);
    return {
      ...summary,
      ratingAverage: rating ? Number(rating.average.toFixed(1)) : null,
      ratingCount: rating?.count || 0,
    };
  });

  const spotlightReviews = latestReviews.map((review: (typeof latestReviews)[number]) => ({
    author: review.author,
    ratingOverall: review.ratingOverall,
    body: review.body,
    images: review.images,
    publishedAt: review.createdAt.toISOString(),
    supplier: {
      slug: review.supplier.slug,
      name: review.supplier.name,
      heroImage: review.supplier.heroImage,
      logoImage: review.supplier.logoImage,
    },
  }));

  const topCategories = categories
    .slice()
    .sort((a: (typeof categories)[number], b: (typeof categories)[number]) => b.supplierCount - a.supplierCount)
    .slice(0, 6);

  const topRegions = regions
    .slice()
    .sort((a: (typeof regions)[number], b: (typeof regions)[number]) => b.supplierCount - a.supplierCount)
    .slice(0, 4);

  return {
    stats: {
      suppliers: supplierCount,
      reviews: reviewCount,
      categories: categoryCount,
    },
    featuredSuppliers,
    spotlightReviews,
    categories: topCategories,
    regions: topRegions,
  };
}

