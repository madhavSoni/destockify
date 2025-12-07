'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { US_STATES } from '@/lib/constants/states';
import { COUNTRIES } from '@/lib/constants/countries';
import type { SupplierAddress } from '@/lib/api';

type AdminTab = 'dashboard' | 'suppliers' | 'reviews' | 'categories' | 'regions' | 'category-pages';

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
  logoImage?: string | null;
  heroImage?: string | null;
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

// Supplier List Component
interface SupplierListContentProps {
  suppliers: SupplierSummary[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  selectedId: number | null;
  onSelectSupplier: (id: number) => void;
  bodyClassName?: string;
}

function SupplierListContent({
  suppliers,
  loading,
  search,
  setSearch,
  selectedId,
  onSelectSupplier,
  bodyClassName = 'flex-1 overflow-y-auto min-h-0',
}: SupplierListContentProps) {
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="border-b px-4 py-3 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <div className="text-xs text-gray-500">
          {loading
            ? 'Loading suppliers...'
            : filteredSuppliers.length === 0
            ? 'No suppliers found'
            : `Showing ${filteredSuppliers.length} supplier${filteredSuppliers.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      <div className={bodyClassName}>
        {loading ? (
          <div className="px-4 py-6 text-sm text-gray-500">Loading suppliers…</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500">No suppliers found.</div>
        ) : (
          <ul>
            {filteredSuppliers.map((supplier) => {
              const isActive = supplier.id === selectedId;
              return (
                <li key={supplier.id}>
                  <button
                    onClick={() => onSelectSupplier(supplier.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all border-l-2 ${
                      isActive
                        ? 'bg-white border-l-black font-medium shadow-sm'
                        : 'border-l-transparent hover:bg-white hover:border-l-gray-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center relative">
                      {supplier.logoImage || supplier.heroImage ? (
                        <img 
                          src={supplier.logoImage || supplier.heroImage || ''} 
                          alt={supplier.name} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-initial');
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }} 
                        />
                      ) : null}
                      <span className="fallback-initial text-gray-500 text-xs font-medium absolute inset-0 flex items-center justify-center" style={{ display: (supplier.logoImage || supplier.heroImage) ? 'none' : 'flex' }}>
                        {supplier.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{supplier.name}</p>
                        {supplier.isVerified && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Verified
                          </span>
                        )}
                        {supplier.isScam && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Scam
                          </span>
                        )}
                      </div>
                      {supplier.email && (
                        <p className="mt-1 text-xs text-gray-600 truncate">{supplier.email}</p>
                      )}
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ') || 'No location'}
                        {supplier.region && ` • ${supplier.region.name}`}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

// Category Page List Component
interface CategoryPageListContentProps {
  categoryPages: any[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  selectedId: number | null;
  onSelectCategoryPage: (id: number) => void;
  bodyClassName?: string;
}

function CategoryPageListContent({
  categoryPages,
  loading,
  search,
  setSearch,
  selectedId,
  onSelectCategoryPage,
  bodyClassName = 'flex-1 overflow-y-auto min-h-0',
}: CategoryPageListContentProps) {
  const filteredPages = categoryPages.filter((page) =>
    page.pageTitle?.toLowerCase().includes(search.toLowerCase()) ||
    page.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="border-b px-4 py-3 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category pages..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <div className="text-xs text-gray-500">
          {loading
            ? 'Loading category pages...'
            : filteredPages.length === 0
            ? 'No category pages found'
            : `Showing ${filteredPages.length} page${filteredPages.length !== 1 ? 's' : ''}`}
        </div>
      </div>
      <div className={bodyClassName}>
        {loading ? (
          <div className="px-4 py-6 text-sm text-gray-500">Loading category pages…</div>
        ) : filteredPages.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500">No category pages found.</div>
        ) : (
          <ul>
            {filteredPages.map((page) => {
              const isActive = page.id === selectedId;
              return (
                <li key={page.id}>
                  <button
                    onClick={() => onSelectCategoryPage(page.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all border-l-2 ${
                      isActive
                        ? 'bg-white border-l-black font-medium shadow-sm'
                        : 'border-l-transparent hover:bg-white hover:border-l-gray-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center relative">
                      {page.heroImage ? (
                        <img 
                          src={page.heroImage} 
                          alt={page.heroImageAlt || page.pageTitle || 'Category page'} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback-initial');
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }} 
                        />
                      ) : null}
                      <span className="fallback-initial text-gray-500 text-xs font-medium absolute inset-0 flex items-center justify-center" style={{ display: page.heroImage ? 'none' : 'flex' }}>
                        {page.pageTitle?.charAt(0).toUpperCase() || '📄'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{page.pageTitle || 'Untitled'}</p>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-500">
                        /{page.slug || 'no-slug'}
                      </p>
                      {page.createdAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(page.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
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
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState<any>(null);
  const [loadingSupplierDetails, setLoadingSupplierDetails] = useState(false);
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || null;

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

  // Category Pages state
  const [categoryPages, setCategoryPages] = useState<any[]>([]);
  const [categoryPagesLoading, setCategoryPagesLoading] = useState(false);
  const [categoryPageEditingId, setCategoryPageEditingId] = useState<number | null>(null);
  const [isCreatingCategoryPage, setIsCreatingCategoryPage] = useState(false);
  const [categoryPageError, setCategoryPageError] = useState<string | null>(null);
  const [selectedCategoryPageId, setSelectedCategoryPageId] = useState<number | null>(null);
  const [categoryPageSearch, setCategoryPageSearch] = useState('');
  const [categoryPageFormData, setCategoryPageFormData] = useState({
    pageTitle: '',
    metaTitle: '',
    metaDescription: '',
    slug: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    noindex: false,
    nofollow: false,
    enableFaqSchema: true,
    enableBreadcrumbSchema: true,
    customSchema: '',
    heroImage: '',
    heroImageAlt: '',
    heroH1: '',
    heroText: '',
    featuredSuppliersH2: '',
    featuredSuppliersText: '',
    supplierSourceType: 'manual',
    supplierIds: [] as number[],
    centeredValueH2: '',
    centeredValueText: '',
    contentBlocks: [] as any[],
    faqSectionH2: '',
    faqs: [] as any[],
    internalLinks: null as any,
    customHtml: '',
    lastUpdated: null as Date | null,
    authorOverride: '',
    topicCategory: '',
    enableDivider: false,
  });
  const [availableSuppliers, setAvailableSuppliers] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  
  // Category Page image upload state
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [uploadingContentBlockImages, setUploadingContentBlockImages] = useState<Record<number, boolean>>({});

  // Supplier edit form state
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    heroImage: '',
    logoImage: '',
    socialLink: '',
    regionId: null as number | null,
    categoryIds: [] as number[],
    addresses: [] as SupplierAddress[],
    isVerified: false,
    isScam: false,
    isContractHolder: false,
    isBroker: false,
    homeRank: 0,
  });
  const [supplierFormLoading, setSupplierFormLoading] = useState(false);
  const [supplierFormError, setSupplierFormError] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [catalogCategories, setCatalogCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [catalogRegions, setCatalogRegions] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  // Load initial counts on mount
  useEffect(() => {
    if (!authToken) return;
    
    // Load dashboard for counts
    api.admin.dashboard(authToken)
      .then((data) => {
        setDashboardData(data);
      })
      .catch(console.error);
    
    // Load suppliers for count and list
    api.admin.suppliers.list(authToken, { limit: 100 })
      .then((result) => setSuppliers(result.items || []))
      .catch(console.error);
    
    // Load categories for count
    api.admin.categories.list(authToken)
      .then(setCategories)
      .catch(() => setCategories([]));
    
    // Load regions for count
    api.admin.regions.list(authToken)
      .then(setRegions)
      .catch(() => setRegions([]));
    
    // Load reviews for count
    api.reviews.getAllAdmin(authToken, { limit: 100 })
      .then((result) => setReviews(result.items || []))
      .catch(console.error);
  }, [authToken]);

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
        .then((result) => {
          setSuppliers(result.items || []);
          // Reset selection if selected supplier is no longer in list
          if (selectedSupplierId && !result.items?.find((s) => s.id === selectedSupplierId)) {
            setSelectedSupplierId(null);
          }
        })
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

  // Load category pages
  useEffect(() => {
    if (authToken && activeTab === 'category-pages') {
      setCategoryPagesLoading(true);
      api.admin.categoryPages
        .list(authToken)
        .then((result) => setCategoryPages(result.items || []))
        .catch((err: any) => {
          setCategoryPageError(err.message);
          setCategoryPages([]);
        })
        .finally(() => setCategoryPagesLoading(false));
      
      // Also load suppliers for the supplier selector
      api.admin.suppliers
        .list(authToken, { limit: 1000 })
        .then((result) => setAvailableSuppliers(result.items?.map((s: any) => ({ id: s.id, name: s.name, slug: s.slug })) || []))
        .catch(console.error);
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

  // Category Page handlers
  const handleCreateCategoryPage = async () => {
    if (!authToken || !categoryPageFormData.pageTitle.trim() || !categoryPageFormData.metaTitle.trim()) return;
    try {
      setCategoryPageError(null);
      const payload: any = { ...categoryPageFormData };
      // Parse JSON fields
      if (payload.customSchema) {
        try {
          payload.customSchema = JSON.parse(payload.customSchema);
        } catch {
          payload.customSchema = null;
        }
      } else {
        payload.customSchema = null;
      }
      if (payload.internalLinks) {
        try {
          payload.internalLinks = JSON.parse(payload.internalLinks);
        } catch {
          payload.internalLinks = null;
        }
      } else {
        payload.internalLinks = null;
      }
      // Ensure arrays are arrays
      if (!Array.isArray(payload.contentBlocks)) payload.contentBlocks = [];
      if (!Array.isArray(payload.faqs)) payload.faqs = [];
      if (!Array.isArray(payload.supplierIds)) payload.supplierIds = [];
      
      const newPage = await api.admin.categoryPages.create(payload, authToken);
      setCategoryPages([...categoryPages, newPage]);
      setSelectedCategoryPageId(newPage.id);
      startEditCategoryPage(newPage);
      setIsCreatingCategoryPage(false);
    } catch (err: any) {
      setCategoryPageError(err.message || 'Failed to create category page');
    }
  };

  const handleUpdateCategoryPage = async (id: number) => {
    if (!authToken) return;
    try {
      setCategoryPageError(null);
      const payload: any = { ...categoryPageFormData };
      // Parse JSON fields
      if (payload.customSchema) {
        try {
          payload.customSchema = JSON.parse(payload.customSchema);
        } catch {
          payload.customSchema = null;
        }
      } else {
        payload.customSchema = null;
      }
      if (payload.internalLinks) {
        try {
          payload.internalLinks = JSON.parse(payload.internalLinks);
        } catch {
          payload.internalLinks = null;
        }
      } else {
        payload.internalLinks = null;
      }
      // Ensure arrays are arrays
      if (!Array.isArray(payload.contentBlocks)) payload.contentBlocks = [];
      if (!Array.isArray(payload.faqs)) payload.faqs = [];
      if (!Array.isArray(payload.supplierIds)) payload.supplierIds = [];
      
      const updated = await api.admin.categoryPages.update(id, payload, authToken);
      setCategoryPages(categoryPages.map((p) => (p.id === id ? updated : p)));
      resetCategoryPageForm();
      setCategoryPageEditingId(null);
    } catch (err: any) {
      setCategoryPageError(err.message || 'Failed to update category page');
    }
  };

  const handleDeleteCategoryPage = async (id: number) => {
    if (!authToken || !confirm('Are you sure you want to delete this category page?')) return;
    try {
      setCategoryPageError(null);
      await api.admin.categoryPages.delete(id, authToken);
      setCategoryPages(categoryPages.filter((p) => p.id !== id));
      if (selectedCategoryPageId === id) {
        setSelectedCategoryPageId(null);
        setCategoryPageEditingId(null);
        setIsCreatingCategoryPage(false);
        resetCategoryPageForm();
      }
    } catch (err: any) {
      setCategoryPageError(err.message || 'Failed to delete category page');
    }
  };

  const startEditCategoryPage = (page: any) => {
    setCategoryPageEditingId(page.id);
    setSelectedCategoryPageId(page.id);
    setHeroImagePreview(page.heroImage || null);
    setOgImagePreview(page.ogImage || null);
    setCategoryPageFormData({
      pageTitle: page.pageTitle || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      slug: page.slug || '',
      canonicalUrl: page.canonicalUrl || '',
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImage: page.ogImage || '',
      noindex: page.noindex || false,
      nofollow: page.nofollow || false,
      enableFaqSchema: page.enableFaqSchema ?? true,
      enableBreadcrumbSchema: page.enableBreadcrumbSchema ?? true,
      customSchema: page.customSchema ? JSON.stringify(page.customSchema, null, 2) : '',
      heroImage: page.heroImage || '',
      heroImageAlt: page.heroImageAlt || '',
      heroH1: page.heroH1 || '',
      heroText: page.heroText || '',
      featuredSuppliersH2: page.featuredSuppliersH2 || '',
      featuredSuppliersText: page.featuredSuppliersText || '',
      supplierSourceType: page.supplierSourceType || 'manual',
      supplierIds: Array.isArray(page.supplierIds) ? page.supplierIds : [],
      centeredValueH2: page.centeredValueH2 || '',
      centeredValueText: page.centeredValueText || '',
      contentBlocks: Array.isArray(page.contentBlocks) ? page.contentBlocks : [],
      faqSectionH2: page.faqSectionH2 || '',
      faqs: Array.isArray(page.faqs) ? page.faqs : [],
      internalLinks: page.internalLinks ? JSON.stringify(page.internalLinks, null, 2) : null,
      customHtml: page.customHtml || '',
      lastUpdated: page.lastUpdated ? new Date(page.lastUpdated) : null,
      authorOverride: page.authorOverride || '',
      topicCategory: page.topicCategory || '',
      enableDivider: page.enableDivider || false,
    });
  };

  const resetCategoryPageForm = () => {
    setCategoryPageFormData({
      pageTitle: '',
      metaTitle: '',
      metaDescription: '',
      slug: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      enableFaqSchema: true,
      enableBreadcrumbSchema: true,
      customSchema: '',
      heroImage: '',
      heroImageAlt: '',
      heroH1: '',
      heroText: '',
      featuredSuppliersH2: '',
      featuredSuppliersText: '',
      supplierSourceType: 'manual',
      supplierIds: [],
      centeredValueH2: '',
      centeredValueText: '',
      contentBlocks: [],
      faqSectionH2: '',
      faqs: [],
      internalLinks: null,
      customHtml: '',
      lastUpdated: null,
      authorOverride: '',
      topicCategory: '',
      enableDivider: false,
    });
    setHeroImagePreview(null);
    setOgImagePreview(null);
    setHeroImageFile(null);
    setOgImageFile(null);
  };

  const cancelEditCategoryPage = () => {
    setCategoryPageEditingId(null);
    setSelectedCategoryPageId(null);
    setIsCreatingCategoryPage(false);
    resetCategoryPageForm();
    setHeroImagePreview(null);
    setOgImagePreview(null);
    setHeroImageFile(null);
    setOgImageFile(null);
  };

  // Category Page image upload handlers
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    setHeroImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setHeroImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingHeroImage(true);
    try {
      const url = await api.admin.uploadImage(file, authToken);
      setCategoryPageFormData({ ...categoryPageFormData, heroImage: url });
    } catch (error: any) {
      alert(error.message || 'Failed to upload hero image');
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    setOgImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOgImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingOgImage(true);
    try {
      const url = await api.admin.uploadImage(file, authToken);
      setCategoryPageFormData({ ...categoryPageFormData, ogImage: url });
    } catch (error: any) {
      alert(error.message || 'Failed to upload OG image');
    } finally {
      setUploadingOgImage(false);
    }
  };

  const handleContentBlockImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, blockIndex: number) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    setUploadingContentBlockImages({ ...uploadingContentBlockImages, [blockIndex]: true });
    try {
      const url = await api.admin.uploadImage(file, authToken);
      const newBlocks = [...categoryPageFormData.contentBlocks];
      newBlocks[blockIndex] = { ...newBlocks[blockIndex], image: url };
      setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
    } catch (error: any) {
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploadingContentBlockImages({ ...uploadingContentBlockImages, [blockIndex]: false });
    }
  };

  // Supplier form handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingLogo(true);
    try {
      const url = await api.admin.uploadImage(file, authToken);
      setSupplierFormData({ ...supplierFormData, logoImage: url });
    } catch (error: any) {
      alert(error.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    setBannerFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingBanner(true);
    try {
      const url = await api.admin.uploadImage(file, authToken);
      setSupplierFormData({ ...supplierFormData, heroImage: url });
    } catch (error: any) {
      alert(error.message || 'Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveSupplier = async () => {
    if (!authToken || !selectedSupplierId) return;

    setSupplierFormLoading(true);
    setSupplierFormError(null);
    try {
      const payload: any = {
        ...supplierFormData,
        addresses: supplierFormData.addresses.map(addr => ({
          id: addr.id,
          streetAddress: addr.streetAddress || undefined,
          city: addr.city || undefined,
          state: addr.state || undefined,
          country: addr.country || undefined,
          zipCode: addr.zipCode || undefined,
        })),
      };
      await api.suppliers.update(selectedSupplierId, payload, authToken);
      // Refresh suppliers list
      const result = await api.admin.suppliers.list(authToken, { limit: 100 });
      setSuppliers(result.items || []);
      // Reload supplier details
      const details = await api.suppliers.getByIdAdmin(selectedSupplierId, authToken);
      setSelectedSupplierDetails(details);
      alert('Supplier updated successfully!');
    } catch (error: any) {
      setSupplierFormError(error.message || 'Failed to update supplier');
    } finally {
      setSupplierFormLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.city && !newAddress.state && !newAddress.country) {
      alert('Please fill in at least city, state, or country');
      return;
    }
    setSupplierFormData({
      ...supplierFormData,
      addresses: [
        ...supplierFormData.addresses,
        {
          id: Date.now(),
          streetAddress: newAddress.streetAddress || null,
          city: newAddress.city || null,
          state: newAddress.state || null,
          country: newAddress.country || null,
          zipCode: newAddress.zipCode || null,
        },
      ],
    });
    setNewAddress({ streetAddress: '', city: '', state: '', country: '', zipCode: '' });
  };

  const handleDeleteAddress = (addressId: number) => {
    setSupplierFormData({
      ...supplierFormData,
      addresses: supplierFormData.addresses.filter(addr => addr.id !== addressId),
    });
  };

  const handleEditAddress = (address: SupplierAddress) => {
    setEditingAddressId(address.id);
    setNewAddress({
      streetAddress: address.streetAddress || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || '',
      zipCode: address.zipCode || '',
    });
  };

  const handleSaveEditAddress = () => {
    if (!editingAddressId) return;
    setSupplierFormData({
      ...supplierFormData,
      addresses: supplierFormData.addresses.map(addr =>
        addr.id === editingAddressId
          ? {
              ...addr,
              streetAddress: newAddress.streetAddress || null,
              city: newAddress.city || null,
              state: newAddress.state || null,
              country: newAddress.country || null,
              zipCode: newAddress.zipCode || null,
            }
          : addr
      ),
    });
    setEditingAddressId(null);
    setNewAddress({ streetAddress: '', city: '', state: '', country: '', zipCode: '' });
  };

  const handleCancelEditAddress = () => {
    setEditingAddressId(null);
    setNewAddress({ streetAddress: '', city: '', state: '', country: '', zipCode: '' });
  };

  // Load catalog data for supplier form
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [cats, regs] = await Promise.all([
          api.catalog.categories(),
          api.catalog.regions(),
        ]);
        setCatalogCategories(cats.map((c: any) => ({ id: c.id || 0, name: c.name, slug: c.slug })));
        setCatalogRegions(regs.map((r: any) => ({ id: r.id || 0, name: r.name, slug: r.slug })));
      } catch (error) {
        console.error('Failed to load catalog:', error);
      }
    };
    loadCatalog();
  }, []);

  // Load supplier details when selected
  useEffect(() => {
    if (authToken && selectedSupplierId) {
      setLoadingSupplierDetails(true);
      api.suppliers.getByIdAdmin(selectedSupplierId, authToken)
        .then((details) => {
          setSelectedSupplierDetails(details);
          setSupplierFormData({
            name: details.name || '',
            slug: details.slug || '',
            shortDescription: details.shortDescription || '',
            description: details.description || '',
            website: details.website || '',
            phone: details.phone || '',
            email: details.email || '',
            heroImage: details.heroImage || '',
            logoImage: details.logoImage || '',
            socialLink: details.socialLink || '',
            regionId: details.regionId || null,
            categoryIds: details.categoryIds || [],
            addresses: details.addresses || [],
            isVerified: details.isVerified || false,
            isScam: details.isScam || false,
            isContractHolder: details.isContractHolder || false,
            isBroker: details.isBroker || false,
            homeRank: details.homeRank || 0,
          });
          setLogoPreview(details.logoImage || null);
          setBannerPreview(details.heroImage || null);
        })
        .catch((err) => {
          console.error('Failed to load supplier details:', err);
          setSelectedSupplierDetails(null);
        })
        .finally(() => setLoadingSupplierDetails(false));
    } else {
      setSelectedSupplierDetails(null);
    }
  }, [authToken, selectedSupplierId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Destockify Admin Panel</h1>
              <p className="text-sm text-gray-600">Manage suppliers, reviews, categories, and regions.</p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'suppliers' && (
                <Link
                  href="/admin/companies/new"
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Add Supplier
                </Link>
              )}
              {activeTab === 'categories' && (
                <button
                  onClick={() => {
                    setIsCreatingCategory(true);
                    setCategoryEditingId(null);
                    setCategoryFormData({ name: '', slug: '', headline: '', description: '', icon: '' });
                  }}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Add Category
                </button>
              )}
              {activeTab === 'regions' && (
                <button
                  onClick={() => {
                    setIsCreatingRegion(true);
                    setRegionEditingId(null);
                    setRegionFormData({ name: '', slug: '', headline: '', description: '', stateCode: '', mapImage: '', marketStats: '' });
                  }}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Add Region
                </button>
              )}
              {activeTab === 'category-pages' && (
                <button
                  onClick={() => {
                    setIsCreatingCategoryPage(true);
                    setCategoryPageEditingId(null);
                    setSelectedCategoryPageId(null);
                    resetCategoryPageForm();
                  }}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Add Category Page
                </button>
              )}
            </div>
          </div>
          <nav className="border-t">
            <div className="flex items-center gap-4 py-3 text-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700 font-medium px-3 py-1.5 rounded-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-md transition-colors'}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={activeTab === 'suppliers' ? 'bg-rose-100 text-rose-700 font-medium px-3 py-1.5 rounded-md' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 rounded-md transition-colors'}
              >
                Suppliers <span className="text-gray-500">({suppliers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={activeTab === 'reviews' ? 'bg-amber-100 text-amber-700 font-medium px-3 py-1.5 rounded-md' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600 px-3 py-1.5 rounded-md transition-colors'}
              >
                Reviews <span className="text-gray-500">({reviews.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={activeTab === 'categories' ? 'bg-sky-100 text-sky-700 font-medium px-3 py-1.5 rounded-md' : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600 px-3 py-1.5 rounded-md transition-colors'}
              >
                Categories <span className="text-gray-500">({categories.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('regions')}
                className={activeTab === 'regions' ? 'bg-emerald-100 text-emerald-700 font-medium px-3 py-1.5 rounded-md' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded-md transition-colors'}
              >
                Regions <span className="text-gray-500">({regions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('category-pages')}
                className={activeTab === 'category-pages' ? 'bg-purple-100 text-purple-700 font-medium px-3 py-1.5 rounded-md' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 px-3 py-1.5 rounded-md transition-colors'}
              >
                Category Pages <span className="text-gray-500">({categoryPages.length})</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
              <p className="mt-1 text-sm text-gray-600">Overview of your directory</p>
            </div>

            {dashboardLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : dashboardData ? (
              <>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Total Companies</div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{dashboardData.stats.totalSuppliers}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Total Reviews</div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{dashboardData.stats.totalReviews}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Pending Reviews</div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{dashboardData.stats.pendingReviews}</div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Companies</h2>
                    <ul className="divide-y divide-gray-100">
                      {dashboardData.recentActivity.suppliers.slice(0, 5).map((s: any) => (
                        <li key={s.id} className="py-3">
                          <Link href={`/admin/companies/${s.id}`} className="text-sm font-semibold text-gray-900 hover:text-blue-700">
                            {s.name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">{new Date(s.createdAt).toLocaleDateString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                    <ul className="divide-y divide-gray-100">
                      {dashboardData.recentActivity.reviews.slice(0, 5).map((r: any) => (
                        <li key={r.id} className="py-3">
                          <div className="text-sm font-semibold text-gray-900">{r.reviewer}</div>
                          <div className="text-xs text-gray-500 mt-1">{r.supplier.name} • {new Date(r.createdAt).toLocaleDateString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'suppliers' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Supplier Management</h2>
              <p className="mt-1 text-sm text-gray-600">Manage suppliers and companies</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px,1fr] lg:items-stretch">
              <section className="hidden rounded-lg border bg-white shadow-sm lg:flex lg:flex-col min-h-[600px]">
                <div className="border-b px-4 py-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Supplier Directory</h3>
                      <p className="text-sm text-gray-500">
                        {suppliersLoading
                          ? 'Loading...'
                          : `${suppliers.length} supplier${suppliers.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                </div>
                <SupplierListContent
                  suppliers={suppliers}
                  loading={suppliersLoading}
                  search={supplierSearch}
                  setSearch={setSupplierSearch}
                  selectedId={selectedSupplierId}
                  onSelectSupplier={setSelectedSupplierId}
                  bodyClassName="flex-1 overflow-y-auto min-h-0"
                />
              </section>

              <section className="rounded-lg border bg-white shadow-sm flex flex-col min-h-[600px]">
                <div className="border-b px-4 py-3 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold">Supplier Details</h2>
                    <p className="text-sm text-gray-500">View and manage supplier information</p>
                  </div>
                </div>

                {loadingSupplierDetails ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">Loading supplier details...</p>
                  </div>
                ) : selectedSupplier && selectedSupplierDetails ? (
                  <div className="px-4 py-6 space-y-6 flex-1 overflow-y-auto min-h-0">
                    {supplierFormError && (
                      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {supplierFormError}
                      </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                          <input
                            type="text"
                            required
                            value={supplierFormData.name}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
                          <input
                            type="text"
                            required
                            value={supplierFormData.slug}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                          <input
                            type="text"
                            value={supplierFormData.shortDescription}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, shortDescription: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={supplierFormData.description}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, description: e.target.value })}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={supplierFormData.email}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={supplierFormData.phone}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                          <input
                            type="url"
                            value={supplierFormData.website}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, website: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Social Link</label>
                          <input
                            type="url"
                            value={supplierFormData.socialLink}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, socialLink: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Images</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                          {logoPreview && (
                            <div className="mb-2 w-full h-24 rounded-md border border-gray-300 overflow-hidden bg-gray-50">
                              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50 mb-2"
                          />
                          {uploadingLogo && <p className="text-xs text-gray-500">Uploading...</p>}
                          <input
                            type="url"
                            value={supplierFormData.logoImage}
                            onChange={(e) => {
                              setSupplierFormData({ ...supplierFormData, logoImage: e.target.value });
                              setLogoPreview(e.target.value || null);
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="Or enter URL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Banner/Hero Image</label>
                          {bannerPreview && (
                            <div className="mb-2 w-full h-24 rounded-md border border-gray-300 overflow-hidden bg-gray-50">
                              <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            disabled={uploadingBanner}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50 mb-2"
                          />
                          {uploadingBanner && <p className="text-xs text-gray-500">Uploading...</p>}
                          <input
                            type="url"
                            value={supplierFormData.heroImage}
                            onChange={(e) => {
                              setSupplierFormData({ ...supplierFormData, heroImage: e.target.value });
                              setBannerPreview(e.target.value || null);
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                            placeholder="Or enter URL"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Categories & Region */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Categories & Region</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                          <select
                            value={supplierFormData.regionId || ''}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, regionId: e.target.value ? Number(e.target.value) : null })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          >
                            <option value="">No Region</option>
                            {catalogRegions.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                          <div className="flex flex-wrap gap-2">
                            {catalogCategories.map((cat) => {
                              const isSelected = supplierFormData.categoryIds.includes(cat.id);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSupplierFormData({
                                        ...supplierFormData,
                                        categoryIds: supplierFormData.categoryIds.filter((id) => id !== cat.id),
                                      });
                                    } else {
                                      setSupplierFormData({
                                        ...supplierFormData,
                                        categoryIds: [...supplierFormData.categoryIds, cat.id],
                                      });
                                    }
                                  }}
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    isSelected
                                      ? 'bg-black text-white'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {cat.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Flags</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={supplierFormData.isVerified}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, isVerified: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Verified</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={supplierFormData.isScam}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, isScam: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Scam</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={supplierFormData.isContractHolder}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, isContractHolder: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Contract Holder</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={supplierFormData.isBroker}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, isBroker: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Broker</span>
                        </label>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Home Rank</label>
                          <input
                            type="number"
                            value={supplierFormData.homeRank}
                            onChange={(e) => setSupplierFormData({ ...supplierFormData, homeRank: Number(e.target.value) })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Addresses</h3>
                      {supplierFormData.addresses.length > 0 && (
                        <div className="space-y-3">
                          {supplierFormData.addresses.map((address) => (
                            <div key={address.id} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                              {editingAddressId === address.id ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={newAddress.streetAddress}
                                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                                    placeholder="Street Address"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                  />
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <input
                                      type="text"
                                      value={newAddress.city}
                                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                      placeholder="City"
                                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                    />
                                    <select
                                      value={newAddress.state}
                                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                    >
                                      <option value="">State</option>
                                      {US_STATES.map((s) => (
                                        <option key={s.code} value={s.code}>{s.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <select
                                      value={newAddress.country}
                                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                    >
                                      <option value="">Country</option>
                                      {COUNTRIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      value={newAddress.zipCode}
                                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                      placeholder="Zip Code"
                                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={handleSaveEditAddress}
                                      className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEditAddress}
                                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between">
                                  <div className="text-sm text-gray-700">
                                    {[address.streetAddress, address.city, address.state, address.country, address.zipCode].filter(Boolean).join(', ') || 'Empty address'}
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      type="button"
                                      onClick={() => handleEditAddress(address)}
                                      className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAddress(address.id)}
                                      className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {editingAddressId === null && (
                        <div className="rounded-md border border-gray-200 bg-white p-3 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900">Add New Address</h4>
                          <input
                            type="text"
                            value={newAddress.streetAddress}
                            onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                            placeholder="Street Address"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                          />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="City"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                            />
                            <select
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                            >
                              <option value="">State</option>
                              {US_STATES.map((s) => (
                                <option key={s.code} value={s.code}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <select
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                            >
                              <option value="">Country</option>
                              {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                              placeholder="Zip Code"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddAddress}
                            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                            Add Address
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={handleSaveSupplier}
                        disabled={supplierFormLoading}
                        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {supplierFormLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <Link
                        href={`/suppliers/${supplierFormData.slug}`}
                        target="_blank"
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View Live Page
                      </Link>
                    </div>
                  </div>
                ) : selectedSupplier ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">Loading supplier details...</p>
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">Select a supplier from the list to view and edit details</p>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
              <p className="mt-1 text-sm text-gray-600">Manage customer reviews</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReviewFilter('all')}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  reviewFilter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setReviewFilter('pending')}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  reviewFilter === 'pending'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setReviewFilter('approved')}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  reviewFilter === 'approved'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Approved
              </button>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{review.author}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{review.supplier.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{review.ratingOverall}/5</td>
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

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Categories</h2>
              <p className="mt-1 text-sm text-gray-600">Manage supplier categories</p>
            </div>

            {categoryError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {categoryError}
              </div>
            )}

            {(isCreatingCategory || categoryEditingId !== null) && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  {isCreatingCategory ? 'Create Category' : 'Edit Category'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Category Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={categoryFormData.slug}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="category-slug"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                    <input
                      type="text"
                      value={categoryFormData.headline}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, headline: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Category headline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Category description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                    <input
                      type="text"
                      value={categoryFormData.icon}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        isCreatingCategory ? handleCreateCategory() : categoryEditingId && handleUpdateCategory(categoryEditingId)
                      }
                      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      {isCreatingCategory ? 'Create' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditCategory}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {categoriesLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Suppliers</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{category.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{category.slug}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{category.supplierCount}</td>
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
                            <span className="text-gray-400 text-xs" title="Cannot delete: has suppliers">
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

        {activeTab === 'regions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Regions</h2>
              <p className="mt-1 text-sm text-gray-600">Manage supplier regions</p>
            </div>

            {regionError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {regionError}
              </div>
            )}

            {(isCreatingRegion || regionEditingId !== null) && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  {isCreatingRegion ? 'Create Region' : 'Edit Region'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Region Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={regionFormData.slug}
                      onChange={(e) => setRegionFormData({ ...regionFormData, slug: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="region-slug"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                    <input
                      type="text"
                      value={regionFormData.headline}
                      onChange={(e) => setRegionFormData({ ...regionFormData, headline: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Region headline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={regionFormData.description}
                      onChange={(e) => setRegionFormData({ ...regionFormData, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="Region description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State Code</label>
                    <input
                      type="text"
                      value={regionFormData.stateCode}
                      onChange={(e) => setRegionFormData({ ...regionFormData, stateCode: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Map Image URL</label>
                    <input
                      type="text"
                      value={regionFormData.mapImage}
                      onChange={(e) => setRegionFormData({ ...regionFormData, mapImage: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder="https://example.com/map.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Market Stats (JSON)</label>
                    <textarea
                      value={regionFormData.marketStats}
                      onChange={(e) => setRegionFormData({ ...regionFormData, marketStats: e.target.value })}
                      rows={5}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      placeholder='{"key": "value"}'
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter valid JSON or leave empty</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        isCreatingRegion ? handleCreateRegion() : regionEditingId && handleUpdateRegion(regionEditingId)
                      }
                      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      {isCreatingRegion ? 'Create' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditRegion}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {regionsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">State</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Suppliers</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {regions.map((region) => (
                      <tr key={region.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{region.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{region.slug}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{region.stateCode || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{region.supplierCount}</td>
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
                            <span className="text-gray-400 text-xs" title="Cannot delete: has suppliers">
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

        {activeTab === 'category-pages' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Category Pages</h2>
              <p className="mt-1 text-sm text-gray-600">Manage SEO-optimized category pages</p>
            </div>

            {categoryPageError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {categoryPageError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
              {/* Left Sidebar - Category Pages List */}
              <section className="rounded-lg border bg-white shadow-sm flex flex-col min-h-[600px]">
                <div className="border-b px-4 py-3 flex-shrink-0 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Category Pages</h2>
                    <p className="text-sm text-gray-500">Select a page to edit</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingCategoryPage(true);
                      setCategoryPageEditingId(null);
                      setSelectedCategoryPageId(null);
                      resetCategoryPageForm();
                    }}
                    className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    + New
                  </button>
                </div>
                <CategoryPageListContent
                  categoryPages={categoryPages}
                  loading={categoryPagesLoading}
                  search={categoryPageSearch}
                  setSearch={setCategoryPageSearch}
                  selectedId={selectedCategoryPageId}
                  onSelectCategoryPage={(id) => {
                    const page = categoryPages.find((p) => p.id === id);
                    if (page) {
                      startEditCategoryPage(page);
                    }
                  }}
                  bodyClassName="flex-1 overflow-y-auto min-h-0"
                />
              </section>

              {/* Right Panel - Category Page Details/Form */}
              <section className="rounded-lg border bg-white shadow-sm flex flex-col min-h-[600px]">
                <div className="border-b px-4 py-3 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold">Category Page Details</h2>
                    <p className="text-sm text-gray-500">
                      {selectedCategoryPageId || isCreatingCategoryPage
                        ? isCreatingCategoryPage
                          ? 'Create a new category page'
                          : 'View and manage category page information'
                        : 'Select a category page to view or edit'}
                    </p>
                  </div>
                </div>

                {categoryPagesLoading ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">Loading category pages...</p>
                  </div>
                ) : !selectedCategoryPageId && !isCreatingCategoryPage ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500">Select a category page from the list to view or edit its details.</p>
                  </div>
                ) : (
                  <div className="px-4 py-6 space-y-6 flex-1 overflow-y-auto min-h-0">
                    {categoryPageError && (
                      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {categoryPageError}
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* SEO Settings */}
                      <div className="border-t pt-4">
                        <h3 className="text-md font-semibold mb-3 text-gray-900">SEO Settings</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Page Title <span className="text-red-500">*</span>
                            </label>
                      <input
                        type="text"
                        value={categoryPageFormData.pageTitle}
                        onChange={(e) => {
                          const title = e.target.value;
                          setCategoryPageFormData({
                            ...categoryPageFormData,
                            pageTitle: title,
                            slug: categoryPageFormData.slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
                          });
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Buy Amazon Liquidation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                      <input
                        type="text"
                        value={categoryPageFormData.slug}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, slug: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="buy-amazon-liquidation"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={categoryPageFormData.metaTitle}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, metaTitle: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Buy Amazon Liquidation | Find Liquidation"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={categoryPageFormData.metaDescription}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, metaDescription: e.target.value })}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Find trusted Amazon liquidation suppliers..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                      <input
                        type="url"
                        value={categoryPageFormData.canonicalUrl}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, canonicalUrl: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="https://findliquidation.com/categories/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
                      {ogImagePreview && (
                        <div className="mb-2 w-full h-24 rounded-md border border-gray-300 overflow-hidden bg-gray-50">
                          <img src={ogImagePreview} alt="OG preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleOgImageUpload}
                        disabled={uploadingOgImage}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50 mb-2"
                      />
                      {uploadingOgImage && <p className="text-xs text-gray-500 mb-2">Uploading...</p>}
                      <input
                        type="url"
                        value={categoryPageFormData.ogImage}
                        onChange={(e) => {
                          setCategoryPageFormData({ ...categoryPageFormData, ogImage: e.target.value });
                          setOgImagePreview(e.target.value || null);
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Or enter image URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                      <input
                        type="text"
                        value={categoryPageFormData.ogTitle}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, ogTitle: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                      <textarea
                        value={categoryPageFormData.ogDescription}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, ogDescription: e.target.value })}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoryPageFormData.noindex}
                          onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, noindex: e.target.checked })}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">Noindex</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoryPageFormData.nofollow}
                          onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, nofollow: e.target.checked })}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">Nofollow</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoryPageFormData.enableFaqSchema}
                          onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, enableFaqSchema: e.target.checked })}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable FAQ Schema</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={categoryPageFormData.enableBreadcrumbSchema}
                          onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, enableBreadcrumbSchema: e.target.checked })}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable Breadcrumb Schema</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3 text-gray-900">Hero Section</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                      {heroImagePreview && (
                        <div className="mb-2 w-full h-32 rounded-md border border-gray-300 overflow-hidden bg-gray-50">
                          <img src={heroImagePreview} alt="Hero preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        disabled={uploadingHeroImage}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50 mb-2"
                      />
                      {uploadingHeroImage && <p className="text-xs text-gray-500 mb-2">Uploading...</p>}
                      <input
                        type="url"
                        value={categoryPageFormData.heroImage}
                        onChange={(e) => {
                          setCategoryPageFormData({ ...categoryPageFormData, heroImage: e.target.value });
                          setHeroImagePreview(e.target.value || null);
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Or enter image URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image Alt Text</label>
                      <input
                        type="text"
                        value={categoryPageFormData.heroImageAlt}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, heroImageAlt: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero H1</label>
                      <input
                        type="text"
                        value={categoryPageFormData.heroH1}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, heroH1: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Buy Amazon Liquidation Truckloads & Pallets"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Text</label>
                      <textarea
                        value={categoryPageFormData.heroText}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, heroText: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Short intro explaining access to Amazon customer returns..."
                      />
                    </div>
                  </div>
                </div>

                {/* Featured Suppliers */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3 text-gray-900">Featured Suppliers</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section H2</label>
                      <input
                        type="text"
                        value={categoryPageFormData.featuredSuppliersH2}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, featuredSuppliersH2: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Verified Amazon Liquidation Suppliers"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intro Text</label>
                      <textarea
                        value={categoryPageFormData.featuredSuppliersText}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, featuredSuppliersText: e.target.value })}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Selection</label>
                      <select
                        value={categoryPageFormData.supplierSourceType}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, supplierSourceType: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <option value="manual">Manual Selection</option>
                        <option value="auto">Auto (Future)</option>
                      </select>
                    </div>
                    {categoryPageFormData.supplierSourceType === 'manual' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Suppliers</label>
                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                          {availableSuppliers.map((supplier) => (
                            <label key={supplier.id} className="flex items-center py-1">
                              <input
                                type="checkbox"
                                checked={categoryPageFormData.supplierIds.includes(supplier.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCategoryPageFormData({
                                      ...categoryPageFormData,
                                      supplierIds: [...categoryPageFormData.supplierIds, supplier.id],
                                    });
                                  } else {
                                    setCategoryPageFormData({
                                      ...categoryPageFormData,
                                      supplierIds: categoryPageFormData.supplierIds.filter((id) => id !== supplier.id),
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-black focus:ring-black"
                              />
                              <span className="ml-2 text-sm text-gray-700">{supplier.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Centered Value Prop */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3 text-gray-900">Centered Value Proposition</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">H2</label>
                      <input
                        type="text"
                        value={categoryPageFormData.centeredValueH2}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, centeredValueH2: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="The Easiest Way to Buy Amazon Liquidation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                      <textarea
                        value={categoryPageFormData.centeredValueText}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, centeredValueText: e.target.value })}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Blocks */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3 text-gray-900">Content Blocks</h3>
                  <div className="space-y-4">
                    {categoryPageFormData.contentBlocks.map((block: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Block {index + 1}</span>
                          <button
                            onClick={() => {
                              const newBlocks = [...categoryPageFormData.contentBlocks];
                              newBlocks.splice(index, 1);
                              setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-3">
                          <select
                            value={block.layout_type || 'image_left'}
                            onChange={(e) => {
                              const newBlocks = [...categoryPageFormData.contentBlocks];
                              newBlocks[index] = { ...block, layout_type: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="image_left">Image Left, Text Right</option>
                            <option value="image_right">Image Right, Text Left</option>
                          </select>
                          {block.image && (
                            <div className="mb-2 w-full h-24 rounded-md border border-gray-300 overflow-hidden bg-gray-50">
                              <img src={block.image} alt={block.image_alt || 'Content block preview'} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleContentBlockImageUpload(e, index)}
                            disabled={uploadingContentBlockImages[index]}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50 disabled:opacity-50 mb-2"
                          />
                          {uploadingContentBlockImages[index] && <p className="text-xs text-gray-500 mb-2">Uploading...</p>}
                          <input
                            type="url"
                            placeholder="Or enter image URL"
                            value={block.image || ''}
                            onChange={(e) => {
                              const newBlocks = [...categoryPageFormData.contentBlocks];
                              newBlocks[index] = { ...block, image: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Image Alt Text"
                            value={block.image_alt || ''}
                            onChange={(e) => {
                              const newBlocks = [...categoryPageFormData.contentBlocks];
                              newBlocks[index] = { ...block, image_alt: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="H2 Title"
                            value={block.h2 || ''}
                            onChange={(e) => {
                              const newBlocks = [...categoryPageFormData.contentBlocks];
                              newBlocks[index] = { ...block, h2: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                          <textarea
                            placeholder="Text content"
                            value={block.text || ''}
                            onChange={(e) => {
                              const newBlocks = [...categoryPageFormData.contentBlocks];
                              newBlocks[index] = { ...block, text: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, contentBlocks: newBlocks });
                            }}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setCategoryPageFormData({
                          ...categoryPageFormData,
                          contentBlocks: [
                            ...categoryPageFormData.contentBlocks,
                            { layout_type: 'image_left', image: '', image_alt: '', h2: '', text: '' },
                          ],
                        });
                      }}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      + Add Content Block
                    </button>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3 text-gray-900">FAQ Section</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section H2</label>
                      <input
                        type="text"
                        value={categoryPageFormData.faqSectionH2}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, faqSectionH2: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Amazon Liquidation FAQ"
                      />
                    </div>
                    <div className="space-y-3">
                      {categoryPageFormData.faqs.map((faq: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">FAQ {index + 1}</span>
                            <button
                              onClick={() => {
                                const newFaqs = [...categoryPageFormData.faqs];
                                newFaqs.splice(index, 1);
                                setCategoryPageFormData({ ...categoryPageFormData, faqs: newFaqs });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Question"
                            value={faq.question || ''}
                            onChange={(e) => {
                              const newFaqs = [...categoryPageFormData.faqs];
                              newFaqs[index] = { ...faq, question: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, faqs: newFaqs });
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-2"
                          />
                          <textarea
                            placeholder="Answer"
                            value={faq.answer || ''}
                            onChange={(e) => {
                              const newFaqs = [...categoryPageFormData.faqs];
                              newFaqs[index] = { ...faq, answer: e.target.value };
                              setCategoryPageFormData({ ...categoryPageFormData, faqs: newFaqs });
                            }}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setCategoryPageFormData({
                            ...categoryPageFormData,
                            faqs: [...categoryPageFormData.faqs, { question: '', answer: '' }],
                          });
                        }}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        + Add FAQ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Fields */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-semibold mb-3 text-gray-900">Advanced</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom HTML</label>
                      <textarea
                        value={categoryPageFormData.customHtml}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, customHtml: e.target.value })}
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="<script>...</script>"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Schema (JSON)</label>
                      <textarea
                        value={categoryPageFormData.customSchema}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, customSchema: e.target.value })}
                        rows={5}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder='{"@type": "..."}'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Topic Category</label>
                      <input
                        type="text"
                        value={categoryPageFormData.topicCategory}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, topicCategory: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Amazon Liquidation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author Override</label>
                      <input
                        type="text"
                        value={categoryPageFormData.authorOverride}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, authorOverride: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={categoryPageFormData.enableDivider}
                        onChange={(e) => setCategoryPageFormData({ ...categoryPageFormData, enableDivider: e.target.checked })}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable Divider Between Sections</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() =>
                      isCreatingCategoryPage
                        ? handleCreateCategoryPage()
                        : categoryPageEditingId && handleUpdateCategoryPage(categoryPageEditingId)
                    }
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    {isCreatingCategoryPage ? 'Create' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditCategoryPage}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                        {categoryPageEditingId && (
                          <>
                            <Link
                              href={`/${categoryPages.find((p) => p.id === categoryPageEditingId)?.slug || ''}`}
                              target="_blank"
                              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              View Page
                            </Link>
                            <button
                              onClick={() => {
                                const page = categoryPages.find((p) => p.id === categoryPageEditingId);
                                if (page && confirm('Are you sure you want to delete this category page?')) {
                                  handleDeleteCategoryPage(page.id);
                                }
                              }}
                              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 ml-auto"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
