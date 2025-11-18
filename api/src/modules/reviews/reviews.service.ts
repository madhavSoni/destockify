import prisma from '../../lib/prismaClient';

// Customer: Create a new review
export async function createReview(payload: {
  customerId: number;
  supplierId: number;
  title?: string;
  ratingOverall: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights?: string[];
  body: string;
  images?: string[];
}) {
  const {
    customerId,
    supplierId,
    title,
    ratingOverall,
    ratingAccuracy,
    ratingLogistics,
    ratingValue,
    ratingCommunication,
    highlights,
    body,
    images,
  } = payload;

  // Validate customer exists and is verified
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  if (!customer.isVerified) {
    throw new Error('Email must be verified before posting reviews');
  }

  // Validate supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new Error('Supplier not found');
  }

  // Create review (not approved by default)
  // Note: author field is required by database schema (derived from customer name)
  const authorName = `${customer.firstName} ${customer.lastName}`.trim() || 'Anonymous';
  const review = await prisma.review.create({
    data: {
      customerId,
      supplierId,
      author: authorName, // Required field in database
      company: null, // Optional field
      title: title || null,
      ratingOverall,
      ratingAccuracy: ratingAccuracy || null,
      ratingLogistics: ratingLogistics || null,
      ratingValue: ratingValue || null,
      ratingCommunication: ratingCommunication || null,
      highlights: highlights || [],
      body,
      images: images || [],
      isApproved: false,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    message: 'Review submitted successfully! It will be visible after admin approval.',
    review,
  };
}

// Customer: Update their own review
export async function updateReview(payload: {
  reviewId: number;
  customerId: number;
  title?: string;
  ratingOverall?: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights?: string[];
  body?: string;
  images?: string[];
}) {
  const { reviewId, customerId, ...updateData } = payload;

  // Find review and verify ownership
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.customerId !== customerId) {
    throw new Error('You can only edit your own reviews');
  }

  // Update review (reset approval status if it was approved)
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...updateData,
      isApproved: false, // Reset approval when edited
      approvedAt: null,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    message: 'Review updated successfully! It will need to be re-approved by admin.',
    review: updatedReview,
  };
}

// Customer: Delete their own review
export async function deleteReview(payload: {
  reviewId: number;
  customerId: number;
}) {
  const { reviewId, customerId } = payload;

  // Find review and verify ownership
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.customerId !== customerId) {
    throw new Error('You can only delete your own reviews');
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return {
    message: 'Review deleted successfully',
  };
}

