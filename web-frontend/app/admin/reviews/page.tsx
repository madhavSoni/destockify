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

/* ────────────────────────────────────────────────── *
 *  Tiny helpers                                      *
 * ────────────────────────────────────────────────── */

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${dim} ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function StatusBadge({ approved }: { approved: boolean }) {
  return approved ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Approved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: 'blue' | 'emerald' | 'amber' | 'slate';
}) {
  const ring: Record<string, string> = {
    blue: 'ring-blue-100',
    emerald: 'ring-emerald-100',
    amber: 'ring-amber-100',
    slate: 'ring-slate-100',
  };
  const text: Record<string, string> = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    slate: 'text-slate-600',
  };
  return (
    <div className={`rounded-xl bg-white p-4 ring-1 ${ring[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${text[accent]}`}>{value}</p>
    </div>
  );
}

/* ────────────────────────────────────────────────── *
 *  Main page                                         *
 * ────────────────────────────────────────────────── */

export default function ReviewsPage() {
  const { authToken } = useAuth();
  const searchParams = useSearchParams();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'approved' | 'pending' | 'rejected' | undefined>();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [preselectedSupplierId, setPreselectedSupplierId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<number>>(new Set());

  /* ── Data fetching ── */

  useEffect(() => {
    if (authToken) {
      api.reviews
        .getAllAdmin(authToken, { status: statusFilter, limit: 100 })
        .then((result) => setReviews(result.items ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, statusFilter]);

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

  /* ── Grouped data ── */

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

    groups.sort((a, b) => {
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return b.totalCount - a.totalCount;
    });

    return groups;
  }, [reviews]);

  const filteredGroups = useMemo(() => {
    if (!supplierSearch.trim()) return supplierGroups;
    const term = supplierSearch.toLowerCase();
    return supplierGroups.filter((g) => g.supplierName.toLowerCase().includes(term));
  }, [supplierGroups, supplierSearch]);

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

  /* ── Actions ── */

  const handleApprove = async (id: number) => {
    if (!authToken) return;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r)));
    try {
      await api.reviews.approve(id, authToken);
    } catch (error) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
      alert('Failed to approve review');
      console.error(error);
    }
  };

  const handleUnapprove = async (id: number) => {
    if (!authToken) return;
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
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
    setReviews((prev) => prev.filter((r) => r.id !== id));
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
    setReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));
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

  /* ── Derived stats ── */

  const totalCount = reviews.length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating =
    totalCount > 0 ? Math.round((reviews.reduce((s, r) => s + r.ratingOverall, 0) / totalCount) * 10) / 10 : 0;

  /* ── Loading ── */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {/* skeleton header */}
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-lg bg-slate-100" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reviews</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and moderate customer reviews</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Review
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={totalCount} accent="blue" />
          <StatCard label="Approved" value={approvedCount} accent="emerald" />
          <StatCard label="Pending" value={pendingCount} accent="amber" />
          <StatCard label="Avg Rating" value={avgRating > 0 ? `${avgRating}/5` : '--'} accent="slate" />
        </div>

        {/* Toolbar: filters + view toggle + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { label: 'All', value: undefined },
                { label: 'Approved', value: 'approved' as const },
                { label: 'Pending', value: 'pending' as const },
              ] as const
            ).map((f) => (
              <button
                key={f.label}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === f.value
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* View toggle */}
            <div className="ml-1 flex items-center rounded-full bg-white p-0.5 ring-1 ring-inset ring-slate-200">
              <button
                onClick={() => setViewMode('grouped')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'grouped' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                By Supplier
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'flat' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {viewMode === 'grouped' && (
            <div className="relative sm:w-64">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}
        </div>

        {/* Create modal */}
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

        {/* ── Grouped View ── */}
        {viewMode === 'grouped' && (
          <div className="space-y-4">
            {filteredGroups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">
                  {supplierSearch ? 'No suppliers match your search' : 'No reviews found'}
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isExpanded = expandedSuppliers.has(group.supplierId);
                return (
                  <div
                    key={group.supplierId}
                    className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition-shadow hover:shadow-sm"
                  >
                    {/* Supplier header */}
                    <button
                      onClick={() => toggleSupplierExpanded(group.supplierId)}
                      className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      <svg
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/companies/${group.supplierId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                        >
                          {group.supplierName}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StarRating rating={Math.round(group.averageRating)} />
                        <span className="text-xs tabular-nums text-slate-500">{group.averageRating}</span>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
                          {group.totalCount}
                        </span>

                        {group.pendingCount > 0 && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium tabular-nums text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            {group.pendingCount} pending
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateForSupplier(group.supplierId);
                          }}
                          className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-blue-600 hover:ring-blue-200 cursor-pointer"
                          title={`Add review for ${group.supplierName}`}
                        >
                          + Add
                        </button>
                      </div>
                    </button>

                    {/* Expanded reviews */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                        <div className="space-y-3">
                          {group.reviews.map((review) => (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              authToken={authToken!}
                              isEditing={editingReviewId === review.id}
                              onStartEdit={() => setEditingReviewId(review.id)}
                              onCancelEdit={() => setEditingReviewId(null)}
                              onSave={(updated) => {
                                setEditingReviewId(null);
                                handleUpdateReview(updated);
                              }}
                              onDelete={handleDelete}
                              onApprove={handleApprove}
                              onUnapprove={handleUnapprove}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Flat View ── */}
        {viewMode === 'flat' && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">No reviews found</p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  authToken={authToken!}
                  isEditing={editingReviewId === review.id}
                  showSupplier
                  onStartEdit={() => setEditingReviewId(review.id)}
                  onCancelEdit={() => setEditingReviewId(null)}
                  onSave={(updated) => {
                    setEditingReviewId(null);
                    handleUpdateReview(updated);
                  }}
                  onDelete={handleDelete}
                  onApprove={handleApprove}
                  onUnapprove={handleUnapprove}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────── *
 *  Review card (replaces old table rows)             *
 * ────────────────────────────────────────────────── */

function ReviewCard({
  review,
  authToken,
  isEditing,
  showSupplier = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onApprove,
  onUnapprove,
}: {
  review: ReviewItem;
  authToken: string;
  isEditing: boolean;
  showSupplier?: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updated: ReviewItem) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onUnapprove: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [localReview, setLocalReview] = useState(review);
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    author: review.author || '',
    body: review.body || '',
    ratingOverall: review.ratingOverall,
    createdAt: review.createdAt ? review.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    isApproved: review.isApproved,
  });

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
    const dateForAPI = formData.createdAt || localReview.createdAt.split('T')[0];
    const dateISO = formData.createdAt
      ? new Date(formData.createdAt + 'T00:00:00.000Z').toISOString()
      : localReview.createdAt;

    const updatedReview: ReviewItem = {
      ...localReview,
      author: formData.author,
      body: formData.body,
      ratingOverall: formData.ratingOverall,
      createdAt: dateISO,
      isApproved: formData.isApproved,
    };

    setLocalReview(updatedReview);
    onSave(updatedReview);

    try {
      await api.reviews.adminUpdate(
        localReview.id,
        {
          author: formData.author,
          body: formData.body,
          ratingOverall: formData.ratingOverall,
          createdAt: dateForAPI,
          isApproved: formData.isApproved,
        },
        authToken
      );
    } catch (error: any) {
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

  const bodyPreview = localReview.body
    ? localReview.body.length > 120
      ? localReview.body.slice(0, 120) + '...'
      : localReview.body
    : null;

  /* ── Edit mode ── */
  if (isEditing) {
    return (
      <div className="rounded-lg bg-white p-5 ring-1 ring-slate-200 ring-offset-1 ring-offset-blue-50 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Editing review by {localReview.author}</h3>
          <button
            onClick={onCancelEdit}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            aria-label="Cancel editing"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Rating</label>
              <select
                value={formData.ratingOverall}
                onChange={(e) => setFormData({ ...formData, ratingOverall: Number(e.target.value) })}
                className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} star{r !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Review Text</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={5}
              className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                value={formData.createdAt}
                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
              <select
                value={formData.isApproved ? 'approved' : 'pending'}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === 'approved' })}
                className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onCancelEdit}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Display mode ── */
  return (
    <div className="group rounded-lg bg-white p-4 ring-1 ring-slate-200 transition-all hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Left: avatar placeholder */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-500">
          {localReview.author ? localReview.author[0] : '?'}
        </div>

        {/* Center: content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-slate-900">{localReview.author}</span>
            <StarRating rating={localReview.ratingOverall} />
            <StatusBadge approved={localReview.isApproved} />
            {showSupplier && (
              <Link
                href={`/admin/companies/${localReview.supplier.id}`}
                className="text-xs text-slate-500 hover:text-blue-600 hover:underline"
              >
                {localReview.supplier.name}
              </Link>
            )}
          </div>

          <p className="mt-0.5 text-xs text-slate-400">
            {localReview.customer.email}
            <span className="mx-1.5">·</span>
            {localReview.createdAt ? new Date(localReview.createdAt).toLocaleDateString() : 'N/A'}
          </p>

          {/* Body preview / expanded */}
          {bodyPreview && (
            <div className="mt-2">
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                {expanded ? localReview.body : bodyPreview}
              </p>
              {localReview.body && localReview.body.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Images */}
          {localReview.images && localReview.images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {localReview.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review image ${idx + 1}`}
                  className="h-16 w-16 rounded-md object-cover ring-1 ring-slate-200"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={onStartEdit}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>

          {!localReview.isApproved ? (
            <button
              onClick={() => onApprove(localReview.id)}
              className="rounded-md p-1.5 text-emerald-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
              title="Approve"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => onUnapprove(localReview.id)}
              className="rounded-md p-1.5 text-amber-500 transition-colors hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
              title="Unapprove"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────── *
 *  Create Review Modal                               *
 * ────────────────────────────────────────────────── */

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

  useEffect(() => {
    if (preselectedSupplierId) {
      setFormData((prev) => ({ ...prev, supplierId: preselectedSupplierId }));
    }
  }, [preselectedSupplierId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.supplierId) newErrors.supplierId = 'Please select a supplier';
    if (!formData.author && !formData.isAnonymous) newErrors.author = 'Please enter an author name or select anonymous';
    if (!formData.body.trim()) newErrors.body = 'Review text is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (keepOpen: boolean = false) => {
    if (!validateForm()) return;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        {/* Modal header */}
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Create New Review</h2>
            <button
              onClick={onCancel}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-5">
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review created successfully!
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {errors.submit}
            </div>
          )}

          <div className="space-y-5">
            {/* Supplier */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Supplier <span className="text-red-500">*</span>
              </label>
              {suppliersLoading ? (
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 ring-1 ring-inset ring-slate-200">
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
                    className={errors.supplierId ? 'ring-red-300' : ''}
                  />
                  {errors.supplierId && <p className="mt-1 text-xs text-red-600">{errors.supplierId}</p>}
                  {selectedSupplier && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Selected: <span className="font-medium text-slate-700">{selectedSupplier.name}</span>
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Author + anonymous */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
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
                  placeholder={formData.isAnonymous ? 'Anonymous' : 'Reviewer Name'}
                  className={`w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ${
                    errors.author ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-200 focus:ring-slate-900'
                  } focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                />
                {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author}</p>}
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => {
                      setFormData({ ...formData, isAnonymous: e.target.checked, author: '' });
                      setErrors({ ...errors, author: '' });
                    }}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  Anonymous Review
                </label>
              </div>
            </div>

            {/* Rating + date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Rating <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ratingOverall}
                  onChange={(e) => setFormData({ ...formData, ratingOverall: Number(e.target.value) })}
                  className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} star{r !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Date</label>
                <input
                  type="date"
                  value={formData.createdAt}
                  onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                  className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Review Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => {
                  setFormData({ ...formData, body: e.target.value });
                  setErrors({ ...errors, body: '' });
                }}
                rows={5}
                placeholder="Enter the review text..."
                className={`w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ${
                  errors.body ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-200 focus:ring-slate-900'
                } focus:bg-white focus:ring-2`}
              />
              {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Status</label>
              <select
                value={formData.isApproved ? 'approved' : 'pending'}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === 'approved' })}
                className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-900"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create & Add Another'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
