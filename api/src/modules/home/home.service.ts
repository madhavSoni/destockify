import prisma from '../../lib/prismaClient';
import { listCategories, listRegions } from '../catalog/catalog.service';
import { mapSupplierSummary, type SupplierSummaryPayload } from '../suppliers/suppliers.service';

export async function getHomepageContent() {
  // First try to get suppliers with homeRank > 0, if none found, get any suppliers
  let featuredSuppliersRaw = await prisma.supplier.findMany({
    where: { homeRank: { gt: 0 } },
    include: {
      region: true,
      categories: { include: { category: true } },
    },
    orderBy: [{ homeRank: 'asc' }, { name: 'asc' }],
    take: 6,
  }) as SupplierSummaryPayload[];

  // If no suppliers with homeRank, get any suppliers as fallback
  if (featuredSuppliersRaw.length === 0) {
    featuredSuppliersRaw = await prisma.supplier.findMany({
      include: {
        region: true,
        categories: { include: { category: true } },
      },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }, { name: 'asc' }],
      take: 6,
    }) as SupplierSummaryPayload[];
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

  const featuredSuppliers = featuredSuppliersRaw.map((supplier: SupplierSummaryPayload) => mapSupplierSummary(supplier));

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

