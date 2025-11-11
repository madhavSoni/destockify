import prisma from '../../lib/prismaClient';
import { listCategories, listLotSizes, listRegions } from '../catalog/catalog.service';
import { listGuides } from '../guides/guides.service';
import { listFaq } from '../faq/faq.service';
import { mapSupplierSummary, type SupplierSummaryPayload } from '../suppliers/suppliers.service';

export async function getHomepageContent() {
  const [featuredSuppliersRaw, latestReviews, featuredGuides, categories, regions, lotSizes, faqs, stats] =
    await Promise.all([
      prisma.supplier
        .findMany({
          where: { homeRank: { gt: 0 } },
          include: {
            region: true,
            categories: { include: { category: true } },
            lotSizes: { include: { lotSize: true } },
          },
          orderBy: [{ homeRank: 'asc' }, { reviewCount: 'desc' }],
          take: 6,
        })
        .then((records) => records as SupplierSummaryPayload[]),
      prisma.review.findMany({
        where: { isApproved: true },
        orderBy: { approvedAt: 'desc' },
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
              badges: true,
            },
          },
        },
      }),
      listGuides({ featuredOnly: true, limit: 3 }),
      listCategories(),
      listRegions(),
      listLotSizes(),
      listFaq(),
      Promise.all([
        prisma.supplier.count(),
        prisma.review.count(),
        prisma.guide.count(),
        prisma.category.count(),
      ]),
    ]);

  const [supplierCount, reviewCount, guideCount, categoryCount] = stats;

  const featuredSuppliers = featuredSuppliersRaw.map((supplier: SupplierSummaryPayload) => mapSupplierSummary(supplier));

  const spotlightReviews = latestReviews.map((review: (typeof latestReviews)[number]) => ({
    title: review.title,
    author: `${review.customer.firstName} ${review.customer.lastName}`,
    company: null,
    ratingOverall: review.ratingOverall,
    highlights: review.highlights,
    body: review.body,
    publishedAt: review.approvedAt?.toISOString() || review.createdAt.toISOString(),
    supplier: {
      slug: review.supplier.slug,
      name: review.supplier.name,
      heroImage: review.supplier.heroImage,
      logoImage: review.supplier.logoImage,
      badges: review.supplier.badges,
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

  const spotlightLotSizes = lotSizes.slice(0, 3);

  const quickFaq = faqs.slice(0, 4);

  return {
    stats: {
      suppliers: supplierCount,
      reviews: reviewCount,
      guides: guideCount,
      categories: categoryCount,
    },
    featuredSuppliers,
    spotlightReviews,
    featuredGuides,
    categories: topCategories,
    regions: topRegions,
    lotSizes: spotlightLotSizes,
    faqs: quickFaq,
  };
}

