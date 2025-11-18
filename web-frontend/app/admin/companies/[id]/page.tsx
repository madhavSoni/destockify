'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type Review = {
  id: number;
  title: string | null;
  author: string;
  company: string | null;
  ratingOverall: number;
  body: string;
  isApproved: boolean;
  isTrending: boolean;
  createdAt: string;
  approvedAt: string | null;
  customer: {
    id: number;
    name: string;
    email: string;
  };
};

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const { authToken } = useAuth();
  const id = parseInt(params.id as string);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    heroImage: '',
    logoImage: '',
    minimumOrder: '',
    leadTime: '',
    specialties: [] as string[],
    certifications: [] as string[],
    badges: [] as string[],
    logisticsNotes: '',
    pricingNotes: '',
    trustScore: 0,
    isVerified: false,
    isScam: false,
    homeRank: 0,
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!authToken || isNaN(id)) {
        setFetching(false);
        return;
      }

      try {
        const supplier = await api.suppliers.getByIdAdmin(id, authToken);
        setFormData({
          name: supplier.name || '',
          slug: supplier.slug || '',
          shortDescription: supplier.shortDescription || '',
          description: supplier.description || '',
          website: supplier.website || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          heroImage: supplier.heroImage || '',
          logoImage: supplier.logoImage || '',
          minimumOrder: supplier.minimumOrder || '',
          leadTime: supplier.leadTime || '',
          specialties: supplier.specialties || [],
          certifications: supplier.certifications || [],
          badges: supplier.badges || [],
          logisticsNotes: supplier.logisticsNotes || '',
          pricingNotes: supplier.pricingNotes || '',
          trustScore: supplier.trustScore || 0,
          isVerified: supplier.isVerified || false,
          isScam: supplier.isScam || false,
          homeRank: supplier.homeRank || 0,
        });
      } catch (error) {
        console.error('Failed to fetch supplier:', error);
        alert('Failed to load company data');
        router.push('/admin/companies');
      } finally {
        setFetching(false);
      }
    };

    fetchSupplier();
  }, [id, authToken, router]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!authToken || isNaN(id)) return;
      
      setLoadingReviews(true);
      try {
        const reviewsData = await api.reviews.getBySupplierAdmin(id, authToken);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id, authToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setLoading(true);
    try {
      await api.suppliers.update(id, formData, authToken);
      router.push('/admin/companies');
    } catch (error: any) {
      alert(error.message || 'Failed to update company');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Company</h1>
          <p className="mt-2 text-slate-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Company</h1>
        <p className="mt-2 text-slate-600">Update company information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug (URL) *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="company-name"
              />
              <p className="mt-1 text-xs text-slate-500">Used in URL: /suppliers/{formData.slug || 'slug'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Short Description</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="One-line summary of the company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Full description of the company and its services"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Contact Information</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Business Details</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Minimum Order</label>
              <input
                type="text"
                value={formData.minimumOrder}
                onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 1 pallet, $500, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Lead Time</label>
              <input
                type="text"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 2-3 days, 1 week, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Logistics Notes</label>
            <textarea
              value={formData.logisticsNotes}
              onChange={(e) => setFormData({ ...formData, logisticsNotes: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Shipping methods, delivery areas, freight details, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Pricing Notes</label>
            <textarea
              value={formData.pricingNotes}
              onChange={(e) => setFormData({ ...formData, pricingNotes: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Pricing structure, payment terms, volume discounts, etc."
            />
          </div>
        </div>

        {/* Tags & Classifications */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Tags & Classifications</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Specialties</label>
            <input
              type="text"
              value={formData.specialties.join(', ')}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Electronics, Apparel, Home Goods (comma-separated)"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple items with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Certifications</label>
            <input
              type="text"
              value={formData.certifications.join(', ')}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="ISO 9001, BBB Accredited, etc. (comma-separated)"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple items with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Badges</label>
            <input
              type="text"
              value={formData.badges.join(', ')}
              onChange={(e) => setFormData({ ...formData, badges: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Top Rated, Fast Shipping, etc. (comma-separated)"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple items with commas</p>
          </div>
        </div>

        {/* Status & Ranking */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Status & Ranking</h3>
          
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Trust Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.trustScore}
                onChange={(e) => setFormData({ ...formData, trustScore: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">0-100 score</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Home Page Rank</label>
              <input
                type="number"
                min="0"
                value={formData.homeRank}
                onChange={(e) => setFormData({ ...formData, homeRank: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Higher = more prominent</p>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">✓ Verified Supplier</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isScam}
                onChange={(e) => setFormData({ ...formData, isScam: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-red-700">⚠️ Mark as Scam</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Company'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-slate-100 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Reviews Management Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            <p className="mt-1 text-sm text-slate-600">Manage all reviews for this company</p>
          </div>
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showAddReview ? 'Cancel' : '+ Add Review'}
          </button>
        </div>

        {/* Add Review Form */}
        {showAddReview && (
          <AddReviewForm
            supplierId={id}
            authToken={authToken!}
            onSuccess={() => {
              setShowAddReview(false);
              // Refresh reviews
              api.reviews.getBySupplierAdmin(id, authToken!).then(setReviews).catch(console.error);
            }}
            onCancel={() => setShowAddReview(false)}
          />
        )}

        {/* Reviews List */}
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
                onSave={() => {
                  setEditingReviewId(null);
                  // Refresh reviews
                  api.reviews.getBySupplierAdmin(id, authToken!).then(setReviews).catch(console.error);
                }}
                onDelete={() => {
                  // Refresh reviews
                  api.reviews.getBySupplierAdmin(id, authToken!).then(setReviews).catch(console.error);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddReviewForm({ supplierId, authToken, onSuccess, onCancel }: { supplierId: number; authToken: string; onSuccess: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    company: '',
    title: '',
    body: '',
    ratingOverall: 5,
    createdAt: new Date().toISOString().split('T')[0],
    isApproved: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.reviews.adminCreate({
        supplierId,
        author: formData.author,
        company: formData.company || undefined,
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
      <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
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
      <div className="grid gap-4 sm:grid-cols-3">
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
    isTrending: review.isTrending,
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
        isTrending: formData.isTrending,
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
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            id={`trending-company-${review.id}`}
            checked={formData.isTrending}
            onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor={`trending-company-${review.id}`} className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-slate-900">Mark as Trending</span>
            </div>
          </label>
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
    <div className={`rounded-lg border bg-white p-4 ${review.isTrending ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {review.isTrending && (
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            )}
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

