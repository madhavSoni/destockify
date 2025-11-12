import prisma from '../../lib/prismaClient';

export async function getDashboardStats() {
  const [
    totalSuppliers,
    totalReviews,
    pendingReviews,
    recentSuppliers,
    recentReviews,
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  return {
    stats: {
      totalSuppliers,
      totalReviews,
      pendingReviews,
    },
    recentActivity: {
      suppliers: recentSuppliers.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        createdAt: s.createdAt.toISOString(),
      })),
      reviews: recentReviews.map((r) => ({
        id: r.id,
        title: r.title,
        rating: r.ratingOverall,
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
        supplier: {
          id: r.supplier.id,
          name: r.supplier.name,
          slug: r.supplier.slug,
        },
        reviewer: `${r.customer.firstName} ${r.customer.lastName}`,
      })),
    },
  };
}

