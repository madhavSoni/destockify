'use client';

import { useState, useCallback } from 'react';
import { WriteReviewSection } from './write-review-section';
import { ReviewsSection } from './reviews-section';

type Supplier = {
  id: number;
  name: string;
  slug: string;
};

type ReviewSummary = {
  average: number | null;
  count: number;
  distribution: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
};

type RecentReview = {
  author: string;
  ratingOverall: number;
  body: string;
  publishedAt?: string;
};

export function ReviewsWrapper({
  supplier,
  supplierId,
  recentReviews,
  reviewSummary,
}: {
  supplier: Supplier;
  supplierId: string;
  recentReviews: RecentReview[];
  reviewSummary: ReviewSummary;
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewCreated = useCallback(() => {
    // Trigger a refresh in ReviewsSection
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <>
      <WriteReviewSection supplier={supplier} onReviewCreated={handleReviewCreated} />
      <ReviewsSection
        key={refreshTrigger}
        supplierId={supplierId}
        supplierName={supplier.name}
        recentReviews={recentReviews}
        reviewSummary={reviewSummary}
      />
    </>
  );
}
