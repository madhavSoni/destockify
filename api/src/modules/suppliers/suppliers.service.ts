import { Prisma } from '@prisma/client';
import prisma from '../../lib/prismaClient';

const supplierSummaryInclude = {
  categories: {
    include: {
      category: true,
    },
  },
  region: true,
  addresses: true,
} satisfies Prisma.SupplierInclude;

const supplierDetailInclude = {
  ...supplierSummaryInclude,
  reviews: {
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      customer: true,
    },
  },
} satisfies Prisma.SupplierInclude;

export type SupplierSummaryPayload = Prisma.SupplierGetPayload<{ include: typeof supplierSummaryInclude }>;
export type SupplierDetailPayload = Prisma.SupplierGetPayload<{ include: typeof supplierDetailInclude }>;

export interface SupplierListParams {
  category?: string;
  region?: string;
  state?: string;
  country?: string;
  search?: string;
  cursor?: number;
  limit?: number;
  homeOnly?: boolean;
  verified?: boolean;
  sort?: string;
  isContractHolder?: boolean;
  isBroker?: boolean;
}

export interface SupplierListResponse {
  items: Array<ReturnType<typeof mapSupplierSummary>>;
  nextCursor: number | null;
  total: number;
  availableFilters?: {
    states: Array<{ code: string; name: string; count: number }>;
    countries: Array<{ code: string; name: string; count: number }>;
    categories: Array<{ id: number; name: string; slug: string; count: number }>;
  };
}

