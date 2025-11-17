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
  verified?: boolean;
  regionGroup?: 'south' | 'west' | 'northeast' | 'midwest' | 'other';
}

export interface SupplierListResponse {
  items: Array<ReturnType<typeof mapSupplierSummary>>;
  nextCursor: number | null;
  total: number;
}

export function mapSupplierSummary(supplier: SupplierSummaryPayload) {
  const flags = [];
  if (supplier.isVerified) {
    flags.push({ text: 'Verified', variant: 'verified' as const });
  }
  if (supplier.isScam) {
    flags.push({ text: 'Scam', variant: 'scam' as const });
  }

  return {
    slug: supplier.slug,
    name: supplier.name,
    shortDescription: supplier.shortDescription,
    heroImage: supplier.heroImage,
    logoImage: supplier.logoImage,
    averageRating: supplier.averageRating,
    reviewCount: supplier.reviewCount,
    trustScore: supplier.trustScore,
    isVerified: supplier.isVerified,
    isScam: supplier.isScam,
    flags,
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

// Helper function to categorize states into regions
function getRegionGroup(stateCode: string | null | undefined): string {
  if (!stateCode) return 'other';
  
  const state = stateCode.toUpperCase();
  
  // South
  const southStates = ['FL', 'GA', 'TX', 'AL', 'MS', 'LA', 'AR', 'TN', 'NC', 'SC', 'KY', 'VA', 'WV'];
  // West
  const westStates = ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT', 'CO', 'NM', 'ID', 'MT', 'WY', 'AK', 'HI'];
  // Northeast
  const northeastStates = ['NY', 'NJ', 'PA', 'MA', 'CT', 'RI', 'VT', 'NH', 'ME', 'DE', 'MD', 'DC'];
  // Midwest
  const midwestStates = ['IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS', 'OK'];
  
  if (southStates.includes(state)) return 'south';
  if (westStates.includes(state)) return 'west';
  if (northeastStates.includes(state)) return 'northeast';
  if (midwestStates.includes(state)) return 'midwest';
  return 'other';
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

  if (params.verified !== undefined) {
    where.isVerified = params.verified;
  }

  if (params.regionGroup) {
    // Get all regions in the specified group
    const allRegions = await prisma.region.findMany({
      select: { stateCode: true },
    });
    
    const matchingStateCodes = allRegions
      .filter(r => getRegionGroup(r.stateCode) === params.regionGroup)
      .map(r => r.stateCode)
      .filter((code): code is string => code !== null);
    
    if (matchingStateCodes.length > 0) {
      where.region = {
        stateCode: { in: matchingStateCodes },
      };
    } else {
      // No matching regions, return empty result
      where.id = { equals: -1 }; // Impossible condition
    }
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

  // Build orderBy based on region group sorting
  const orderBy: Prisma.SupplierOrderByWithRelationInput[] = [];
  
  if (params.regionGroup) {
    // When filtering by region group, we want to sort by state code within that group
    orderBy.push({ isVerified: 'desc' } as Prisma.SupplierOrderByWithRelationInput);
    orderBy.push({ region: { stateCode: 'asc' } } as Prisma.SupplierOrderByWithRelationInput);
  } else if (params.homeOnly) {
    orderBy.push({ homeRank: 'asc' } as Prisma.SupplierOrderByWithRelationInput);
  } else {
    // Default: sort by verified first, then average rating, then review count, then name
    orderBy.push({ isVerified: 'desc' } as Prisma.SupplierOrderByWithRelationInput);
    orderBy.push({ averageRating: 'desc' } as Prisma.SupplierOrderByWithRelationInput);
    orderBy.push({ reviewCount: 'desc' } as Prisma.SupplierOrderByWithRelationInput);
  }
  
  orderBy.push({ name: 'asc' });

  const query: Prisma.SupplierFindManyArgs = {
    where,
    include: supplierSummaryInclude,
    orderBy,
    take: take + 1,
  };

  if (params.cursor) {
    query.cursor = { id: params.cursor };
    query.skip = 1;
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany(query) as Promise<SupplierSummaryPayload[]>,
    prisma.supplier.count({ where }),
  ]);

  let nextCursor: number | null = null;
  if (suppliers.length > take) {
    const nextItem = suppliers.pop();
    nextCursor = nextItem ? nextItem.id : null;
  }

  return {
    items: suppliers.map((supplier) => mapSupplierSummary(supplier)),
    nextCursor,
    total,
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

  const flags = [];
  if (supplier.isVerified) {
    flags.push({ text: 'Verified', variant: 'verified' as const });
  }
  if (supplier.isScam) {
    flags.push({ text: 'Scam', variant: 'scam' as const });
  }

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
      isVerified: supplier.isVerified,
      isScam: supplier.isScam,
      flags,
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

export async function getSupplierByIdAdmin(supplierId: number) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      region: true,
      categories: { include: { category: true } },
      lotSizes: { include: { lotSize: true } },
    },
  });

  if (!supplier) {
    throw new Error('Supplier not found');
  }

  // Return all fields needed for admin editing
  return {
    id: supplier.id,
    name: supplier.name,
    slug: supplier.slug,
    shortDescription: supplier.shortDescription,
    description: supplier.description,
    website: supplier.website,
    phone: supplier.phone,
    email: supplier.email,
    heroImage: supplier.heroImage,
    logoImage: supplier.logoImage,
    isVerified: supplier.isVerified,
    isScam: supplier.isScam,
    minimumOrder: supplier.minimumOrder,
    leadTime: supplier.leadTime,
    specialties: supplier.specialties,
    certifications: supplier.certifications,
    badges: supplier.badges,
    logisticsNotes: supplier.logisticsNotes,
    pricingNotes: supplier.pricingNotes,
    homeRank: supplier.homeRank,
    regionId: supplier.regionId,
    categoryIds: supplier.categories.map((c) => c.categoryId),
    lotSizeIds: supplier.lotSizes.map((l) => l.lotSizeId),
  };
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Admin: Create a new supplier
export async function createSupplier(payload: {
  name: string;
  shortDescription?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  heroImage?: string;
  logoImage?: string;
  minimumOrder?: string;
  leadTime?: string;
  specialties?: string[];
  certifications?: string[];
  badges?: string[];
  logisticsNotes?: string;
  pricingNotes?: string;
  homeRank?: number;
  regionId?: number;
  categoryIds?: number[];
  lotSizeIds?: number[];
}) {
  const slug = generateSlug(payload.name);
  
  // Check if slug already exists
  const existing = await prisma.supplier.findUnique({ where: { slug } });
  if (existing) {
    throw new Error('A supplier with this name already exists');
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: payload.name,
      slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      website: payload.website,
      phone: payload.phone,
      email: payload.email,
      heroImage: payload.heroImage,
      logoImage: payload.logoImage,
      minimumOrder: payload.minimumOrder,
      leadTime: payload.leadTime,
      specialties: payload.specialties || [],
      certifications: payload.certifications || [],
      badges: payload.badges || [],
      logisticsNotes: payload.logisticsNotes,
      pricingNotes: payload.pricingNotes,
      homeRank: payload.homeRank || 0,
      regionId: payload.regionId,
      categories: payload.categoryIds
        ? {
            create: payload.categoryIds.map((categoryId) => ({ categoryId })),
          }
        : undefined,
      lotSizes: payload.lotSizeIds
        ? {
            create: payload.lotSizeIds.map((lotSizeId) => ({ lotSizeId })),
          }
        : undefined,
    },
    include: supplierSummaryInclude,
  });

  return mapSupplierSummary(supplier as SupplierSummaryPayload);
}

