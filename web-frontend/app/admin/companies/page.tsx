'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type SupplierItem = {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  shortDescription: string | null;
  description: string | null;
  heroImage: string | null;
  logoImage: string | null;
  averageRating: number | null;
  reviewCount: number;
  isVerified?: boolean;
  isScam?: boolean;
  createdAt: string;
  region: { name: string; slug: string } | null;
};

type Review = {
  id: number;
  title: string | null;
  author: string;
  company: string | null;
  ratingOverall: number;
  body: string;
  isApproved: boolean;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
};

export default function CompaniesPage() {
  const { authToken } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [search, setSearch] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    heroImage: '',
    logoImage: '',
    isVerified: false,
    isScam: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authToken) {
      api.suppliers
        .getAllAdmin(authToken, { search: search || undefined, limit: 100 })
        .then((result) => setSuppliers(result.items))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, search]);

  const handleSelectSupplier = async (supplier: SupplierItem) => {
    setSelectedSupplier(supplier);
    setLoadingDetail(true);
    setShowAddReview(false);
    setEditingReviewId(null);

    try {
      // Fetch full supplier details
      const fullSupplier = await api.suppliers.getByIdAdmin(supplier.id, authToken!);
      setFormData({
        name: fullSupplier.name || '',
        shortDescription: fullSupplier.shortDescription || '',
        description: fullSupplier.description || '',
        website: fullSupplier.website || '',
        phone: fullSupplier.phone || '',
        email: fullSupplier.email || '',
        heroImage: fullSupplier.heroImage || '',
        logoImage: fullSupplier.logoImage || '',
        isVerified: fullSupplier.isVerified || false,
        isScam: fullSupplier.isScam || false,
      });

      // Fetch reviews
      setLoadingReviews(true);
      const reviewsData = await api.reviews.getBySupplierAdmin(supplier.id, authToken!);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch supplier details:', error);
    } finally {
      setLoadingDetail(false);
      setLoadingReviews(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSupplier || !authToken) return;

    setSaving(true);
    try {
      await api.suppliers.update(selectedSupplier.id, formData, authToken);
      
      // Update the supplier in the list
      setSuppliers(suppliers.map(s => 
        s.id === selectedSupplier.id 
          ? { ...s, name: formData.name, email: formData.email, phone: formData.phone }
          : s
      ));
      
      alert('Company updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update company');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier || !authToken) return;
    if (!confirm(`Are you sure you want to delete "${selectedSupplier.name}"? This cannot be undone.`)) return;

    try {
      await api.suppliers.delete(selectedSupplier.id, authToken);
      setSuppliers(suppliers.filter((s) => s.id !== selectedSupplier.id));
      setSelectedSupplier(null);
      alert('Company deleted successfully!');
    } catch (error) {
      alert('Failed to delete company');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
        <p className="mt-2 text-slate-600">Manage all company listings</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-250px)]">
        {/* Sidebar - Company List */}
        <div className="w-80 flex-shrink-0 flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Search */}
          <div className="border-b border-slate-200 p-4">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Company List */}
          <div className="flex-1 overflow-y-auto">
            {suppliers.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No companies found
              </div>
            ) : (
              suppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  onClick={() => handleSelectSupplier(supplier)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-blue-50 transition-colors ${
                    selectedSupplier?.id === supplier.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="font-medium text-slate-900 text-sm">{supplier.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    {supplier.averageRating ? (
                      <span>{supplier.averageRating.toFixed(1)}⭐</span>
                    ) : (
                      <span>No rating</span>
                    )}
                    <span>•</span>
                    <span>{supplier.reviewCount} reviews</span>
                  </div>
                  {supplier.region && (
                    <div className="text-xs text-slate-500 mt-1">{supplier.region.name}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 overflow-y-auto">
          {!selectedSupplier ? (
            <div className="h-full flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="mt-4 text-sm font-medium text-slate-900">No company selected</p>
                <p className="mt-1 text-sm text-slate-500">Select a company from the list to view and edit details</p>
              </div>
            </div>
          ) : loadingDetail ? (
            <div className="text-slate-600">Loading details...</div>
          ) : (
            <div className="space-y-6">
              {/* Company Information */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Company Information</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete Company
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Verification Status Section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Verification Status</h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVerified: !formData.isVerified, isScam: false })}
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      formData.isVerified
                        ? 'border-green-600 bg-green-500 text-white shadow-sm'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {formData.isVerified ? 'Verified ✓' : 'Mark as Verified'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isScam: !formData.isScam, isVerified: false })}
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                      formData.isScam
                        ? 'border-red-600 bg-red-500 text-white shadow-sm'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formData.isScam ? 'Marked as Scam ⚠' : 'Mark as Scam'}
                    </div>
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {formData.isVerified && 'This supplier will display a verified badge on the public listing.'}
                  {formData.isScam && 'This supplier will display a scam warning on the public listing.'}
                  {!formData.isVerified && !formData.isScam && 'No status badge will be displayed.'}
                </p>
              </div>

              {/* Reviews Section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {reviews.length} total • Average: {selectedSupplier?.averageRating?.toFixed(1) || 'N/A'}⭐
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddReview(!showAddReview)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {showAddReview ? 'Cancel' : '+ Add Review'}
                  </button>
                </div>

                {showAddReview && (
                  <AddReviewForm
                    supplierId={selectedSupplier!.id}
                    authToken={authToken!}
                    onSuccess={async () => {
                      setShowAddReview(false);
                      const reviewsData = await api.reviews.getBySupplierAdmin(selectedSupplier!.id, authToken!);
                      setReviews(reviewsData);
                    }}
                    onCancel={() => setShowAddReview(false)}
                  />
                )}

                {loadingReviews ? (
                  <div className="py-8 text-center text-sm text-slate-600">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">No reviews yet</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        authToken={authToken!}
                        isEditing={editingReviewId === review.id}
                        onEdit={() => setEditingReviewId(review.id)}
                        onCancel={() => setEditingReviewId(null)}
                        onSave={async () => {
                          setEditingReviewId(null);
                          const reviewsData = await api.reviews.getBySupplierAdmin(selectedSupplier!.id, authToken!);
                          setReviews(reviewsData);
                        }}
                        onDelete={async () => {
                          const reviewsData = await api.reviews.getBySupplierAdmin(selectedSupplier!.id, authToken!);
                          setReviews(reviewsData);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Review Form Component
function AddReviewForm({ supplierId, authToken, onSuccess, onCancel }: { supplierId: number; authToken: string; onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // Get today's date in local timezone
  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    author: '',
    title: '',
    body: '',
    ratingOverall: 5,
    createdAt: getLocalDateString(),
    isApproved: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.reviews.adminCreate({
        supplierId,
        author: formData.author,
        title: formData.title || undefined,
        body: formData.body,
        ratingOverall: formData.ratingOverall,
        isApproved: formData.isApproved,
        createdAt: formData.createdAt,
      }, authToken);
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Author *</label>
        <input
          type="text"
          required
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Review Text *</label>
        <textarea
          required
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rating *</label>
          <select
            value={formData.ratingOverall}
            onChange={(e) => setFormData({ ...formData, ratingOverall: Number(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} ⭐</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.createdAt}
            onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select
          value={formData.isApproved ? 'approved' : 'pending'}
          onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === 'approved' })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Review Item Component
function ReviewItem({ review, authToken, isEditing, onEdit, onCancel, onSave, onDelete }: {
  review: Review;
  authToken: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: review.title || '',
    body: review.body,
    ratingOverall: review.ratingOverall,
    createdAt: review.createdAt.split('T')[0],
    isApproved: review.isApproved,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.reviews.adminUpdate(review.id, {
        title: formData.title || undefined,
        body: formData.body,
        ratingOverall: formData.ratingOverall,
        createdAt: formData.createdAt,
        isApproved: formData.isApproved,
      }, authToken);
      onSave();
    } catch (error: any) {
      alert(error.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setLoading(true);
    try {
      await api.reviews.adminDelete(review.id, authToken);
      onDelete();
    } catch (error: any) {
      alert(error.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.createdAt}
              onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
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
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-semibold text-slate-900">{review.ratingOverall}⭐</span>
            {review.isApproved ? (
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">Approved</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">Pending</span>
            )}
          </div>
          {review.title && (
            <h3 className="font-medium text-slate-900 mb-1">{review.title}</h3>
          )}
          <p className="text-sm text-slate-700 mb-2">{review.body}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>By: {review.author}</span>
            {review.company && <span>• {review.company}</span>}
            <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
