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
  const review = await prisma.review.create({
    data: {
      customerId,
      supplierId,
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
