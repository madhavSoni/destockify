'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, type ReviewResponse, type UpdateReviewPayload } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

export function ReviewsSection({
  supplierId,
  supplierName,
  recentReviews,
  reviewSummary,
}: {
  supplierId: string;
  supplierName: string;
  recentReviews: RecentReview[];
  reviewSummary: ReviewSummary;
}) {
  const { isAuthenticated, authToken, user } = useAuth();
  const router = useRouter();
  const [myReviews, setMyReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    ratingOverall: 5,
    body: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadMyReviews();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authToken]);

  const loadMyReviews = async () => {
    if (!authToken) return;
    
    try {
      const reviews = await api.reviews.getMyReviews(authToken);
      // Filter to only show reviews for this supplier
      const supplierReviews = reviews.filter(r => r.supplier.slug === supplierId);
      setMyReviews(supplierReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (review: ReviewResponse) => {
    setEditingReview(review.id);
    setEditForm({
      ratingOverall: review.ratingOverall,
      body: review.body,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setError(null);
  };

  const handleUpdate = async (reviewId: number) => {
    if (!authToken) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.reviews.update(reviewId, {
        ratingOverall: editForm.ratingOverall,
        body: editForm.body,
      }, authToken);

      await loadMyReviews();
      setEditingReview(null);
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!authToken) return;

    try {
      await api.reviews.delete(reviewId, authToken);
      setMyReviews(prev => prev.filter(r => r.id !== reviewId));
      setDeleteConfirmId(null);
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to delete review');
      setDeleteConfirmId(null);
    }
  };

  // Show my pending/unapproved reviews at the top
  const myPendingReviews = myReviews.filter(r => !r.isApproved);
  const hasMyReview = myReviews.length > 0;

  return (
    <section className="rounded-md border border-black/10 bg-white shadow-md p-6 sm:p-8 lg:p-10">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-black/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/5">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h2 className="font-bold text-2xl text-black">
          {supplierName}: Read Reviews
        </h2>
      </div>

      {/* Review Summary */}
      {reviewSummary.count > 0 && (
        <div className="mb-8 rounded-md border-2 border-black/10 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-black mb-4">
                {reviewSummary.average?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mb-4">
                <RatingStars rating={reviewSummary.average || 0} />
              </div>
              <div className="text-base font-semibold text-black/50">
                Based on {reviewSummary.count} {reviewSummary.count === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-4">
              {[
                { stars: 5, count: reviewSummary.distribution.fiveStar },
                { stars: 4, count: reviewSummary.distribution.fourStar },
                { stars: 3, count: reviewSummary.distribution.threeStar },
                { stars: 2, count: reviewSummary.distribution.twoStar },
                { stars: 1, count: reviewSummary.distribution.oneStar },
              ].map(({ stars, count }) => {
                const percentage = reviewSummary.count > 0 ? (count / reviewSummary.count) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="w-14 text-sm font-semibold text-black flex items-center gap-1.5">
                      {stars}
                      <svg className="w-4 h-4" fill="#3388FF" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="flex-1 h-4 bg-black/10 rounded-md overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-blue-600 rounded-md transition-all duration-500 shadow-sm"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-semibold text-black/70 text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* My Pending Reviews (only visible to me) */}
      {myPendingReviews.map((review) => (
        <div key={review.id} className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 sm:p-6">
          {editingReview === review.id ? (
            /* Edit Form */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-xl text-slate-900">Edit Your Review</h3>
                <button
                  onClick={cancelEdit}
                  className="rounded-lg w-8 h-8 flex items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-all font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm font-medium text-blue-900">
                <span className="mr-2">ℹ️</span>
                Your edits will need to be re-approved by our team
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(review.id); }} className="space-y-4 sm:space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-3">
                    Overall Rating *
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <InteractiveStars 
                      rating={editForm.ratingOverall} 
                      onRatingChange={(rating) => setEditForm(prev => ({ ...prev, ratingOverall: rating }))}
                    />
                    <span className="ml-2 text-xl font-semibold text-slate-900">{editForm.ratingOverall.toFixed(1)}</span>
                  </div>
                </div>

                {/* Review Body */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    value={editForm.body}
                    onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
                    placeholder="Share your experience with this supplier..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-lg border border-blue-600 bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Review'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="h-12 rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Display Mode */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-amber-200 px-3 py-1.5 text-xs font-medium text-amber-900 mb-2">
                    ⏳ Pending Approval
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Your Review</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(review)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(review.id)}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:border-red-400 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <RatingStars rating={review.ratingOverall} />
                <span className="text-base font-semibold text-slate-900">{review.ratingOverall.toFixed(1)}</span>
              </div>

              {/* highlights not available in ReviewResponse */}

              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{review.body}</p>

              <div className="mt-4 text-sm text-slate-600">
                By {user?.firstName} {user?.lastName} • {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Public Reviews */}
      <div className="space-y-6">
        {recentReviews.length === 0 && myPendingReviews.length === 0 && (
          <div className="text-center py-16 px-4 rounded-md border-2 border-dashed border-black/10 bg-black/5">
            <svg className="w-20 h-20 mx-auto mb-4 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="font-semibold text-lg text-black/70">No reviews yet. Be the first to review this supplier!</p>
          </div>
        )}

        {recentReviews.map((review, index) => (
          <div
            key={index}
            className="rounded-md border-2 border-black/10 bg-white p-6 sm:p-8 hover:border-blue-600 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={review.ratingOverall} />
              <span className="text-lg font-bold text-black">{review.ratingOverall.toFixed(1)}</span>
            </div>

            <p className="text-black/70 leading-relaxed mb-4">{review.body}</p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-black/50">
              <div>
                By <span className="font-medium">{review.author}</span>
              </div>
              {review.publishedAt && (
                <div>{new Date(review.publishedAt).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl p-6 sm:p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-md bg-black/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-xl text-black mb-2">
                Delete Review?
              </h3>
              <p className="text-black/70 text-sm">
                This action cannot be undone. Your review will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-11 rounded-md border border-black/10 bg-white px-4 py-2 text-base font-medium text-black hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 h-11 rounded-md border border-black bg-black px-4 py-2 text-base font-semibold text-white transition-all hover:bg-black/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalf;
        
        return (
          <svg
            key={i}
            className="w-5 h-5"
            fill={isFilled ? "#3388FF" : isHalf ? "#3388FF" : "none"}
            stroke="#3388FF"
            strokeWidth={isFilled || isHalf ? 0 : 1.5}
            viewBox="0 0 24 24"
          >
            {isHalf ? (
              <>
                <defs>
                  <linearGradient id={`half-review-${i}`}>
                    <stop offset="50%" stopColor="#3388FF" />
                    <stop offset="50%" stopColor="white" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-review-${i})`}
                  stroke="#3388FF"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </>
            ) : (
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

function InteractiveStars({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8"
            fill={star <= rating ? "#3388FF" : "none"}
            stroke="#3388FF"
            strokeWidth={star <= rating ? 0 : 1.5}
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