// Admin: Update an existing supplier
export async function updateSupplier(
  supplierId: number,
  payload: {
    name?: string;
    shortDescription?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    heroImage?: string;
    logoImage?: string;
    minimumOrder?: string;
    leadTime?: string;
    specialties?: string[];
    certifications?: string[];
    badges?: string[];
    logisticsNotes?: string;
    pricingNotes?: string;
    homeRank?: number;
    regionId?: number;
    categoryIds?: number[];
    lotSizeIds?: number[];
  }
) {
  const existing = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!existing) {
    throw new Error('Supplier not found');
  }

  // Generate new slug if name changed
  const slug = payload.name ? generateSlug(payload.name) : existing.slug;
  
  // Check if new slug conflicts with another supplier
  if (slug !== existing.slug) {
    const slugConflict = await prisma.supplier.findUnique({ where: { slug } });
    if (slugConflict) {
      throw new Error('A supplier with this name already exists');
    }
  }

  // Update categories and lot sizes
  if (payload.categoryIds !== undefined) {
    await prisma.supplierCategory.deleteMany({ where: { supplierId } });
    if (payload.categoryIds.length > 0) {
      await prisma.supplierCategory.createMany({
        data: payload.categoryIds.map((categoryId) => ({ supplierId, categoryId })),
      });
    }
  }

  if (payload.lotSizeIds !== undefined) {
    await prisma.supplierLotSize.deleteMany({ where: { supplierId } });
    if (payload.lotSizeIds.length > 0) {
      await prisma.supplierLotSize.createMany({
        data: payload.lotSizeIds.map((lotSizeId) => ({ supplierId, lotSizeId })),
      });
    }
  }

  const supplier = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      ...(payload.name && { name: payload.name, slug }),
      ...(payload.shortDescription !== undefined && { shortDescription: payload.shortDescription }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.website !== undefined && { website: payload.website }),
      ...(payload.phone !== undefined && { phone: payload.phone }),
      ...(payload.email !== undefined && { email: payload.email }),
      ...(payload.heroImage !== undefined && { heroImage: payload.heroImage }),
      ...(payload.logoImage !== undefined && { logoImage: payload.logoImage }),
      ...(payload.minimumOrder !== undefined && { minimumOrder: payload.minimumOrder }),
      ...(payload.leadTime !== undefined && { leadTime: payload.leadTime }),
      ...(payload.specialties !== undefined && { specialties: payload.specialties }),
      ...(payload.certifications !== undefined && { certifications: payload.certifications }),
      ...(payload.badges !== undefined && { badges: payload.badges }),
      ...(payload.logisticsNotes !== undefined && { logisticsNotes: payload.logisticsNotes }),
      ...(payload.pricingNotes !== undefined && { pricingNotes: payload.pricingNotes }),
      ...(payload.homeRank !== undefined && { homeRank: payload.homeRank }),
      ...(payload.regionId !== undefined && { regionId: payload.regionId }),
    },
    include: supplierSummaryInclude,
  });

  return mapSupplierSummary(supplier as SupplierSummaryPayload);
}

