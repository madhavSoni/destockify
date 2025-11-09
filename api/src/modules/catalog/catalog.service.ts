import prisma from '../../lib/prismaClient';

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
    slug: category.slug,
    name: category.name,
    headline: category.headline,
    description: category.description,
    icon: category.icon,
    supplierCount: category._count.suppliers,
  }));
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

export async function listLotSizes() {
  const lotSizes = await prisma.lotSize.findMany({
    orderBy: [{ minUnits: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { suppliers: true },
      },
    },
  });

  return lotSizes.map((lotSize: (typeof lotSizes)[number]) => ({
    slug: lotSize.slug,
    name: lotSize.name,
    headline: lotSize.headline,
    description: lotSize.description,
    minUnits: lotSize.minUnits,
    maxUnits: lotSize.maxUnits,
    supplierCount: lotSize._count.suppliers,
  }));
}

