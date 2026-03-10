'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { SupplierSelector } from '@/components/SupplierSelector';

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

type ViewMode = 'flat' | 'grouped';

type SupplierGroup = {
  supplierId: number;
  supplierName: string;
  supplierSlug: string;
  reviews: ReviewItem[];
  totalCount: number;
  pendingCount: number;
  averageRating: number;
};

export default function ReviewsPage() {
  const { authToken } = useAuth();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'approved' | 'pending' | 'rejected' | undefined>();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (authToken) {
      api.reviews
        .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
        .then((result) => setReviews(result.items ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, statusFilter]);

  // Check for supplier ID or status in URL params
  useEffect(() => {
    const supplierId = searchParams.get('supplierId');
    if (supplierId) {
      setPreselectedSupplierId(supplierId);
      setIsCreating(true);
    }
    const status = searchParams.get('status');
    if (status === 'pending') {
      setStatusFilter('pending');
    } else if (status === 'approved') {
      setStatusFilter('approved');
    }
  }, [searchParams]);

  // Pre-fetch suppliers when page loads
  useEffect(() => {
    if (authToken && suppliers.length === 0) {
      setSuppliersLoading(true);
      api.suppliers
        .getAllAdmin(authToken, { limit: 1000 })
        .then((result) => setSuppliers(result.items || []))
        .catch(console.error)
        .finally(() => setSuppliersLoading(false));
    }
  }, [authToken, suppliers.length]);

  // Build grouped data
  const supplierGroups = useMemo((): SupplierGroup[] => {
    const groupMap = new Map<number, ReviewItem[]>();
    for (const review of reviews) {
      const sid = review.supplier.id;
      const existing = groupMap.get(sid);
      if (existing) {
        existing.push(review);
      } else {
        groupMap.set(sid, [review]);
      }
    }

    const groups: SupplierGroup[] = [];
    for (const [supplierId, groupReviews] of groupMap) {
      const first = groupReviews[0];
      const pendingCount = groupReviews.filter((r) => !r.isApproved).length;
      const avgRating = groupReviews.reduce((sum, r) => sum + r.ratingOverall, 0) / groupReviews.length;
      groups.push({
        supplierId,
        supplierName: first.supplier.name,
        supplierSlug: first.supplier.slug,
        reviews: groupReviews,
        totalCount: groupReviews.length,
        pendingCount,
        averageRating: Math.round(avgRating * 10) / 10,
      });
    }

    // Sort: pending reviews desc, then total reviews desc
    groups.sort((a, b) => {
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return b.totalCount - a.totalCount;
    });

    return groups;
  }, [reviews]);

  // Filter groups by supplier search
  const filteredGroups = useMemo(() => {
    if (!supplierSearch.trim()) return supplierGroups;
    const term = supplierSearch.toLowerCase();
    return supplierGroups.filter((g) => g.supplierName.toLowerCase().includes(term));
  }, [supplierGroups, supplierSearch]);

  // Auto-expand new groups as they appear
  useEffect(() => {
    if (supplierGroups.length === 0) return;
    setExpandedSuppliers((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const g of supplierGroups) {
        if (!next.has(g.supplierId)) {
          next.add(g.supplierId);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [supplierGroups]);

  const toggleSupplierExpanded = (supplierId: number) => {
    setExpandedSuppliers((prev) => {
      const next = new Set(prev);
      if (next.has(supplierId)) {
        next.delete(supplierId);
      } else {
        next.add(supplierId);
      }
      return next;
    });
  };

  const handleApprove = async (id: number) => {
    if (!authToken) return;
    setReviews((prevReviews) =>
      prevReviews.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
    );
    try {
      await api.reviews.approve(id, authToken);
    } catch (error) {
      setReviews((prevReviews) => prevReviews.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
      alert('Failed to approve review');
      console.error(error);
    }
  };

  const handleUnapprove = async (id: number) => {
    if (!authToken) return;
    setReviews((prevReviews) => prevReviews.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
    try {
      await api.reviews.unapprove(id, authToken);
    } catch (error) {
      if (authToken) {
        api.reviews
          .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
          .then((result) => setReviews(result.items ?? []))
          .catch(console.error);
      }
      alert('Failed to unapprove review');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    if (!authToken) return;
    setReviews((prevReviews) => prevReviews.filter((r) => r.id !== id));
    try {
      await api.reviews.adminDelete(id, authToken);
    } catch (error) {
      if (authToken) {
        api.reviews
          .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
          .then((result) => setReviews(result.items ?? []))
          .catch(console.error);
      }
      alert('Failed to delete review');
      console.error(error);
    }
  };

  const handleUpdateReview = (updatedReview: ReviewItem) => {
    setReviews((prevReviews) => prevReviews.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
  };

  const handleCreateReview = (newReview: ReviewItem, keepOpen: boolean = false) => {
    setReviews((prev) => [newReview, ...prev]);
    if (!keepOpen) {
      setIsCreating(false);
    }
  };

  const refreshReviews = () => {
    if (authToken) {
      api.reviews
        .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
        .then((result) => setReviews(result.items))
        .catch(console.error);
    }
  };

  const openCreateForSupplier = (supplierId: number) => {
    setPreselectedSupplierId(String(supplierId));
    setIsCreating(true);
  };

  const reviewRowProps = (review: ReviewItem) => ({
    review,
    authToken: authToken!,
    isEditing: editingReviewId === review.id,
    isExpanded: expandedReviewId === review.id,
    onEdit: () => {
      setEditingReviewId(review.id);
      setExpandedReviewId(review.id);
    },
    onCancel: () => {
      setEditingReviewId(null);
      setExpandedReviewId(null);
    },
    onSave: (updatedReview: ReviewItem) => {
      setEditingReviewId(null);
      setExpandedReviewId(null);
      handleUpdateReview(updatedReview);
    },
    onDelete: handleDelete,
    onApprove: handleApprove,
    onUnapprove: handleUnapprove,
    onToggleExpand: () => {
      if (expandedReviewId === review.id) {
        setExpandedReviewId(null);
        setEditingReviewId(null);
      } else {
        setExpandedReviewId(review.id);
      }
    },
  });

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

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
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

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grouped')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'grouped'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            By Supplier
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'flat'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Flat List
          </button>
        </div>
      </div>

      {isCreating && (
        <CreateReviewModal
          suppliers={suppliers}
          suppliersLoading={suppliersLoading}
          authToken={authToken!}
          preselectedSupplierId={preselectedSupplierId}
          onCancel={() => {
            setIsCreating(false);
            setPreselectedSupplierId(null);
          }}
          onSave={handleCreateReview}
          onRefresh={refreshReviews}
        />
      )}

      {/* Grouped View */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          {/* Supplier search */}
          <div className="relative">
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Filter by supplier name..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              {supplierSearch ? 'No suppliers match your search' : 'No reviews found'}
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isExpanded = expandedSuppliers.has(group.supplierId);
              return (
                <div key={group.supplierId} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Supplier group header */}
                  <button
                    onClick={() => toggleSupplierExpanded(group.supplierId)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <Link
                          href={`/admin/companies/${group.supplierId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                        >
                          {group.supplierName}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        {group.averageRating}/5 avg
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {group.totalCount} review{group.totalCount !== 1 ? 's' : ''}
                      </span>
                      {group.pendingCount > 0 && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          {group.pendingCount} pending
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateForSupplier(group.supplierId);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        title={`Add review for ${group.supplierName}`}
                      >
                        + Add
                      </button>
                    </div>
                  </button>

                  {/* Expanded reviews table */}
                  {isExpanded && (
                    <div className="border-t border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Author
                              </th>
                              <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Rating
                              </th>
                              <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Date
                              </th>
                              <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Status
                              </th>
                              <th className="px-6 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {group.reviews.map((review) => (
                              <ReviewRow key={review.id} {...reviewRowProps(review)} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Flat View */}
      {viewMode === 'flat' && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                    Supplier
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
                {reviews.length === 0 && !isCreating ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <ReviewRow key={review.id} {...reviewRowProps(review)} showSupplier />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateReviewModal({
  suppliers,
  suppliersLoading,
  authToken,
  preselectedSupplierId,
  onCancel,
  onSave,
  onRefresh,
}: {
  suppliers: any[];
  suppliersLoading: boolean;
  authToken: string;
  preselectedSupplierId?: string | null;
  onCancel: () => void;
  onSave: (newReview: ReviewItem, keepOpen?: boolean) => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: preselectedSupplierId || '',
    author: '',
    isAnonymous: false,
    body: '',
    ratingOverall: 5,
    createdAt: new Date().toISOString().split('T')[0],
    isApproved: true,
  });

  // Update supplier ID when preselected changes
  useEffect(() => {
    if (preselectedSupplierId) {
      setFormData((prev) => ({ ...prev, supplierId: preselectedSupplierId }));
    }
  }, [preselectedSupplierId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId) {
      newErrors.supplierId = 'Please select a supplier';
    }
    if (!formData.author && !formData.isAnonymous) {
      newErrors.author = 'Please enter an author name or select anonymous';
    }
    if (!formData.body.trim()) {
      newErrors.body = 'Review text is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (keepOpen: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const payload = {
        supplierId: Number(formData.supplierId),
        author: formData.isAnonymous ? 'Anonymous' : formData.author,
        body: formData.body,
        ratingOverall: formData.ratingOverall,
        createdAt: new Date(formData.createdAt).toISOString(),
        isApproved: formData.isApproved,
      };

      const response: any = await api.reviews.adminCreate(payload, authToken);
      if (response && response.review) {
        setSuccess(true);
        onRefresh();
        if (keepOpen) {
          // Reset form for another review
          setFormData({
            supplierId: '',
            author: '',
            isAnonymous: false,
            body: '',
            ratingOverall: 5,
            createdAt: new Date().toISOString().split('T')[0],
            isApproved: true,
          });
          setErrors({});
          setTimeout(() => setSuccess(false), 2000);
        } else {
          setTimeout(() => {
            onSave(response.review, false);
            setSuccess(false);
          }, 1000);
        }
      } else {
        throw new Error('Failed to create review - no review returned');
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create review' });
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplier = suppliers.find((s) => s.id === Number(formData.supplierId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Create New Review</h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-6">
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              Review created successfully!
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {errors.submit}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              {suppliersLoading ? (
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Loading suppliers...
                </div>
              ) : (
                <>
                  <SupplierSelector
                    suppliers={suppliers}
                    value={formData.supplierId}
                    onSelect={(id) => {
                      setFormData({ ...formData, supplierId: String(id) });
                      setErrors({ ...errors, supplierId: '' });
                    }}
                    placeholder="Search and select a supplier..."
                    className={errors.supplierId ? 'border-red-300' : ''}
                  />
                  {errors.supplierId && (
                    <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
                  )}
                  {selectedSupplier && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected: <span className="font-medium">{selectedSupplier.name}</span>
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => {
                    setFormData({ ...formData, author: e.target.value });
                    setErrors({ ...errors, author: '' });
                  }}
                  disabled={formData.isAnonymous}
                  placeholder={formData.isAnonymous ? "Anonymous" : "Reviewer Name"}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.author
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                  } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600">{errors.author}</p>
                )}
              </div>
              <div className="sm:col-span-1 flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => {
                      setFormData({ ...formData, isAnonymous: e.target.checked, author: '' });
                      setErrors({ ...errors, author: '' });
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Anonymous Review
                </label>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ratingOverall}
                  onChange={(e) => setFormData({ ...formData, ratingOverall: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} {r === 1 ? '\u2B50' : '\u2B50\u2B50\u2B50\u2B50\u2B50'.slice(0, r)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.createdAt}
                  onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Review Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => {
                  setFormData({ ...formData, body: e.target.value });
                  setErrors({ ...errors, body: '' });
                }}
                rows={6}
                placeholder="Enter the review text..."
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.body
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">{errors.body}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.isApproved ? 'approved' : 'pending'}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === 'approved' })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create & Add Another'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
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
  showSupplier = false,
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
  showSupplier?: boolean;
}) {
  const colSpan = showSupplier ? 6 : 5;
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
          <td colSpan={colSpan} className="px-6 py-4">
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
                      <option key={r} value={r}>{r} {'\u2B50'}</option>
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
                      <span className="ml-2 text-blue-600">&rarr; {new Date(formData.createdAt + 'T00:00:00').toLocaleDateString()}</span>
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
          <td colSpan={colSpan} className="h-2"></td>
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
        {showSupplier && (
          <td className="whitespace-nowrap px-6 py-4 text-sm">
            <Link
              href={`/admin/companies/${localReview.supplier.id}`}
              className="text-slate-700 hover:text-blue-600 hover:underline"
            >
              {localReview.supplier.name}
            </Link>
          </td>
        )}
        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
          {localReview.ratingOverall}{'\u2B50'}
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
          <td colSpan={colSpan} className="px-6 py-4">
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