// Admin: Delete a supplier
export async function deleteSupplier(supplierId: number) {
  const existing = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!existing) {
    throw new Error('Supplier not found');
  }

  // Manually delete all related records before deleting the supplier
  // (Database foreign key constraints may not have CASCADE enabled)
  await prisma.$transaction(async (tx) => {
    // Delete reviews
    await tx.review.deleteMany({ where: { supplierId } });
    
    // Delete testimonials
    await tx.testimonial.deleteMany({ where: { supplierId } });
    
    // Delete resources
    await tx.supplierResource.deleteMany({ where: { supplierId } });
    
    // Delete category relationships
    await tx.supplierCategory.deleteMany({ where: { supplierId } });
    
    // Delete lot size relationships
    await tx.supplierLotSize.deleteMany({ where: { supplierId } });
    
    // Note: SupplierSubmission is not linked to suppliers - it's for customer submissions to become suppliers
    
    // Finally, delete the supplier
    await tx.supplier.delete({ where: { id: supplierId } });
  });

  return { message: 'Supplier deleted successfully' };
}

// Admin: Get all suppliers with pagination and filters
export async function getAllSuppliersAdmin(params: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.SupplierWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    if (search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
  }

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: {
        region: true,
        categories: { include: { category: true } },
        lotSizes: { include: { lotSize: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return {
    items: suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      slug: supplier.slug,
      email: supplier.email,
      averageRating: supplier.averageRating,
      reviewCount: supplier.reviewCount,
      // expose homeRank so admin UI can show/set "featured" state
      homeRank: supplier.homeRank ?? 0,
      createdAt: supplier.createdAt.toISOString(),
      region: supplier.region ? { name: supplier.region.name, slug: supplier.region.slug } : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
