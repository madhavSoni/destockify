'use client';

import { useState, useEffect } from 'react';
import { Patrick_Hand } from 'next/font/google';
import { useAuth } from '@/contexts/AuthContext';
import { api, type ReviewResponse, type UpdateReviewPayload } from '@/lib/api';
import { useRouter } from 'next/navigation';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

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
  aspects: {
    accuracy: number | null;
    logistics: number | null;
    value: number | null;
    communication: number | null;
  };
};

type RecentReview = {
  title: string;
  author: string;
  company?: string | null;
  ratingOverall: number;
  highlights?: string[];
  body: string;
  publishedAt?: string;
};

export function ReviewsSection({
  supplierId,
  recentReviews,
  reviewSummary,
}: {
  supplierId: string;
  recentReviews: RecentReview[];
  reviewSummary: ReviewSummary;
}) {
  const { isAuthenticated, authToken, user } = useAuth();
  const router = useRouter();
  const [myReviews, setMyReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    ratingOverall: 5,
    ratingAccuracy: 5,
    ratingLogistics: 5,
    ratingValue: 5,
    ratingCommunication: 5,
    body: '',
    highlights: [] as string[],
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
      title: review.title || '',
      ratingOverall: review.ratingOverall,
      ratingAccuracy: review.ratingAccuracy || 5,
      ratingLogistics: review.ratingLogistics || 5,
      ratingValue: review.ratingValue || 5,
      ratingCommunication: review.ratingCommunication || 5,
      body: review.body,
      highlights: review.highlights || [],
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
        title: editForm.title || undefined,
        ratingOverall: editForm.ratingOverall,
        ratingAccuracy: editForm.ratingAccuracy,
        ratingLogistics: editForm.ratingLogistics,
        ratingValue: editForm.ratingValue,
        ratingCommunication: editForm.ratingCommunication,
        body: editForm.body,
        highlights: editForm.highlights.length > 0 ? editForm.highlights : undefined,
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

  const toggleHighlight = (highlight: string) => {
    setEditForm(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight],
    }));
  };

  const commonHighlights = [
    'Great Communication',
    'Fast Shipping',
    'Quality Products',
    'Good Pricing',
    'Reliable',
    'Professional',
  ];

  // Show my pending/unapproved reviews at the top
  const myPendingReviews = myReviews.filter(r => !r.isApproved);
  const hasMyReview = myReviews.length > 0;

  return (
    <section className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] p-6">
      <h2 className={`${hand.className} text-3xl text-slate-900 mb-6`}>
        Reviews ({reviewSummary.count})
      </h2>

      {/* Review Summary */}
      {reviewSummary.count > 0 && (
        <div className="mb-8 rounded-2xl border-2 border-slate-200 bg-slate-50 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-slate-900 mb-2">
                {reviewSummary.average?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center mb-2">
                <RatingStars rating={reviewSummary.average || 0} />
              </div>
              <div className="text-sm text-slate-600">
                Based on {reviewSummary.count} {reviewSummary.count === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
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
                    <div className="w-12 text-sm text-slate-600">{stars} ⭐</div>
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-slate-600 text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratings */}
          {(reviewSummary.aspects.accuracy || reviewSummary.aspects.logistics || reviewSummary.aspects.value || reviewSummary.aspects.communication) && (
            <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t-2 border-slate-200 sm:grid-cols-4">
              {reviewSummary.aspects.accuracy && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{reviewSummary.aspects.accuracy.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Accuracy</div>
                </div>
              )}
              {reviewSummary.aspects.logistics && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{reviewSummary.aspects.logistics.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Logistics</div>
                </div>
              )}
              {reviewSummary.aspects.value && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{reviewSummary.aspects.value.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Value</div>
                </div>
              )}
              {reviewSummary.aspects.communication && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{reviewSummary.aspects.communication.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Communication</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* My Pending Reviews (only visible to me) */}
      {myPendingReviews.map((review) => (
        <div key={review.id} className="mb-6 rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 animate-in fade-in duration-500">
          {editingReview === review.id ? (
            /* Edit Form */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${hand.className} text-2xl text-slate-900`}>Edit Your Review</h3>
                <button
                  onClick={cancelEdit}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-4 rounded-xl bg-blue-50 border-2 border-blue-200 p-3 text-sm text-blue-700">
                💡 Your edits will need to be re-approved by our team
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(review.id); }} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Review Title (optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Sum up your experience..."
                  />
                </div>

                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, ratingOverall: star }))}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= editForm.ratingOverall ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 text-lg font-bold text-slate-700">{editForm.ratingOverall.toFixed(1)}</span>
                  </div>
                </div>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { key: 'ratingAccuracy' as const, label: 'Accuracy' },
                    { key: 'ratingLogistics' as const, label: 'Logistics' },
                    { key: 'ratingValue' as const, label: 'Value' },
                    { key: 'ratingCommunication' as const, label: 'Communication' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditForm(prev => ({ ...prev, [key]: star }))}
                            className="text-xl"
                          >
                            {star <= (editForm[key] as number) ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Highlights (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonHighlights.map((highlight) => (
                      <button
                        key={highlight}
                        type="button"
                        onClick={() => toggleHighlight(highlight)}
                        className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                          editForm.highlights.includes(highlight)
                            ? 'border-blue-500 bg-blue-100 text-blue-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {editForm.highlights.includes(highlight) ? '✓ ' : ''}{highlight}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Body */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your Review *
                  </label>
                  <textarea
                    value={editForm.body}
                    onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                    required
                    rows={6}
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Share your experience with this supplier..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-full border-2 border-slate-900/80 bg-blue-500 px-6 py-3 text-lg font-bold text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_3px_0_0_rgba(2,6,23,0.85)] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Review'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-lg font-medium text-slate-700 hover:border-slate-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Display Mode */
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-3 py-1 text-sm font-bold text-amber-900 mb-2">
                    ⏳ Pending Approval
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{review.title || 'Your Review'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(review)}
                    className="rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(review.id)}
                    className="rounded-full border-2 border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:border-red-400 transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <RatingStars rating={review.ratingOverall} />
                <span className="text-lg font-bold text-slate-900">{review.ratingOverall.toFixed(1)}</span>
              </div>

              {review.highlights && review.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.highlights.map((highlight, i) => (
                    <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                      {highlight}
                    </span>
                  ))}
                </div>
              )}

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
          <div className="text-center py-12 text-slate-500">
            <div className="text-6xl mb-4">📝</div>
            <p>No reviews yet. Be the first to review this supplier!</p>
          </div>
        )}

        {recentReviews.map((review, index) => (
          <div
            key={index}
            className="rounded-2xl border-2 border-slate-200 bg-white p-6 hover:border-slate-300 transition-colors"
          >
            {review.title && (
              <h3 className="text-xl font-bold text-slate-900 mb-2">{review.title}</h3>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <RatingStars rating={review.ratingOverall} />
              <span className="text-lg font-bold text-slate-900">{review.ratingOverall.toFixed(1)}</span>
            </div>

            {review.highlights && review.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {review.highlights.map((highlight, i) => (
                  <span key={i} className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                    ✓ {highlight}
                  </span>
                ))}
              </div>
            )}

            <p className="text-slate-700 leading-relaxed mb-4">{review.body}</p>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>
                By {review.author} {review.company && `from ${review.company}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-900/80 shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className={`${hand.className} text-3xl text-slate-900 mb-2`}>
                Delete Review?
              </h3>
              <p className="text-slate-600">
                This action cannot be undone. Your review will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-lg font-medium text-slate-700 hover:border-slate-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 rounded-full border-2 border-slate-900/80 bg-red-500 px-6 py-3 text-lg font-bold text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_3px_0_0_rgba(2,6,23,0.85)]"
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
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-xl">
          {i < fullStars ? '⭐' : i === fullStars && hasHalf ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}
