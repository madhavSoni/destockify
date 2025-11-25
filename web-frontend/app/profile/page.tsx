'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ReviewResponse } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, authToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!authToken) return;
      
      try {
        setIsLoading(true);
        const userReviews = await api.reviews.getMyReviews(authToken);
        setReviews(userReviews);
      } catch (error) {
        console.error('Failed to fetch user reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchUserReviews();
    }
  }, [authToken]);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-black/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm font-medium text-black/70">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <span className="font-semibold text-black">My Profile</span>
        </div>

        {/* Profile Header */}
        <div className="mb-8 rounded-md border border-black/10 bg-white p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-3xl sm:text-4xl font-bold text-white border-4 border-white shadow-lg">
              {user.firstName.charAt(0).toUpperCase()}
              {user.lastName.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-black">
                  {user.firstName} {user.lastName}
                </h1>
                {/* Verification Badge */}
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-600/10 border border-blue-600/20 px-2.5 py-1 text-xs font-medium text-blue-600">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-black/70 mb-2 break-all">{user.email}</p>
              
              {/* Member Since */}
              <p className="text-xs sm:text-sm text-black/50">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Stats */}
            <div className="w-full sm:w-auto mt-4 sm:mt-0">
              <div className="rounded-md border border-black/10 bg-blue-600/10 px-6 py-4 text-center">
                <div className="text-3xl font-bold text-black mb-1">{reviews.length}</div>
                <div className="text-sm font-medium text-black/70">
                  {reviews.length === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="rounded-md border border-black/10 bg-white p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-6">My Reviews</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-black/70">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-black/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-lg font-semibold text-black mb-2">No Reviews Yet</h3>
              <p className="text-black/70 mb-6">You haven't left any reviews yet. Start by reviewing a supplier!</p>
              <Link
                href="/suppliers"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Browse Suppliers
              </Link>
            </div>
          ) : (
            <div className="relative">
              {/* Review Carousel */}
              <div className="overflow-hidden">
                <div className="rounded-md border border-black/10 bg-white p-6">
                  {/* Supplier Name */}
                  <Link
                    href={`/suppliers/${reviews[currentReviewIndex].supplier.slug}`}
                    className="inline-block mb-4 text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2"
                  >
                    {reviews[currentReviewIndex].supplier.name}
                  </Link>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < reviews[currentReviewIndex].ratingOverall ? 'text-blue-600' : 'text-black/20'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-black/70">
                      {reviews[currentReviewIndex].ratingOverall}.0
                    </span>
                  </div>

                  {/* Highlights - not available in ReviewResponse type */}

                  {/* Comment */}
                  <p className="text-base text-black/70 leading-relaxed mb-4">
                    {reviews[currentReviewIndex].body}
                  </p>

                  {/* Date */}
                  <p className="text-sm text-black/50">
                    {new Date(reviews[currentReviewIndex].createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              {reviews.length > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <button
                    onClick={prevReview}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex items-center gap-2">
                    {reviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentReviewIndex(i)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          i === currentReviewIndex ? 'bg-blue-600 w-6' : 'bg-black/20'
                        }`}
                        aria-label={`Go to review ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextReview}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/5 transition-colors"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
