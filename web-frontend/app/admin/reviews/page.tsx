'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type ReviewItem = {
  id: number;
  author: string;
  body?: string;
  ratingOverall: number;
  images?: string[];
  isApproved: boolean;
  createdAt: string;
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
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    if (authToken) {
      api.reviews
        .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
        .then((result) => setReviews(result.items))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, statusFilter]);

  // Fetch suppliers when creating starts
  useEffect(() => {
    if (isCreating && authToken && suppliers.length === 0) {
      api.suppliers
        .getAllAdmin(authToken, { limit: 1000 })
        .then((result) => setSuppliers(result.items))
        .catch(console.error);
    }
  }, [isCreating, authToken, suppliers.length]);

  const handleApprove = async (id: number) => {
    if (!authToken) return;
    // Optimistic update - use functional update to ensure we have latest state
    setReviews((prevReviews) => {
      const previousState = prevReviews.find(r => r.id === id);
      return prevReviews.map((r) => (r.id === id ? { ...r, isApproved: true, approvedAt: new Date().toISOString() } : r));
    });
    try {
      await api.reviews.approve(id, authToken);
    } catch (error) {
      // Revert on error
      setReviews((prevReviews) => prevReviews.map((r) => (r.id === id ? { ...r, isApproved: false, approvedAt: null } : r)));
      alert('Failed to approve review');
      console.error(error);
    }
  };

  const handleUnapprove = async (id: number) => {
    if (!authToken) return;
    // Optimistic update
    setReviews((prevReviews) => prevReviews.map((r) => (r.id === id ? { ...r, isApproved: false, approvedAt: null } : r)));
    try {
      await api.reviews.unapprove(id, authToken);
    } catch (error) {
      // Revert on error - we'll need to refetch to get accurate state
      if (authToken) {
        api.reviews
          .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
          .then((result) => setReviews(result.items))
          .catch(console.error);
      }
      alert('Failed to unapprove review');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    if (!authToken) return;
    // Optimistic update
    setReviews((prevReviews) => prevReviews.filter((r) => r.id !== id));
    try {
      await api.reviews.adminDelete(id, authToken);
    } catch (error) {
      // Revert on error - refetch to get accurate state
      if (authToken) {
        api.reviews
          .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
          .then((result) => setReviews(result.items))
          .catch(console.error);
      }
      alert('Failed to delete review');
      console.error(error);
    }
  };

  const handleUpdateReview = (updatedReview: ReviewItem) => {
    setReviews((prevReviews) => prevReviews.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
  };

  const handleCreateReview = (newReview: ReviewItem) => {
    setReviews((prev) => [newReview, ...prev]);
    setIsCreating(false);
  };

  if (loading) {
    return <div className="text-slate-600">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
          <p className="mt-2 text-slate-600">Approve, edit, or remove reviews</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Review
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === undefined
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          Approved
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === 'pending'
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
                  Author
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
              {isCreating && (
                <CreateReviewRow
                  suppliers={suppliers}
                  authToken={authToken!}
                  onCancel={() => setIsCreating(false)}
                  onSave={handleCreateReview}
                />
              )}
              {reviews.length === 0 && !isCreating ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    authToken={authToken!}
                    isEditing={editingReviewId === review.id}
                    isExpanded={expandedReviewId === review.id}
                    onEdit={() => {
                      setEditingReviewId(review.id);
                      setExpandedReviewId(review.id);
                    }}
                    onCancel={() => {
                      setEditingReviewId(null);
                      setExpandedReviewId(null);
                    }}
                    onSave={(updatedReview) => {
                      setEditingReviewId(null);
                      setExpandedReviewId(null);
                      handleUpdateReview(updatedReview);
                    }}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onUnapprove={handleUnapprove}
                    onToggleExpand={() => {
                      if (expandedReviewId === review.id) {
                        setExpandedReviewId(null);
                        setEditingReviewId(null);
                      } else {
                        setExpandedReviewId(review.id);
                      }
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateReviewRow({
  suppliers,
  authToken,
  onCancel,
  onSave,
}: {
  suppliers: any[];
  authToken: string;
  onCancel: () => void;
  onSave: (newReview: ReviewItem) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: '',
    author: '',
    isAnonymous: false,
    body: '',
    ratingOverall: 5,
    createdAt: new Date().toISOString().split('T')[0],
    isApproved: true,
  });

  const handleSave = async () => {
    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }
    if (!formData.author && !formData.isAnonymous) {
      alert('Please enter an author name or select anonymous');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplierId: Number(formData.supplierId),
        author: formData.isAnonymous ? 'Anonymous' : formData.author,
        isAnonymous: formData.isAnonymous,
        body: formData.body,
        ratingOverall: formData.ratingOverall,
        createdAt: new Date(formData.createdAt).toISOString(),
        isApproved: formData.isApproved,
      };

      const response: any = await api.reviews.adminCreate(payload, authToken);
      if (response && response.review) {
        onSave(response.review);
      } else {
        // Fallback or re-fetch might be needed if response doesn't contain the full review object immediately
        // But let's assume it does or alert success
        window.location.reload(); // Simple reload to get fresh state if needed, or better:
        // alert('Review created! Refreshing...');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <tr className="bg-green-50">
        <td colSpan={5} className="px-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-green-900">New Review</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    disabled={formData.isAnonymous}
                    placeholder={formData.isAnonymous ? "Anonymous" : "Reviewer Name"}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Anonymous
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rating</label>
                <select
                  value={formData.ratingOverall}
                  onChange={(e) => setFormData({ ...formData, ratingOverall: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} ⭐</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.createdAt}
                  onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Review Text</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.isApproved ? 'approved' : 'pending'}
                  onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === 'approved' })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Review'}
              </button>
              <button
                onClick={onCancel}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td colSpan={5} className="h-2"></td>
      </tr>
    </>
  );
}

function ReviewRow({
  review,
  authToken,
  isEditing,
  isExpanded,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onApprove,
  onUnapprove,
  onToggleExpand,
}: {
  review: ReviewItem;
  authToken: string;
  isEditing: boolean;
  isExpanded: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updatedReview: ReviewItem) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onUnapprove: (id: number) => void;
  onToggleExpand: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [localReview, setLocalReview] = useState(review);
  const [formData, setFormData] = useState({
    author: review.author || '',
    body: review.body || '',
    ratingOverall: review.ratingOverall,
    createdAt: review.createdAt ? review.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    isApproved: review.isApproved,
  });

  // Update form data and local review when review prop changes
  useEffect(() => {
    const dateValue = review.createdAt ? review.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
    setLocalReview(review);
    setFormData({
      author: review.author || '',
      body: review.body || '',
      ratingOverall: review.ratingOverall,
      createdAt: dateValue,
      isApproved: review.isApproved,
    });
  }, [review]);

  const handleSave = async () => {
    setLoading(true);

    // Ensure date is in correct format (YYYY-MM-DD)
    const dateForAPI = formData.createdAt || localReview.createdAt.split('T')[0];

    // Convert date string to ISO format for optimistic update (UTC to prevent timezone shifts)
    const dateISO = formData.createdAt
      ? new Date(formData.createdAt + 'T00:00:00.000Z').toISOString()
      : localReview.createdAt;

    // Optimistic update - update local state immediately
    const updatedReview: ReviewItem = {
      ...localReview,
      author: formData.author,
      body: formData.body,
      ratingOverall: formData.ratingOverall,
      createdAt: dateISO,
      isApproved: formData.isApproved,
    };

    // Update local review state immediately for UI
    setLocalReview(updatedReview);

    // Update parent state immediately
    onSave(updatedReview);

    try {
      await api.reviews.adminUpdate(localReview.id, {
        author: formData.author,
        body: formData.body,
        ratingOverall: formData.ratingOverall,
        createdAt: dateForAPI,
        isApproved: formData.isApproved,
      }, authToken);
    } catch (error: any) {
      // Revert on error
      setLocalReview(localReview);
      onSave(localReview);
      alert(error.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setLoading(true);
    try {
      await api.reviews.adminDelete(localReview.id, authToken);
      onDelete(localReview.id);
    } catch (error: any) {
      alert(error.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <>
        <tr className="bg-blue-50">
          <td colSpan={5} className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rating</label>
                  <select
                    value={formData.ratingOverall}
                    onChange={(e) => setFormData({ ...formData, ratingOverall: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} ⭐</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Review Text</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.createdAt}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({ ...formData, createdAt: newDate });
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Current: {localReview.createdAt ? new Date(localReview.createdAt).toLocaleDateString() : 'N/A'}
                    {formData.createdAt !== localReview.createdAt.split('T')[0] && (
                      <span className="ml-2 text-blue-600">→ {new Date(formData.createdAt + 'T00:00:00').toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.isApproved ? 'approved' : 'pending'}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === 'approved' })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={onCancel}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={5} className="h-2"></td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="whitespace-nowrap px-6 py-4">
          <div>
            <div className="font-medium text-slate-900">{localReview.author}</div>
            <div className="text-xs text-slate-500">{localReview.customer.email}</div>
          </div>
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
          {localReview.ratingOverall}⭐
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
          {localReview.createdAt ? new Date(localReview.createdAt).toLocaleDateString() : 'N/A'}
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          {localReview.isApproved ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
              Approved
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              Pending
            </span>
          )}
        </td>
        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
            {!localReview.isApproved ? (
              <button
                onClick={() => onApprove(localReview.id)}
                className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
              >
                Approve
              </button>
            ) : (
              <button
                onClick={() => onUnapprove(localReview.id)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
              >
                Unapprove
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && !isEditing && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="px-6 py-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {localReview.body || 'No review text available'}
              </p>
              {localReview.images && localReview.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {localReview.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Review image ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                  ))}
                </div>
              )}
              <button
                onClick={onToggleExpand}
                className="text-xs text-slate-500 hover:text-slate-700 mt-2"
              >
                Hide details
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

