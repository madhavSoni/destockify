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
  isVerified?: boolean;
  isScam?: boolean;
  createdAt: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  region?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type Review = {
  id: number;
  author: string;
  ratingOverall: number;
  body: string;
  images: string[];
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
    slug: '',
    shortDescription: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    heroImage: '',
    logoImage: '',
    isVerified: false,
    isScam: false,
    homeRank: 0,
    socialLink: '',
    images: [] as Array<{ id?: number; url: string; caption: string; isPrimary: boolean; order: number }>,
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    regionId: null as number | null,
    categoryIds: [] as number[],
  });
  const [categories, setCategories] = useState<Array<{ id: number; slug: string; name: string }>>([]);
  const [regions, setRegions] = useState<Array<{ id: number; slug: string; name: string }>>([]);
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

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [cats, regs] = await Promise.all([
          api.catalog.categories(),
          api.catalog.regions(),
        ]);
        // We need IDs but API returns slugs - we'll need to map or fetch differently
        // For now, store with slug and we'll handle ID mapping when needed
        setCategories(cats.map((c, idx) => ({ id: idx + 1, slug: c.slug, name: c.name })));
        setRegions(regs.map((r, idx) => ({ id: idx + 1, slug: r.slug, name: r.name })));
      } catch (error) {
        console.error('Failed to load catalog:', error);
      }
    };
    loadCatalog();
  }, []);

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
        slug: fullSupplier.slug || '',
        shortDescription: fullSupplier.shortDescription || '',
        description: fullSupplier.description || '',
        website: fullSupplier.website || '',
        phone: fullSupplier.phone || '',
        email: fullSupplier.email || '',
        heroImage: fullSupplier.heroImage || '',
        logoImage: fullSupplier.logoImage || '',
        isVerified: fullSupplier.isVerified || false,
        isScam: fullSupplier.isScam || false,
        homeRank: fullSupplier.homeRank || 0,
        socialLink: fullSupplier.socialLink || '',
        images: fullSupplier.images || [],
        streetAddress: fullSupplier.streetAddress || '',
        city: fullSupplier.city || '',
        state: fullSupplier.state || '',
        country: fullSupplier.country || '',
        regionId: fullSupplier.regionId || null,
        categoryIds: fullSupplier.categoryIds || [],
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
      // Prepare payload with all fields including new ones
      const payload = {
        ...formData,
        socialLink: formData.socialLink || undefined,
        images: formData.images.map((img, idx) => ({
          ...img,
          order: idx,
        })),
      };
      
      await api.suppliers.update(selectedSupplier.id, payload, authToken);
      
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
                  {supplier.region && (
                    <div className="text-xs text-slate-500 mt-1">
                      {supplier.region.name}
                    </div>
                  )}
                  {(supplier.city || supplier.state || supplier.country) && (
                    <div className="text-xs text-slate-500 mt-1">
                      {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ')}
                    </div>
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
                  {/* Basic Information */}
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                          <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                        <input
                          type="text"
                          value={formData.shortDescription}
                          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Address Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={formData.streetAddress}
                          onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="NY"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Region & Categories */}
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Region & Categories</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                        <select
                          value={formData.regionId || ''}
                          onChange={(e) => setFormData({ ...formData, regionId: e.target.value ? Number(e.target.value) : null })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">No region</option>
                          {regions.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categories</label>
                        <div className="space-y-2">
                          {categories.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.categoryIds.includes(cat.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] });
                                  } else {
                                    setFormData({ ...formData, categoryIds: formData.categoryIds.filter(id => id !== cat.id) });
                                  }
                                }}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700">{cat.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Ranking */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Status & Ranking</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Home Rank</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.homeRank}
                          onChange={(e) => setFormData({ ...formData, homeRank: parseInt(e.target.value) || 0 })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          placeholder="0 = not featured, higher = more prominent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Link */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Social Link</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Social Media URL</label>
                  <input
                    type="url"
                    value={formData.socialLink}
                    onChange={(e) => setFormData({ ...formData, socialLink: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="https://facebook.com/company or https://instagram.com/company"
                  />
                </div>
              </div>

              {/* Company Images */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Company Images</h2>
                <div className="space-y-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex gap-4 items-start p-4 border border-slate-200 rounded-lg">
                      <div className="flex-shrink-0 w-32 h-32 bg-slate-100 rounded-lg overflow-hidden">
                        {img.url ? (
                          <img src={img.url} alt={img.caption || `Image ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Image URL</label>
                          <input
                            type="url"
                            value={img.url}
                            onChange={(e) => {
                              const newImages = [...formData.images];
                              newImages[idx] = { ...newImages[idx], url: e.target.value };
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Caption</label>
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={(e) => {
                              const newImages = [...formData.images];
                              newImages[idx] = { ...newImages[idx], caption: e.target.value };
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Image caption..."
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={img.isPrimary}
                              onChange={(e) => {
                                const newImages = formData.images.map((im, i) => ({
                                  ...im,
                                  isPrimary: i === idx ? e.target.checked : false,
                                }));
                                setFormData({ ...formData, images: newImages });
                              }}
                              className="rounded border-slate-300"
                            />
                            <span className="text-xs text-slate-600">Primary image</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        images: [...formData.images, { url: '', caption: '', isPrimary: formData.images.length === 0, order: formData.images.length }],
                      });
                    }}
                    className="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + Add Image
                  </button>
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
                      {reviews.length} total reviews
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
        body: formData.body,
        ratingOverall: formData.ratingOverall, // Single 1-5 integer rating
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
    author: review.author,
    body: review.body,
    ratingOverall: review.ratingOverall,
    createdAt: review.createdAt.split('T')[0],
    isApproved: review.isApproved,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.reviews.adminUpdate(review.id, {
        author: formData.author,
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
              <span className="rounded-md bg-blue-600/10 px-2.5 py-1 text-xs font-medium text-blue-600">Approved</span>
            ) : (
              <span className="rounded-md bg-black/5 px-2.5 py-1 text-xs font-medium text-black/70">Pending</span>
            )}
          </div>
          <p className="text-sm text-slate-700 mb-2">{review.body}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>By: {review.author}</span>
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
