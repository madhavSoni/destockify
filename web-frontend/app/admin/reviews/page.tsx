'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type ReviewItem = {
  id: number;
  title: string | null;
  ratingOverall: number;
  isApproved: boolean;
  createdAt: string;
  approvedAt: string | null;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  supplier: {
    id: number;
    name: string;
    slug: string;
  };
};

export default function ReviewsPage() {
  const { authToken } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'approved' | 'pending' | 'rejected' | undefined>();

  useEffect(() => {
    if (authToken) {
      api.reviews
        .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
        .then((result) => setReviews(result.items))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, statusFilter]);

  const handleApprove = async (id: number) => {
    if (!authToken) return;
    try {
      await api.reviews.approve(id, authToken);
      setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: true } : r)));
    } catch (error) {
      alert('Failed to approve review');
      console.error(error);
    }
  };

  const handleUnapprove = async (id: number) => {
    if (!authToken) return;
    try {
      await api.reviews.unapprove(id, authToken);
      setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
    } catch (error) {
      alert('Failed to unapprove review');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    if (!authToken) return;
    try {
      await api.reviews.adminDelete(id, authToken);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (error) {
      alert('Failed to delete review');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
        <p className="mt-2 text-slate-600">Approve, edit, or remove reviews</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === undefined
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            statusFilter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Pending
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-slate-900">{review.customer.name}</div>
                      <div className="text-xs text-slate-500">{review.customer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                      {review.supplier.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {review.ratingOverall}⭐
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {review.isApproved ? (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {!review.isApproved ? (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnapprove(review.id)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          Unapprove
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