// Customer: Get their own reviews
export async function getMyReviews(customerId: number) {
  const reviews = await prisma.review.findMany({
    where: { customerId },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
}

// Admin: Approve a review
export async function approveReview(reviewId: number) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.isApproved) {
    throw new Error('Review is already approved');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      isApproved: true,
      approvedAt: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update supplier's average rating and review count
  await updateSupplierRatings(review.supplierId);

  return {
    message: 'Review approved successfully',
    review: updatedReview,
  };
}

// Admin: Unapprove a review (soft moderation)
export async function unapproveReview(payload: {
  reviewId: number;
  moderationNotes?: string;
}) {
  const { reviewId, moderationNotes } = payload;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (!review.isApproved) {
    throw new Error('Review is already unapproved');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      isApproved: false,
      approvedAt: null,
      moderationNotes: moderationNotes || null,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update supplier's average rating and review count
  await updateSupplierRatings(review.supplierId);

  return {
    message: 'Review unapproved successfully',
    review: updatedReview,
  };
}

// Admin: Get all reviews with filters
export async function getAllReviewsAdmin(params: {
  status?: 'approved' | 'pending' | 'rejected';
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.status === 'approved') {
    where.isApproved = true;
  } else if (params.status === 'pending') {
    where.isApproved = false;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { isTrending: 'desc' }, // Trending reviews first
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items: reviews.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      ratingOverall: r.ratingOverall,
      isApproved: r.isApproved,
      isTrending: r.isTrending,
      createdAt: r.createdAt.toISOString(),
      approvedAt: r.approvedAt?.toISOString() || null,
      customer: {
        id: r.customer.id,
        name: `${r.customer.firstName} ${r.customer.lastName}`,
        email: r.customer.email,
      },
      supplier: {
        id: r.supplier.id,
        name: r.supplier.name,
        slug: r.supplier.slug,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Admin: Delete any review (hard delete)
export async function adminDeleteReview(reviewId: number) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  const supplierId = review.supplierId;

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update supplier's average rating and review count
  await updateSupplierRatings(supplierId);

  return {
    message: 'Review deleted permanently',
  };
}

// Admin: Get reviews by supplier ID
export async function getReviewsBySupplierAdmin(supplierId: number) {
  const reviews = await prisma.review.findMany({
    where: { supplierId },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews.map((r) => ({
    id: r.id,
    title: r.title,
    author: r.author,
    company: r.company,
    ratingOverall: r.ratingOverall,
    ratingAccuracy: r.ratingAccuracy,
    ratingLogistics: r.ratingLogistics,
    ratingValue: r.ratingValue,
    ratingCommunication: r.ratingCommunication,
    highlights: r.highlights,
    body: r.body,
    images: r.images,
    isApproved: r.isApproved,
    moderationNotes: r.moderationNotes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    approvedAt: r.approvedAt?.toISOString() || null,
    customer: {
      id: r.customer.id,
      name: `${r.customer.firstName} ${r.customer.lastName}`,
      email: r.customer.email,
    },
  }));
}

// Admin: Update any review
export async function adminUpdateReview(payload: {
  reviewId: number;
  title?: string;
  body?: string;
  ratingOverall?: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights?: string[];
  images?: string[];
  createdAt?: string; // ISO date string
  isApproved?: boolean;
  isTrending?: boolean;
}) {
  const { reviewId, createdAt, ...updateData } = payload;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  const data: any = { ...updateData };
  
  // Handle date update - accept both ISO strings and date strings (YYYY-MM-DD)
  if (createdAt) {
    // If it's already a full ISO string, use it directly
    // Otherwise, treat it as YYYY-MM-DD and convert to Date in UTC (prevents timezone shifts)
    const dateValue = createdAt.includes('T') 
      ? new Date(createdAt) 
      : new Date(createdAt + 'T00:00:00.000Z');
    
    // Validate the date
    if (isNaN(dateValue.getTime())) {
      throw new Error('Invalid date format');
    }
    
    data.createdAt = dateValue;
    console.log('Updating review date:', { input: createdAt, parsed: dateValue.toISOString(), date: dateValue.toDateString() });
  }

  // If approving, set approvedAt
  if (updateData.isApproved === true && !review.isApproved) {
    data.approvedAt = new Date();
  } else if (updateData.isApproved === false && review.isApproved) {
    data.approvedAt = null;
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update supplier ratings if rating changed or approval status changed
  if (updateData.ratingOverall !== undefined || updateData.isApproved !== undefined) {
    await updateSupplierRatings(review.supplierId);
  }

  return {
    message: 'Review updated successfully',
    review: updatedReview,
  };
}

// Admin: Create review (bypasses customer verification)
export async function adminCreateReview(payload: {
  supplierId: number;
  customerId?: number; // Optional - can create without customer
  title?: string;
  author: string;
  company?: string;
  ratingOverall: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights?: string[];
  body: string;
  images?: string[];
  isApproved?: boolean;
  createdAt?: string; // ISO date string
}) {
  const {
    supplierId,
    customerId,
    title,
    author,
    company,
    ratingOverall,
    ratingAccuracy,
    ratingLogistics,
    ratingValue,
    ratingCommunication,
    highlights,
    body,
    images,
    isApproved = true, // Admin-created reviews are approved by default
    createdAt,
  } = payload;

  // Validate supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new Error('Supplier not found');
  }

  // If customerId provided, validate it exists
  if (customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new Error('Customer not found');
    }
  }

  const data: any = {
    supplierId,
    customerId: customerId || 1, // Use a default customer if none provided (you may want to create a system customer)
    author,
    company: company || null,
    title: title || null,
    ratingOverall,
    ratingAccuracy: ratingAccuracy || null,
    ratingLogistics: ratingLogistics || null,
    ratingValue: ratingValue || null,
    ratingCommunication: ratingCommunication || null,
    highlights: highlights || [],
    body,
    images: images || [],
    isApproved,
    approvedAt: isApproved ? new Date() : null,
  };

  if (createdAt) {
    data.createdAt = new Date(createdAt);
  }

  const review = await prisma.review.create({
    data,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update supplier ratings
  await updateSupplierRatings(supplierId);

  return {
    message: 'Review created successfully',
    review,
  };
}

// Helper: Update supplier's average rating and review count
async function updateSupplierRatings(supplierId: number) {
  const approvedReviews = await prisma.review.findMany({
    where: {
      supplierId,
      isApproved: true,
    },
    select: {
      ratingOverall: true,
    },
  });

  const reviewCount = approvedReviews.length;
  const averageRating = reviewCount > 0
    ? approvedReviews.reduce((sum, r) => sum + r.ratingOverall, 0) / reviewCount
    : 0;

  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    },
  });
}
