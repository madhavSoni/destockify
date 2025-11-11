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
    title: '',
    ratingOverall: 5,
    ratingAccuracy: 5,
    ratingLogistics: 5,
    ratingValue: 5,
    ratingCommunication: 5,
    body: '',
    highlights: [] as string[],
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
        title: formData.title || undefined,
        ratingOverall: formData.ratingOverall,
        ratingAccuracy: formData.ratingAccuracy,
        ratingLogistics: formData.ratingLogistics,
        ratingValue: formData.ratingValue,
        ratingCommunication: formData.ratingCommunication,
        body: formData.body,
        highlights: formData.highlights.length > 0 ? formData.highlights : undefined,
      };

      await api.reviews.create(payload, authToken);
      
      setSuccess(true);
      setFormData({
        title: '',
        ratingOverall: 5,
        ratingAccuracy: 5,
        ratingLogistics: 5,
        ratingValue: 5,
        ratingCommunication: 5,
        body: '',
        highlights: [],
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

  const handleHighlightToggle = (highlight: string) => {
    setFormData(prev => ({
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

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border-2 border-slate-900/80 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg p-8 sm:p-10 text-center">
        <div className="text-7xl mb-5">⭐</div>
        <h2 className="font-black text-3xl text-slate-900 mb-4">
          Write a Review
        </h2>
        <p className="text-slate-700 font-medium mb-8 max-w-md mx-auto text-base">
          Share your experience with {supplier.name}! Create an account to leave a verified review — it only takes 30 seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/signup')}
            className="h-14 rounded-xl border-2 border-slate-900/80 bg-blue-600 px-8 py-3 font-black text-white hover:translate-y-[-1px] hover:shadow-md transition-all shadow-sm ring-2 ring-slate-900/80"
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push('/login')}
            className="h-14 rounded-xl border-2 border-slate-900/80 bg-white px-8 py-3 font-bold text-slate-900 hover:translate-y-[-1px] hover:shadow-md transition-all shadow-sm"
          >
            Login
          </button>
        </div>
      </section>
    );
  }

  if (!user?.isVerified) {
    return (
      <section className="rounded-3xl border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg p-8 sm:p-10 text-center">
        <div className="text-7xl mb-5">📧</div>
        <h2 className="font-black text-3xl text-slate-900 mb-4">
          Verify Your Email
        </h2>
        <p className="text-slate-700 font-medium text-base">
          Check your email to verify your account before posting your review.
        </p>
      </section>
    );
  }

  if (success) {
    return (
      <section className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg p-8 sm:p-10 text-center animate-in fade-in duration-500">
        <div className="text-7xl mb-5">✅</div>
        <h2 className="font-black text-3xl text-slate-900 mb-4">
          Thank You!
        </h2>
        <p className="text-slate-700 font-medium text-base">
          Your review has been submitted and will be visible after admin approval.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 sm:p-8 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-3xl text-slate-900 mb-2">
              ⭐ Write a Review
            </h2>
            <p className="text-slate-600 font-medium">
              Share your experience with {supplier.name}
            </p>
          </div>
          <div className="text-4xl font-bold transform transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
            ▼
          </div>
        </div>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="border-t-2 border-slate-900/80 p-6 sm:p-8 space-y-6 animate-in slide-in-from-top duration-300 bg-gradient-to-br from-slate-50 to-blue-50">
          {error && (
            <div className="mb-4 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-800 font-bold shadow-sm">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-lg font-black text-slate-900 mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, ratingOverall: star }))}
                  className="text-5xl hover:scale-125 active:scale-95 transition-transform"
                >
                  {star <= formData.ratingOverall ? '⭐' : '☆'}
                </button>
              ))}
              <span className="ml-3 text-2xl font-black text-slate-900">
                {formData.ratingOverall}.0
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-lg font-black text-slate-900 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Great supplier with fast shipping"
              className="w-full h-14 rounded-2xl border-2 border-slate-900/80 px-4 py-3 font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none shadow-sm"
            />
          </div>

          {/* Detailed Ratings */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'ratingAccuracy' as const, label: 'Product Accuracy' },
              { key: 'ratingLogistics' as const, label: 'Logistics & Shipping' },
              { key: 'ratingValue' as const, label: 'Value for Money' },
              { key: 'ratingCommunication' as const, label: 'Communication' },
            ].map(({ key, label }) => (
              <div key={key} className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {label}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, [key]: star }))}
                      className="text-2xl hover:scale-125 active:scale-95 transition-transform"
                    >
                      {star <= (formData[key] as number) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-lg font-black text-slate-900 mb-3">
              Highlights (Optional)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {commonHighlights.map((highlight) => (
                <button
                  key={highlight}
                  type="button"
                  onClick={() => handleHighlightToggle(highlight)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all shadow-sm hover:translate-y-[-1px] hover:shadow-md ${
                    formData.highlights.includes(highlight)
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-slate-900/80 bg-white text-slate-700 hover:border-blue-500'
                  }`}
                >
                  {formData.highlights.includes(highlight) && <span className="mr-1">✓</span>}
                  {highlight}
                </button>
              ))}
            </div>
          </div>

          {/* Review Body */}
          <div>
            <label className="block text-lg font-black text-slate-900 mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Tell others about your experience with this supplier..."
              required
              rows={6}
              className="w-full rounded-2xl border-2 border-slate-900/80 px-4 py-3 font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none resize-none shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-14 rounded-xl border-2 border-slate-900/80 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.body.trim()}
              className="h-14 rounded-xl border-2 border-slate-900/80 bg-blue-600 px-8 py-3 font-black text-white hover:translate-y-[-1px] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ring-2 ring-slate-900/80"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
