'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api, type CreateReviewPayload } from '@/lib/api';

type Supplier = {
  id: number;
  name: string;
  slug: string;
};

export function WriteReviewSection({ 
  supplier, 
  onReviewCreated 
}: { 
  supplier: Supplier;
  onReviewCreated?: () => void;
}) {
  const { isAuthenticated, user, authToken } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    ratingOverall: 5,
    body: '',
    isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authToken) {
      setError('You must be logged in to post a review');
      return;
    }

    if (!user?.isVerified) {
      setError('You must verify your email before posting a review');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateReviewPayload = {
        supplierId: supplier.id,
        ratingOverall: formData.ratingOverall,
        body: formData.body,
        isAnonymous: formData.isAnonymous,
      };

      await api.reviews.create(payload, authToken);
      
      setSuccess(true);
      setFormData({
        ratingOverall: 5,
        body: '',
        isAnonymous: false,
      });

      // Trigger immediate refresh of reviews section
      if (onReviewCreated) {
        onReviewCreated();
      }

      // Close form and refresh page data
      setTimeout(() => {
        router.refresh();
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-md border border-black/10 bg-blue-600/10 p-6 sm:p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h2 className="font-semibold text-2xl text-black mb-3">
          Write a Review
        </h2>
        <p className="text-black/70 font-medium mb-6 max-w-md mx-auto text-sm sm:text-base">
          Share your experience with {supplier.name}! Create an account to leave a verified review.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/signup')}
            className="w-full sm:w-auto h-12 rounded-md border border-blue-600 bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-all"
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto h-12 rounded-md border border-black/10 bg-white px-6 py-3 font-medium text-black hover:bg-black/5 transition-all"
          >
            Login
          </button>
        </div>
      </section>
    );
  }

  if (!user?.isVerified) {
    return (
      <section className="rounded-md border-2 border-black/10 bg-black/5 p-6 sm:p-8 text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="font-semibold text-2xl text-black mb-3">
          Verify Your Email
        </h2>
        <p className="text-black/70 font-medium text-sm sm:text-base">
          Check your email to verify your account before posting your review.
        </p>
      </section>
    );
  }

  if (success) {
    return (
      <section className="rounded-md border-2 border-blue-600 bg-blue-600/10 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-md bg-blue-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-semibold text-2xl text-black mb-3">
          Thank You!
        </h2>
        <p className="text-black/70 font-medium text-sm sm:text-base">
          Your review has been submitted and will be visible after admin approval.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border-2 border-black/10 bg-white shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 sm:p-8 text-left hover:bg-black/5 transition-all group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-black/5 group-hover:bg-black/10 transition-colors flex-shrink-0">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl sm:text-2xl text-black mb-1">
                Write a Review
              </h2>
              <p className="text-black/70 font-medium text-sm sm:text-base">
                Share your experience with {supplier.name}
              </p>
            </div>
          </div>
          <div className="text-black/50 transform transition-transform duration-200 flex-shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="border-t border-black/5 p-4 sm:p-6 space-y-4 sm:space-y-6 bg-black/5">
          {error && (
            <div className="rounded-md border border-black/10 bg-black/5 p-3 sm:p-4 text-black font-medium text-sm">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-base font-medium text-black mb-3">
              Overall Rating *
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, ratingOverall: star }))}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <svg
                    className="w-9 h-9 sm:w-10 sm:h-10"
                    fill={star <= formData.ratingOverall ? "#3388FF" : "none"}
                    stroke="#3388FF"
                    strokeWidth={star <= formData.ratingOverall ? 0 : 1.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-xl font-semibold text-black">
                {formData.ratingOverall}.0
              </span>
            </div>
          </div>

          {/* Review Body */}
          <div>
            <label className="block text-base font-medium text-black mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Tell others about your experience with this supplier..."
              required
              rows={6}
              className="w-full rounded-md border border-black/10 px-4 py-3 font-medium text-black placeholder:text-black/50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
            />
          </div>

          {/* Anonymous Option */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-sm font-medium text-black">
                Post as anonymous
              </span>
            </label>
            <p className="mt-1 ml-7 text-xs text-black/60">
              Your name will not be displayed with this review
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto h-12 rounded-md border border-black/10 bg-white px-6 py-2 font-medium text-black hover:bg-black/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.body.trim()}
              className="w-full sm:w-auto h-12 rounded-md border border-blue-600 bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