export function mapSupplierSummary(supplier: SupplierSummaryPayload) {
  const flags = [];
  if (supplier.isVerified) {
    flags.push({ text: 'Verified', variant: 'verified' as const });
  }
  if (supplier.isScam) {
    flags.push({ text: 'Scam', variant: 'scam' as const });
  }

  // Get primary address or first address
  const primaryAddress = supplier.addresses && supplier.addresses.length > 0 
    ? supplier.addresses[0] 
    : null;

  return {
    slug: supplier.slug,
    name: supplier.name,
    shortDescription: supplier.shortDescription,
    heroImage: supplier.heroImage,
    logoImage: supplier.logoImage,
    isVerified: supplier.isVerified,
    isScam: supplier.isScam,
    flags,
    homeRank: supplier.homeRank ?? 0,
    addresses: supplier.addresses || [],
    city: primaryAddress?.city || null,
    state: primaryAddress?.state || null,
    country: primaryAddress?.country || null,
    region: supplier.region ? {
      slug: supplier.region.slug,
      name: supplier.region.name,
    } : null,
    categories: supplier.categories.map((item: (typeof supplier.categories)[number]) => ({
      slug: item.category.slug,
      name: item.category.name,
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
    };
  }

  const distribution = {
    oneStar: 0,
    twoStar: 0,
    threeStar: 0,
    fourStar: 0,
    fiveStar: 0,
  };

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
  }

  return {
    average: Number((overallTotal / reviews.length).toFixed(2)),
    count: reviews.length,
    distribution,
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
    where.region = {
      slug: params.region,
    };
  }

  if (params.state) {
    where.addresses = {
      some: {
        state: params.state,
      },
    };
  }

  if (params.country) {
    where.addresses = {
      some: {
        country: params.country,
      },
    };
  }

  if (params.verified !== undefined) {
    where.isVerified = params.verified;
  }

  // Supplier type filtering: if both are true, use OR logic (either contract holder OR broker)
  if (params.isContractHolder === true || params.isBroker === true) {
    if (params.isContractHolder === true && params.isBroker === true) {
      where.OR = [
        { isContractHolder: true },
        { isBroker: true },
      ];
    } else if (params.isContractHolder === true) {
      where.isContractHolder = true;
    } else if (params.isBroker === true) {
      where.isBroker = true;
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
        { addresses: { some: { city: { contains: search, mode: 'insensitive' } } } },
        { addresses: { some: { state: { contains: search, mode: 'insensitive' } } } },
        { addresses: { some: { country: { contains: search, mode: 'insensitive' } } } },
      ];
    }
  }

  // Build orderBy
  const orderBy: Prisma.SupplierOrderByWithRelationInput[] = [];
  
  if (params.sort) {
    switch (params.sort) {
      case 'name_asc':
        orderBy.push({ name: 'asc' });
        break;
      case 'name_desc':
        orderBy.push({ name: 'desc' });
        break;
      case 'rating_desc':
        // This would require a join with reviews - for now, keep default
        orderBy.push({ isVerified: 'desc' });
        orderBy.push({ name: 'asc' });
        break;
      case 'newest':
        orderBy.push({ createdAt: 'desc' });
        break;
      default:
        orderBy.push({ isVerified: 'desc' });
        orderBy.push({ name: 'asc' });
    }
  } else if (params.homeOnly) {
    orderBy.push({ homeRank: 'asc' } as Prisma.SupplierOrderByWithRelationInput);
  } else {
    // Default: sort by verified first, then name
    orderBy.push({ isVerified: 'desc' } as Prisma.SupplierOrderByWithRelationInput);
    orderBy.push({ name: 'asc' });
  }

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

  // Get available filters from database
  const [stateCounts, countryCounts, categoryCounts] = await Promise.all([
    prisma.supplierAddress.groupBy({
      by: ['state'],
      where: {
        state: { not: null },
        supplier: {
          ...where,
        },
      },
      _count: {
        state: true,
      },
    }),
    prisma.supplierAddress.groupBy({
      by: ['country'],
      where: {
        country: { not: null },
        supplier: {
          ...where,
        },
      },
      _count: {
        country: true,
      },
    }),
    prisma.supplierCategory.groupBy({
      by: ['categoryId'],
      where: {
        supplier: {
          ...where,
        },
      },
      _count: {
        categoryId: true,
      },
    }),
  ]);

  // Get category details
  const categoryIds = categoryCounts.map(c => c.categoryId);
  const categories = categoryIds.length > 0 
    ? await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Get ratings for all suppliers
  const supplierIds = suppliers.map(s => s.id);
  const reviews = supplierIds.length > 0 ? await prisma.review.findMany({
    where: {
      supplierId: { in: supplierIds },
      isApproved: true,
    },
    select: {
      supplierId: true,
      ratingOverall: true,
    },
  }) : [];

  // Calculate average rating per supplier
  const ratingsBySupplier = new Map<number, { average: number; count: number }>();
  for (const review of reviews) {
    const existing = ratingsBySupplier.get(review.supplierId) || { average: 0, count: 0 };
    existing.average = (existing.average * existing.count + review.ratingOverall) / (existing.count + 1);
    existing.count += 1;
    ratingsBySupplier.set(review.supplierId, existing);
  }

  return {
    items: suppliers.map((supplier) => {
      const summary = mapSupplierSummary(supplier);
      const rating = ratingsBySupplier.get(supplier.id);
      return {
        ...summary,
        ratingAverage: rating ? Number(rating.average.toFixed(1)) : null,
        ratingCount: rating?.count || 0,
      };
    }),
    nextCursor,
    total,
    availableFilters: {
      states: stateCounts
        .filter(s => s.state)
        .map(s => ({ code: s.state!, name: s.state!, count: s._count.state })),
      countries: countryCounts
        .filter(c => c.country)
        .map(c => ({ code: c.country!, name: c.country!, count: c._count.country })),
      categories: categoryCounts
        .map(c => {
          const category = categoryMap.get(c.categoryId);
          return category ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            count: c._count.categoryId,
          } : null;
        })
        .filter((c): c is NonNullable<typeof c> => c !== null),
    },
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
    author: review.author,
    ratingOverall: review.ratingOverall,
    body: review.body,
    images: review.images,
    publishedAt: review.createdAt.toISOString(),
  }));

  const relatedSuppliers = await prisma.supplier.findMany({
    where: {
      id: { not: supplier.id },
      categories: {
        some: {
          categoryId: {
            in: supplier.categories.map((entry: (typeof supplier.categories)[number]) => entry.categoryId),
          },
        },
      },
    },
    include: supplierSummaryInclude,
    orderBy: [
      { homeRank: 'asc' as const },
      { name: 'asc' as const },
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
      isVerified: supplier.isVerified,
      isScam: supplier.isScam,
      isContractHolder: supplier.isContractHolder,
      isBroker: supplier.isBroker,
      flags,
      socialLink: supplier.socialLink,
      addresses: supplier.addresses || [],
      region: supplier.region ? {
        slug: supplier.region.slug,
        name: supplier.region.name,
        headline: supplier.region.headline,
      } : null,
      categories: supplier.categories.map((item) => ({
        slug: item.category.slug,
        name: item.category.name,
        headline: item.category.headline,
      })),
    },
    reviewSummary,
    recentReviews,
    relatedSuppliers: relatedSuppliers.map((related) => mapSupplierSummary(related as SupplierSummaryPayload)),
  };
}

