'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

type AdminTab = 'dashboard' | 'suppliers' | 'reviews' | 'categories' | 'regions';

interface Category {
  id: number;
  name: string;
  slug: string;
  headline?: string | null;
  description?: string | null;
  icon?: string | null;
  supplierCount: number;
}

interface Region {
  id: number;
  name: string;
  slug: string;
  headline?: string | null;
  description?: string | null;
  stateCode?: string | null;
  marketStats?: any;
  mapImage?: string | null;
  supplierCount: number;
}

interface SupplierSummary {
  id: number;
  name: string;
  slug: string;
  email?: string | null;
  isVerified: boolean;
  isScam: boolean;
  createdAt: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  region?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

interface ReviewSummary {
  id: number;
  author: string;
  ratingOverall: number;
  body: string;
  isApproved: boolean;
  createdAt: string;
  supplier: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function AdminPage() {
  const { authToken } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryEditingId, setCategoryEditingId] = useState<number | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    headline: '',
    description: '',
    icon: '',
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Regions state
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionEditingId, setRegionEditingId] = useState<number | null>(null);
  const [regionFormData, setRegionFormData] = useState({
    name: '',
    slug: '',
    headline: '',
    description: '',
    stateCode: '',
    mapImage: '',
    marketStats: '',
  });
  const [isCreatingRegion, setIsCreatingRegion] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    if (authToken && activeTab === 'dashboard') {
      setDashboardLoading(true);
      api.admin
        .dashboard(authToken)
        .then(setDashboardData)
        .catch(console.error)
        .finally(() => setDashboardLoading(false));
    }
  }, [authToken, activeTab]);

  // Load suppliers
  useEffect(() => {
    if (authToken && activeTab === 'suppliers') {
      setSuppliersLoading(true);
      api.admin.suppliers
        .list(authToken, { search: supplierSearch || undefined, limit: 100 })
        .then((result) => setSuppliers(result.items || []))
        .catch(console.error)
        .finally(() => setSuppliersLoading(false));
    }
  }, [authToken, activeTab, supplierSearch]);

  // Load reviews
  useEffect(() => {
    if (authToken && activeTab === 'reviews') {
      setReviewsLoading(true);
      const status = reviewFilter === 'all' ? undefined : reviewFilter === 'pending' ? 'pending' : 'approved';
      api.reviews
        .getAllAdmin(authToken, { status: status as any, limit: 100 })
        .then((result) => setReviews(result.items || []))
        .catch(console.error)
        .finally(() => setReviewsLoading(false));
    }
  }, [authToken, activeTab, reviewFilter]);

  // Load categories
  useEffect(() => {
    if (authToken && activeTab === 'categories') {
      setCategoriesLoading(true);
      api.admin.categories
        .list(authToken)
        .then(setCategories)
        .catch((err: any) => {
          setCategoryError(err.message);
          setCategories([]);
        })
        .finally(() => setCategoriesLoading(false));
    }
  }, [authToken, activeTab]);

  // Load regions
  useEffect(() => {
    if (authToken && activeTab === 'regions') {
      setRegionsLoading(true);
      api.admin.regions
        .list(authToken)
        .then(setRegions)
        .catch((err: any) => {
          setRegionError(err.message);
          setRegions([]);
        })
        .finally(() => setRegionsLoading(false));
    }
  }, [authToken, activeTab]);

  // Category handlers
  const handleCreateCategory = async () => {
    if (!authToken || !categoryFormData.name.trim()) return;
    try {
      setCategoryError(null);
      const newCategory = await api.admin.categories.create(categoryFormData, authToken);
      setCategories([...categories, newCategory]);
      setCategoryFormData({ name: '', slug: '', headline: '', description: '', icon: '' });
      setIsCreatingCategory(false);
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!authToken) return;
    try {
      setCategoryError(null);
      const updated = await api.admin.categories.update(id, categoryFormData, authToken);
      setCategories(categories.map((c) => (c.id === id ? updated : c)));
      setCategoryEditingId(null);
      setCategoryFormData({ name: '', slug: '', headline: '', description: '', icon: '' });
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!authToken || !confirm('Are you sure you want to delete this category?')) return;
    try {
      setCategoryError(null);
      await api.admin.categories.delete(id, authToken);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      setCategoryError(err.message || 'Failed to delete category');
    }
  };

  const startEditCategory = (category: Category) => {
    setCategoryEditingId(category.id);
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      headline: category.headline || '',
      description: category.description || '',
      icon: category.icon || '',
    });
    setIsCreatingCategory(false);
  };

  const cancelEditCategory = () => {
    setCategoryEditingId(null);
    setIsCreatingCategory(false);
    setCategoryFormData({ name: '', slug: '', headline: '', description: '', icon: '' });
  };

  // Region handlers
  const handleCreateRegion = async () => {
    if (!authToken || !regionFormData.name.trim()) return;
    try {
      setRegionError(null);
      const payload: any = { ...regionFormData };
      if (payload.marketStats) {
        try {
          payload.marketStats = JSON.parse(payload.marketStats);
        } catch {
          payload.marketStats = null;
        }
      } else {
        payload.marketStats = null;
      }
      const newRegion = await api.admin.regions.create(payload, authToken);
      setRegions([...regions, newRegion]);
      setRegionFormData({ name: '', slug: '', headline: '', description: '', stateCode: '', mapImage: '', marketStats: '' });
      setIsCreatingRegion(false);
    } catch (err: any) {
      setRegionError(err.message || 'Failed to create region');
    }
  };

  const handleUpdateRegion = async (id: number) => {
    if (!authToken) return;
    try {
      setRegionError(null);
      const payload: any = { ...regionFormData };
      if (payload.marketStats) {
        try {
          payload.marketStats = JSON.parse(payload.marketStats);
        } catch {
          payload.marketStats = null;
        }
      }
      const updated = await api.admin.regions.update(id, payload, authToken);
      setRegions(regions.map((r) => (r.id === id ? updated : r)));
      setRegionEditingId(null);
      setRegionFormData({ name: '', slug: '', headline: '', description: '', stateCode: '', mapImage: '', marketStats: '' });
    } catch (err: any) {
      setRegionError(err.message || 'Failed to update region');
    }
  };

  const handleDeleteRegion = async (id: number) => {
    if (!authToken || !confirm('Are you sure you want to delete this region?')) return;
    try {
      setRegionError(null);
      await api.admin.regions.delete(id, authToken);
      setRegions(regions.filter((r) => r.id !== id));
    } catch (err: any) {
      setRegionError(err.message || 'Failed to delete region');
    }
  };

  const startEditRegion = (region: Region) => {
    setRegionEditingId(region.id);
    setRegionFormData({
      name: region.name,
      slug: region.slug,
      headline: region.headline || '',
      description: region.description || '',
      stateCode: region.stateCode || '',
      mapImage: region.mapImage || '',
      marketStats: region.marketStats ? JSON.stringify(region.marketStats, null, 2) : '',
    });
    setIsCreatingRegion(false);
  };

  const cancelEditRegion = () => {
    setRegionEditingId(null);
    setIsCreatingRegion(false);
    setRegionFormData({ name: '', slug: '', headline: '', description: '', stateCode: '', mapImage: '', marketStats: '' });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {(['dashboard', 'suppliers', 'reviews', 'categories', 'regions'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Overview of your directory</p>
          </div>

          {dashboardLoading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : dashboardData ? (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-600">Total Companies</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">{dashboardData.stats.totalSuppliers}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-600">Total Reviews</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">{dashboardData.stats.totalReviews}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-medium text-slate-600">Pending Reviews</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">{dashboardData.stats.pendingReviews}</div>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Companies</h2>
                  <ul className="divide-y divide-slate-100">
                    {dashboardData.recentActivity.suppliers.slice(0, 5).map((s: any) => (
                      <li key={s.id} className="py-3">
                        <Link href={`/admin/companies/${s.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-700">
                          {s.name}
                        </Link>
                        <div className="text-xs text-slate-500 mt-1">{new Date(s.createdAt).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Reviews</h2>
                  <ul className="divide-y divide-slate-100">
                    {dashboardData.recentActivity.reviews.slice(0, 5).map((r: any) => (
                      <li key={r.id} className="py-3">
                        <div className="text-sm font-semibold text-slate-900">{r.reviewer}</div>
                        <div className="text-xs text-slate-500 mt-1">{r.supplier.name} • {new Date(r.createdAt).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
              <p className="mt-1 text-sm text-slate-600">Manage suppliers and companies</p>
            </div>
            <Link
              href="/admin/companies/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Supplier
            </Link>
          </div>

          <div>
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Search suppliers..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {suppliersLoading ? (
            <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {supplier.region?.name || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          {supplier.isVerified && (
                            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                              Verified
                            </span>
                          )}
                          {supplier.isScam && (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                              Scam
                            </span>
                          )}
                          {!supplier.isVerified && !supplier.isScam && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {new Date(supplier.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <Link
                          href={`/admin/companies/${supplier.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
              <p className="mt-1 text-sm text-slate-600">Manage customer reviews</p>
            </div>
            <Link
              href="/admin/reviews"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View All
            </Link>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                reviewFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setReviewFilter('pending')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                reviewFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setReviewFilter('approved')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                reviewFilter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Approved
            </button>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{review.author}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{review.supplier.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{review.ratingOverall}/5</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {review.isApproved ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <Link
                          href="/admin/reviews"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
              <p className="mt-1 text-sm text-slate-600">Manage supplier categories</p>
            </div>
            <button
              onClick={() => {
                setIsCreatingCategory(true);
                setCategoryEditingId(null);
                setCategoryFormData({ name: '', slug: '', headline: '', description: '', icon: '' });
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Category
            </button>
          </div>

          {categoryError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {categoryError}
            </div>
          )}

          {(isCreatingCategory || categoryEditingId !== null) && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                {isCreatingCategory ? 'Create Category' : 'Edit Category'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCategoryFormData({
                        ...categoryFormData,
                        name,
                        slug: categoryFormData.slug || name.toLowerCase().replace(/\s+/g, '-'),
                      });
                    }}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Category Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={categoryFormData.slug}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={categoryFormData.headline}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, headline: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Category headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icon URL</label>
                  <input
                    type="text"
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      isCreatingCategory ? handleCreateCategory() : categoryEditingId && handleUpdateCategory(categoryEditingId)
                    }
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {isCreatingCategory ? 'Create' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditCategory}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {categoriesLoading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Suppliers</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{category.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{category.slug}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{category.supplierCount}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        {category.supplierCount === 0 ? (
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs" title="Cannot delete: has suppliers">
                            Delete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Regions Tab */}
      {activeTab === 'regions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Regions</h1>
              <p className="mt-1 text-sm text-slate-600">Manage supplier regions</p>
            </div>
            <button
              onClick={() => {
                setIsCreatingRegion(true);
                setRegionEditingId(null);
                setRegionFormData({ name: '', slug: '', headline: '', description: '', stateCode: '', mapImage: '', marketStats: '' });
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Region
            </button>
          </div>

          {regionError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {regionError}
            </div>
          )}

          {(isCreatingRegion || regionEditingId !== null) && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                {isCreatingRegion ? 'Create Region' : 'Edit Region'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regionFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setRegionFormData({
                        ...regionFormData,
                        name,
                        slug: regionFormData.slug || name.toLowerCase().replace(/\s+/g, '-'),
                      });
                    }}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Region Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={regionFormData.slug}
                    onChange={(e) => setRegionFormData({ ...regionFormData, slug: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="region-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={regionFormData.headline}
                    onChange={(e) => setRegionFormData({ ...regionFormData, headline: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Region headline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={regionFormData.description}
                    onChange={(e) => setRegionFormData({ ...regionFormData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Region description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State Code</label>
                  <input
                    type="text"
                    value={regionFormData.stateCode}
                    onChange={(e) => setRegionFormData({ ...regionFormData, stateCode: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Map Image URL</label>
                  <input
                    type="text"
                    value={regionFormData.mapImage}
                    onChange={(e) => setRegionFormData({ ...regionFormData, mapImage: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="https://example.com/map.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Market Stats (JSON)</label>
                  <textarea
                    value={regionFormData.marketStats}
                    onChange={(e) => setRegionFormData({ ...regionFormData, marketStats: e.target.value })}
                    rows={5}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder='{"key": "value"}'
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter valid JSON or leave empty</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      isCreatingRegion ? handleCreateRegion() : regionEditingId && handleUpdateRegion(regionEditingId)
                    }
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {isCreatingRegion ? 'Create' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditRegion}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {regionsLoading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">State</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Suppliers</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {regions.map((region) => (
                    <tr key={region.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{region.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{region.slug}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{region.stateCode || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{region.supplierCount}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <button
                          onClick={() => startEditRegion(region)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        {region.supplierCount === 0 ? (
                          <button
                            onClick={() => handleDeleteRegion(region.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs" title="Cannot delete: has suppliers">
                            Delete
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
