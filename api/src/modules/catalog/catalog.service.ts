import prisma from '../../lib/prismaClient';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ name: 'asc' }],
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return categories.map((category: (typeof categories)[number]) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    headline: category.headline,
    description: category.description,
    icon: category.icon,
    supplierCount: category._count.suppliers,
  }));
}

export async function getCategoryById(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    headline: category.headline,
    description: category.description,
    icon: category.icon,
    supplierCount: category._count.suppliers,
  };
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  headline?: string;
  description?: string;
  icon?: string;
}) {
  const slug = data.slug || generateSlug(data.name);

  // Check if slug already exists
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error('A category with this name or slug already exists');
  }

  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug,
      headline: data.headline?.trim() || null,
      description: data.description?.trim() || null,
      icon: data.icon?.trim() || null,
    },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    headline: category.headline,
    description: category.description,
    icon: category.icon,
    supplierCount: category._count.suppliers,
  };
}

export async function updateCategory(
  id: number,
  data: {
    name?: string;
    slug?: string;
    headline?: string;
    description?: string;
    icon?: string;
  }
) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Category not found');
  }

  // Determine slug: use provided slug, or generate from name, or keep existing
  let slug = existing.slug;
  if (data.slug) {
    slug = data.slug;
  } else if (data.name) {
    slug = generateSlug(data.name);
  }

  // Check if new slug conflicts with another category
  if (slug !== existing.slug) {
    const slugConflict = await prisma.category.findUnique({ where: { slug } });
    if (slugConflict) {
      throw new Error('A category with this slug already exists');
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(slug !== existing.slug && { slug }),
      ...(data.headline !== undefined && {
        headline: data.headline?.trim() || null,
      }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
      ...(data.icon !== undefined && { icon: data.icon?.trim() || null }),
    },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    headline: category.headline,
    description: category.description,
    icon: category.icon,
    supplierCount: category._count.suppliers,
  };
}

export async function deleteCategory(id: number) {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  if (!existing) {
    throw new Error('Category not found');
  }

  if (existing._count.suppliers > 0) {
    throw new Error(
      `Cannot delete category: ${existing._count.suppliers} supplier(s) are associated with this category. Please remove all supplier associations first.`
    );
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Category deleted successfully' };
}

export async function listRegions() {
  const regions = await prisma.region.findMany({
    orderBy: [{ name: 'asc' }],
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return regions.map((region: (typeof regions)[number]) => ({
    id: region.id,
    slug: region.slug,
    name: region.name,
    headline: region.headline,
    description: region.description,
    stateCode: region.stateCode,
    marketStats: region.marketStats,
    mapImage: region.mapImage,
    supplierCount: region._count.suppliers,
  }));
}

export async function getRegionById(id: number) {
  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  if (!region) {
    throw new Error('Region not found');
  }

  return {
    id: region.id,
    slug: region.slug,
    name: region.name,
    headline: region.headline,
    description: region.description,
    stateCode: region.stateCode,
    marketStats: region.marketStats,
    mapImage: region.mapImage,
    supplierCount: region._count.suppliers,
  };
}

export async function createRegion(data: {
  name: string;
  slug?: string;
  headline?: string;
  description?: string;
  stateCode?: string;
  marketStats?: any;
  mapImage?: string;
}) {
  const slug = data.slug || generateSlug(data.name);

  // Check if slug already exists
  const existing = await prisma.region.findUnique({ where: { slug } });
  if (existing) {
    throw new Error('A region with this name or slug already exists');
  }

  const region = await prisma.region.create({
    data: {
      name: data.name.trim(),
      slug,
      headline: data.headline?.trim() || null,
      description: data.description?.trim() || null,
      stateCode: data.stateCode?.trim() || null,
      marketStats: data.marketStats || null,
      mapImage: data.mapImage?.trim() || null,
    },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return {
    id: region.id,
    slug: region.slug,
    name: region.name,
    headline: region.headline,
    description: region.description,
    stateCode: region.stateCode,
    marketStats: region.marketStats,
    mapImage: region.mapImage,
    supplierCount: region._count.suppliers,
  };
}

export async function updateRegion(
  id: number,
  data: {
    name?: string;
    slug?: string;
    headline?: string;
    description?: string;
    stateCode?: string;
    marketStats?: any;
    mapImage?: string;
  }
) {
  const existing = await prisma.region.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Region not found');
  }

  // Determine slug: use provided slug, or generate from name, or keep existing
  let slug = existing.slug;
  if (data.slug) {
    slug = data.slug;
  } else if (data.name) {
    slug = generateSlug(data.name);
  }

  // Check if new slug conflicts with another region
  if (slug !== existing.slug) {
    const slugConflict = await prisma.region.findUnique({ where: { slug } });
    if (slugConflict) {
      throw new Error('A region with this slug already exists');
    }
  }

  const region = await prisma.region.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(slug !== existing.slug && { slug }),
      ...(data.headline !== undefined && {
        headline: data.headline?.trim() || null,
      }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
      ...(data.stateCode !== undefined && {
        stateCode: data.stateCode?.trim() || null,
      }),
      ...(data.marketStats !== undefined && { marketStats: data.marketStats }),
      ...(data.mapImage !== undefined && {
        mapImage: data.mapImage?.trim() || null,
      }),
    },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return {
    id: region.id,
    slug: region.slug,
    name: region.name,
    headline: region.headline,
    description: region.description,
    stateCode: region.stateCode,
    marketStats: region.marketStats,
    mapImage: region.mapImage,
    supplierCount: region._count.suppliers,
  };
}

export async function deleteRegion(id: number) {
  const existing = await prisma.region.findUnique({
    where: { id },
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  if (!existing) {
    throw new Error('Region not found');
  }

  if (existing._count.suppliers > 0) {
    throw new Error(
      `Cannot delete region: ${existing._count.suppliers} supplier(s) are associated with this region. Please remove all supplier associations first.`
    );
  }

  await prisma.region.delete({ where: { id } });
  return { message: 'Region deleted successfully' };
}