export async function getSupplierByIdAdmin(supplierId: number) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      categories: { include: { category: true } },
      region: true,
      images: {
        orderBy: { order: 'asc' },
      },
      addresses: {
        orderBy: { createdAt: 'asc' },
      },
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
    isContractHolder: supplier.isContractHolder,
    isBroker: supplier.isBroker,
    homeRank: supplier.homeRank,
    socialLink: supplier.socialLink,
    regionId: supplier.regionId,
    categoryIds: supplier.categories.map((c) => c.categoryId),
    addresses: supplier.addresses.map((addr) => ({
      id: addr.id,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      zipCode: addr.zipCode,
    })),
    images: supplier.images.map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      isPrimary: img.isPrimary,
      order: img.order,
    })),
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
  homeRank?: number;
  socialLink?: string;
  regionId?: number;
  categoryIds?: number[];
  addresses?: Array<{
    streetAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }>;
  images?: Array<{ url: string; caption?: string; isPrimary?: boolean; order?: number }>;
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
      homeRank: payload.homeRank || 0,
      socialLink: payload.socialLink,
      regionId: payload.regionId,
      categories: payload.categoryIds
        ? {
            create: payload.categoryIds.map((categoryId) => ({ categoryId })),
          }
        : undefined,
      addresses: payload.addresses && payload.addresses.length > 0
        ? {
            create: payload.addresses.map((addr) => ({
              streetAddress: addr.streetAddress || null,
              city: addr.city || null,
              state: addr.state || null,
              country: addr.country || null,
              zipCode: addr.zipCode || null,
            })),
          }
        : undefined,
      images: payload.images
        ? {
            create: payload.images.map((img, idx) => ({
              url: img.url,
              caption: img.caption || null,
              isPrimary: img.isPrimary || false,
              order: img.order ?? idx,
            })),
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
    slug?: string;
    shortDescription?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    heroImage?: string;
    logoImage?: string;
    isVerified?: boolean;
    isScam?: boolean;
    isContractHolder?: boolean;
    isBroker?: boolean;
    homeRank?: number;
    socialLink?: string;
    regionId?: number;
    categoryIds?: number[];
    addresses?: Array<{
      id?: number;
      streetAddress?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    }>;
    images?: Array<{ id?: number; url: string; caption?: string; isPrimary?: boolean; order?: number }>;
  }
) {
  const existing = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!existing) {
    throw new Error('Supplier not found');
  }

  // Determine slug: use provided slug, or generate from name, or keep existing
  let slug = existing.slug;
  if (payload.slug) {
    slug = payload.slug;
  } else if (payload.name) {
    slug = generateSlug(payload.name);
  }
  
  // Check if new slug conflicts with another supplier
  if (slug !== existing.slug) {
    const slugConflict = await prisma.supplier.findUnique({ where: { slug } });
    if (slugConflict) {
      throw new Error('A supplier with this slug already exists');
    }
  }

  // Update categories
  if (payload.categoryIds !== undefined) {
    await prisma.supplierCategory.deleteMany({ where: { supplierId } });
    if (payload.categoryIds.length > 0) {
      await prisma.supplierCategory.createMany({
        data: payload.categoryIds.map((categoryId) => ({ supplierId, categoryId })),
      });
    }
  }

  // Update addresses if provided
  if (payload.addresses !== undefined) {
    // Delete all existing addresses
    await prisma.supplierAddress.deleteMany({ where: { supplierId } });
    
    // Create new addresses
    if (payload.addresses.length > 0) {
      await prisma.supplierAddress.createMany({
        data: payload.addresses.map((addr) => ({
          supplierId,
          streetAddress: addr.streetAddress || null,
          city: addr.city || null,
          state: addr.state || null,
          country: addr.country || null,
          zipCode: addr.zipCode || null,
        })),
      });
    }
  }

  // Update images if provided
  if (payload.images !== undefined) {
    // Delete all existing images
    await prisma.supplierImage.deleteMany({ where: { supplierId } });
    
    // Create new images
    if (payload.images.length > 0) {
      await prisma.supplierImage.createMany({
        data: payload.images.map((img, idx) => ({
          supplierId,
          url: img.url,
          caption: img.caption || null,
          isPrimary: img.isPrimary || false,
          order: img.order ?? idx,
        })),
      });
    }
  }

  const supplier = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(slug !== existing.slug && { slug }),
      ...(payload.shortDescription !== undefined && { shortDescription: payload.shortDescription }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.website !== undefined && { website: payload.website }),
      ...(payload.phone !== undefined && { phone: payload.phone }),
      ...(payload.email !== undefined && { email: payload.email }),
      ...(payload.heroImage !== undefined && { heroImage: payload.heroImage }),
      ...(payload.logoImage !== undefined && { logoImage: payload.logoImage }),
      ...(payload.isVerified !== undefined && { isVerified: payload.isVerified }),
      ...(payload.isScam !== undefined && { isScam: payload.isScam }),
      ...(payload.isContractHolder !== undefined && { isContractHolder: payload.isContractHolder }),
      ...(payload.isBroker !== undefined && { isBroker: payload.isBroker }),
      ...(payload.homeRank !== undefined && { homeRank: payload.homeRank }),
      ...(payload.socialLink !== undefined && { socialLink: payload.socialLink }),
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
    
    // Delete category relationships
    await tx.supplierCategory.deleteMany({ where: { supplierId } });
    
    // Delete images
    await tx.supplierImage.deleteMany({ where: { supplierId } });
    
    // Delete addresses
    await tx.supplierAddress.deleteMany({ where: { supplierId } });
    
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
        categories: { include: { category: true } },
        region: true,
        addresses: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return {
    items: suppliers.map((supplier) => {
      const primaryAddress = supplier.addresses && supplier.addresses.length > 0 
        ? supplier.addresses[0] 
        : null;
      return {
        id: supplier.id,
        name: supplier.name,
        slug: supplier.slug,
        email: supplier.email,
        isVerified: supplier.isVerified,
        isScam: supplier.isScam,
        // expose homeRank so admin UI can show/set "featured" state
        homeRank: supplier.homeRank ?? 0,
        createdAt: supplier.createdAt.toISOString(),
        logoImage: supplier.logoImage,
        heroImage: supplier.heroImage,
        city: primaryAddress?.city || null,
        state: primaryAddress?.state || null,
        country: primaryAddress?.country || null,
        region: supplier.region ? {
          id: supplier.region.id,
          name: supplier.region.name,
          slug: supplier.region.slug,
        } : null,
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Address CRUD operations
export async function createSupplierAddress(
  supplierId: number,
  payload: {
    streetAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }
) {
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    throw new Error('Supplier not found');
  }

  const address = await prisma.supplierAddress.create({
    data: {
      supplierId,
      streetAddress: payload.streetAddress || null,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || null,
      zipCode: payload.zipCode || null,
    },
  });

  return address;
}

export async function updateSupplierAddress(
  addressId: number,
  payload: {
    streetAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }
) {
  const address = await prisma.supplierAddress.findUnique({ where: { id: addressId } });
  if (!address) {
    throw new Error('Address not found');
  }

  const updated = await prisma.supplierAddress.update({
    where: { id: addressId },
    data: {
      ...(payload.streetAddress !== undefined && { streetAddress: payload.streetAddress || null }),
      ...(payload.city !== undefined && { city: payload.city || null }),
      ...(payload.state !== undefined && { state: payload.state || null }),
      ...(payload.country !== undefined && { country: payload.country || null }),
      ...(payload.zipCode !== undefined && { zipCode: payload.zipCode || null }),
    },
  });

  return updated;
}

export async function deleteSupplierAddress(addressId: number) {
  const address = await prisma.supplierAddress.findUnique({ where: { id: addressId } });
  if (!address) {
    throw new Error('Address not found');
  }

  await prisma.supplierAddress.delete({ where: { id: addressId } });
  return { message: 'Address deleted successfully' };
}
