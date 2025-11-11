import { Prisma } from '@prisma/client';
import prisma from '../../lib/prismaClient';

const supplierSummaryInclude = {
  region: true,
  categories: {
    include: {
      category: true,
    },
  },
  lotSizes: {
    include: {
      lotSize: true,
    },
  },
} satisfies Prisma.SupplierInclude;

const supplierDetailInclude = {
  ...supplierSummaryInclude,
  reviews: {
    where: { isApproved: true },
    orderBy: { approvedAt: 'desc' },
    take: 10,
    include: {
      customer: true,
    },
  },
  testimonials: {
    orderBy: { publishedAt: 'desc' },
    take: 6,
  },
  resources: {
    orderBy: { order: 'asc' },
  },
} satisfies Prisma.SupplierInclude;

export type SupplierSummaryPayload = Prisma.SupplierGetPayload<{ include: typeof supplierSummaryInclude }>;
export type SupplierDetailPayload = Prisma.SupplierGetPayload<{ include: typeof supplierDetailInclude }>;

export interface SupplierListParams {
  category?: string;
  region?: string;
  lotSize?: string;
  search?: string;
  cursor?: number;
  limit?: number;
  homeOnly?: boolean;
}

export interface SupplierListResponse {
  items: Array<ReturnType<typeof mapSupplierSummary>>;
  nextCursor: number | null;
}

export function mapSupplierSummary(supplier: SupplierSummaryPayload) {
  return {
    slug: supplier.slug,
    name: supplier.name,
    shortDescription: supplier.shortDescription,
    heroImage: supplier.heroImage,
    logoImage: supplier.logoImage,
    averageRating: supplier.averageRating,
    reviewCount: supplier.reviewCount,
    trustScore: supplier.trustScore,
    badges: supplier.badges,
    homeRank: supplier.homeRank ?? 0,
    region: supplier.region
      ? {
          name: supplier.region.name,
          slug: supplier.region.slug,
          stateCode: supplier.region.stateCode,
        }
      : null,
    categories: supplier.categories.map((item: (typeof supplier.categories)[number]) => ({
      slug: item.category.slug,
      name: item.category.name,
    })),
    lotSizes: supplier.lotSizes.map((item: (typeof supplier.lotSizes)[number]) => ({
      slug: item.lotSize.slug,
      name: item.lotSize.name,
    })),
  };
}

export function computeReviewSummary(reviews: SupplierDetailPayload['reviews']) {
  if (reviews.length === 0) {
    return {
      average: null,
      count: 0,
      distribution: {
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
      },
      aspects: {
        accuracy: null,
        logistics: null,
        value: null,
        communication: null,
      },
    };
  }

  const distribution = {
    oneStar: 0,
    twoStar: 0,
    threeStar: 0,
    fourStar: 0,
    fiveStar: 0,
  };

  let accuracyTotal = 0;
  let accuracyCount = 0;
  let logisticsTotal = 0;
  let logisticsCount = 0;
  let valueTotal = 0;
  let valueCount = 0;
  let communicationTotal = 0;
  let communicationCount = 0;
  let overallTotal = 0;

  for (const review of reviews) {
    overallTotal += review.ratingOverall;

    const bucket = Math.min(5, Math.max(1, Math.round(review.ratingOverall)));
    switch (bucket) {
      case 1:
        distribution.oneStar += 1;
        break;
      case 2:
        distribution.twoStar += 1;
        break;
      case 3:
        distribution.threeStar += 1;
        break;
      case 4:
        distribution.fourStar += 1;
        break;
      case 5:
        distribution.fiveStar += 1;
        break;
      default:
        break;
    }

    if (review.ratingAccuracy != null) {
      accuracyTotal += review.ratingAccuracy;
      accuracyCount += 1;
    }
    if (review.ratingLogistics != null) {
      logisticsTotal += review.ratingLogistics;
      logisticsCount += 1;
    }
    if (review.ratingValue != null) {
      valueTotal += review.ratingValue;
      valueCount += 1;
    }
    if (review.ratingCommunication != null) {
      communicationTotal += review.ratingCommunication;
      communicationCount += 1;
    }
  }

  return {
    average: Number((overallTotal / reviews.length).toFixed(2)),
    count: reviews.length,
    distribution,
    aspects: {
      accuracy: accuracyCount > 0 ? Number((accuracyTotal / accuracyCount).toFixed(2)) : null,
      logistics: logisticsCount > 0 ? Number((logisticsTotal / logisticsCount).toFixed(2)) : null,
      value: valueCount > 0 ? Number((valueTotal / valueCount).toFixed(2)) : null,
      communication:
        communicationCount > 0 ? Number((communicationTotal / communicationCount).toFixed(2)) : null,
    },
  };
}

export async function listSuppliers(params: SupplierListParams): Promise<SupplierListResponse> {
  const take = Math.min(params.limit ?? 20, 50);

  const where: Prisma.SupplierWhereInput = {};

  if (params.category) {
    where.categories = {
      some: {
        category: { slug: params.category },
      },
    };
  }

  if (params.region) {
    where.region = { slug: params.region };
  }

  if (params.lotSize) {
    where.lotSizes = {
      some: {
        lotSize: { slug: params.lotSize },
      },
    };
  }

  if (params.homeOnly) {
    where.homeRank = { gt: 0 };
  }

  if (params.search) {
    const search = params.search.trim();
    if (search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { badges: { has: search } },
        { specialties: { has: search } },
      ];
    }
  }

  const query: Prisma.SupplierFindManyArgs = {
    where,
    include: supplierSummaryInclude,
    orderBy: [
      params.homeOnly
        ? ({ homeRank: 'asc' } as Prisma.SupplierOrderByWithRelationInput)
        : ({ homeRank: 'asc' } as Prisma.SupplierOrderByWithRelationInput),
      { name: 'asc' },
    ],
    take: take + 1,
  };

  if (params.cursor) {
    query.cursor = { id: params.cursor };
    query.skip = 1;
  }

  const suppliers = (await prisma.supplier.findMany(query)) as SupplierSummaryPayload[];

  let nextCursor: number | null = null;
  if (suppliers.length > take) {
    const nextItem = suppliers.pop();
    nextCursor = nextItem ? nextItem.id : null;
  }

  return {
    items: suppliers.map((supplier) => mapSupplierSummary(supplier)),
    nextCursor,
  };
}

export async function listFeaturedSuppliers(limit = 4) {
  const { items } = await listSuppliers({ limit, homeOnly: true });
  return items;
}

export async function getSupplierDetail(slug: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { slug },
    include: supplierDetailInclude,
  });

  if (!supplier) {
    return null;
  }

  const reviewSummary = computeReviewSummary(supplier.reviews);

  const recentReviews = supplier.reviews.slice(0, 4).map((review: (typeof supplier.reviews)[number]) => ({
    title: review.title,
    author: `${review.customer.firstName} ${review.customer.lastName}`,
    company: null,
    ratingOverall: review.ratingOverall,
    highlights: review.highlights,
    body: review.body,
    publishedAt: review.approvedAt?.toISOString() || review.createdAt.toISOString(),
  }));

  const testimonials = supplier.testimonials.map((testimonial: (typeof supplier.testimonials)[number]) => ({
    quote: testimonial.quote,
    author: testimonial.author,
    role: testimonial.role,
    company: testimonial.company,
    publishedAt: testimonial.publishedAt,
  }));

  const resources = supplier.resources.map((resource: (typeof supplier.resources)[number]) => ({
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    order: resource.order,
  }));

  const relatedSuppliers = await prisma.supplier.findMany({
    where: {
      id: { not: supplier.id },
      OR: [
        supplier.regionId
          ? ({
              regionId: supplier.regionId,
            } as Prisma.SupplierWhereInput)
          : undefined,
        {
          categories: {
            some: {
              categoryId: {
                in: supplier.categories.map((entry: (typeof supplier.categories)[number]) => entry.categoryId),
              },
            },
          },
        },
      ].filter(Boolean) as Prisma.SupplierWhereInput[],
    },
    include: supplierSummaryInclude,
    orderBy: [
      { homeRank: 'asc' as const },
      { reviewCount: 'desc' as const },
    ],
    take: 4,
  });

  return {
    supplier: {
      id: supplier.id,
      slug: supplier.slug,
      name: supplier.name,
      shortDescription: supplier.shortDescription,
      description: supplier.description,
      heroImage: supplier.heroImage,
      logoImage: supplier.logoImage,
      website: supplier.website,
      phone: supplier.phone,
      email: supplier.email,
      averageRating: supplier.averageRating ?? reviewSummary.average,
      reviewCount: supplier.reviewCount ?? reviewSummary.count,
      trustScore: supplier.trustScore,
      minimumOrder: supplier.minimumOrder,
      leadTime: supplier.leadTime,
      badges: supplier.badges,
      specialties: supplier.specialties,
      certifications: supplier.certifications,
      logisticsNotes: supplier.logisticsNotes,
      pricingNotes: supplier.pricingNotes,
      region: supplier.region
        ? {
            name: supplier.region.name,
            slug: supplier.region.slug,
            headline: supplier.region.headline,
            description: supplier.region.description,
            stateCode: supplier.region.stateCode,
          }
        : null,
      categories: supplier.categories.map((item) => ({
        slug: item.category.slug,
        name: item.category.name,
        headline: item.category.headline,
      })),
      lotSizes: supplier.lotSizes.map((item) => ({
        slug: item.lotSize.slug,
        name: item.lotSize.name,
        headline: item.lotSize.headline,
      })),
    },
    reviewSummary,
    recentReviews,
    testimonials,
    resources,
    relatedSuppliers: relatedSuppliers.map((related) => mapSupplierSummary(related as SupplierSummaryPayload)),
  };
}

