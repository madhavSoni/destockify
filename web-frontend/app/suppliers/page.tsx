'use client';

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { REGIONS, getStatesForRegion, type RegionName } from '@/lib/constants/regions';
import { getStateName } from '@/lib/constants/states';
// Icons as inline SVGs
const SlidersHorizontalIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M3 9h18m-9 4.5h9M3 19.5h18" />
  </svg>
);

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

type FilterState = {
  search: string;
  category: string;
  state: string;
  verified: string;
  contractHolder: boolean;
  broker: boolean;
  sort: string;
  page: number;
};

function SuppliersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [availableFilters, setAvailableFilters] = useState<{
    states?: Array<{ code: string; name: string; count: number }>;
    countries?: Array<{ code: string; name: string; count: number }>;
    categories?: Array<{ id: number; name: string; slug: string; count: number }>;
  } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<RegionName | null>(null);
  const [expandedRegionMobile, setExpandedRegionMobile] = useState<RegionName | null>(null);

  const filters = useMemo(() => {
    return {
      search: searchParams?.get('search') || '',
      category: searchParams?.get('category') || '',
      state: searchParams?.get('state') || '',
      verified: searchParams?.get('verified') || '',
      contractHolder: searchParams?.get('contractHolder') === 'true',
      broker: searchParams?.get('broker') === 'true',
      sort: searchParams?.get('sort') || '',
      page: Math.max(1, Number(searchParams?.get('page')) || 1),
    };
  }, [searchParams]);

  const itemsPerPage = 18;
  const cursor = filters.page > 1 ? (filters.page - 1) * itemsPerPage : undefined;

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.suppliers.list({
        search: filters.search || undefined,
        category: filters.category || undefined,
        state: filters.state || undefined,
        verified: filters.verified === 'true' ? true : filters.verified === 'false' ? false : undefined,
        isContractHolder: filters.contractHolder || undefined,
        isBroker: filters.broker || undefined,
        sort: filters.sort || undefined,
        cursor: cursor,
        limit: itemsPerPage,
      });
      setSuppliers(result.items);
      setTotal(result.total);
      setNextCursor(result.nextCursor);
      if (result.availableFilters) {
        setAvailableFilters(result.availableFilters);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setSuppliers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.state, filters.verified, filters.contractHolder, filters.broker, filters.sort, filters.page, cursor]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.catalog.categories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    const params = new URLSearchParams();
    const newFilters = { ...filters, ...updates, page: 1 };
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key === 'page') return;
      if (key === 'contractHolder' || key === 'broker') {
        if (value === true) {
          params.set(key, 'true');
        }
      } else if (value && value !== '') {
        params.set(key, String(value));
      }
    });
    
    router.push(`/suppliers${params.toString() ? '?' + params.toString() : ''}`);
  }, [filters, router]);

  const clearFilters = useCallback(() => {
    router.push('/suppliers');
  }, [router]);

  const buildPageUrl = useCallback((page: number) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'page') return;
      if (key === 'contractHolder' || key === 'broker') {
        if (value === true) {
          params.set(key, 'true');
        }
      } else if (value && value !== '') {
        params.set(key, String(value));
      }
    });
    if (page > 1) params.set('page', String(page));
    return `/suppliers${params.toString() ? '?' + params.toString() : ''}`;
  }, [filters]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = filters.page < totalPages;
  const hasPrevPage = filters.page > 1;

  const activeFilterCount = [
    filters.category ? 1 : 0,
    filters.state ? 1 : 0,
    filters.verified ? 1 : 0,
    filters.contractHolder ? 1 : 0,
    filters.broker ? 1 : 0,
    filters.sort ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Get available states from API, fallback to all if not loaded yet
  const stateOptions = useMemo(() => {
    if (availableFilters?.states && availableFilters.states.length > 0) {
      return availableFilters.states;
    }
    return [];
  }, [availableFilters]);

  // Group states by region
  const statesByRegion = useMemo(() => {
    const grouped: Record<RegionName, Array<{ code: string; name: string; count: number }>> = {
      'Northeast': [],
      'Southeast': [],
      'Midwest': [],
      'Westcoast': [],
    };

    stateOptions.forEach(state => {
      for (const region of Object.keys(REGIONS) as RegionName[]) {
        const regionStates = getStatesForRegion(region);
        if (regionStates.includes(state.code)) {
          grouped[region].push(state);
          break;
        }
      }
    });

    return grouped;
  }, [stateOptions]);

  const categoryOptions = useMemo(() => {
    if (availableFilters?.categories && availableFilters.categories.length > 0) {
      return availableFilters.categories.map(c => ({
        slug: c.slug,
        name: c.name,
      }));
    }
    return categories.map(c => ({
      slug: c.slug,
      name: c.name,
    }));
  }, [availableFilters, categories]);

  const sortOptions = [
    { value: '', label: 'Default (Verified First)' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'newest', label: 'Newest First' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-gradient-to-br from-blue-600 to-blue-700 p-8 sm:p-12 shadow-sm">
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
            Buy Liquidation Truckloads & Pallets Near You.
          </h1>
          <p className="font-normal text-lg text-white/90 max-w-3xl leading-relaxed">
            Browse hundreds of verified liquidators and wholesalers across the United States. Connect with suppliers offering returned, overstock, and brand-new merchandise.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowFiltersModal(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-white shadow-sm px-4 py-2 font-semibold text-black hover:bg-blue-50 hover:border-blue-500 hover:shadow-lift transition-colors"
          >
            <SlidersHorizontalIcon size={20} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Grid: Filters + Cards */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block space-y-6">
            <div className="space-y-6">
              {/* Search */}
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-black mb-4">Search</h3>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  placeholder="Search suppliers..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Category Filter */}
              {categoryOptions.length > 0 && (
                <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-lg text-black mb-4">Category</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) => updateFilters({ category: e.target.value })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="font-normal text-sm text-black/70">All Categories</span>
                    </label>
                    {categoryOptions.map((cat) => (
                      <label
                        key={cat.slug}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.slug}
                          checked={filters.category === cat.slug}
                          onChange={(e) => updateFilters({ category: e.target.value })}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                        />
                        <span className="font-normal text-sm text-black/70">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Filter - Region Based */}
              {stateOptions.length > 0 && (
                <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-lg text-black mb-4">Location</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="state"
                        value=""
                        checked={filters.state === ''}
                        onChange={(e) => updateFilters({ state: e.target.value })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="font-normal text-sm text-black/70">All States</span>
                    </label>
                    {(Object.keys(REGIONS) as RegionName[]).map((region) => (
                      <div key={region}>
                        <button
                          type="button"
                          onClick={() => setExpandedRegion(expandedRegion === region ? null : region)}
                          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors"
                        >
                          <span className="font-semibold text-sm text-black/70">{region}</span>
                          <svg
                            className={`w-4 h-4 text-black/50 transition-transform ${expandedRegion === region ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedRegion === region && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 pl-3">
                            {statesByRegion[region].map((state) => (
                              <label
                                key={state.code}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="state"
                                  value={state.code}
                                  checked={filters.state === state.code}
                                  onChange={(e) => updateFilters({ state: e.target.value })}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                                />
                                <span className="font-normal text-sm text-black/70">
                                  {state.name} ({state.count})
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Filter */}
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-black mb-4">Verification Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="verified"
                      value=""
                      checked={filters.verified === ''}
                      onChange={(e) => updateFilters({ verified: e.target.value })}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="font-normal text-sm text-black/70">All</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="verified"
                      value="true"
                      checked={filters.verified === 'true'}
                      onChange={(e) => updateFilters({ verified: e.target.value })}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="font-normal text-sm text-black/70">Verified</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="verified"
                      value="false"
                      checked={filters.verified === 'false'}
                      onChange={(e) => updateFilters({ verified: e.target.value })}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="font-normal text-sm text-black/70">Unverified</span>
                  </label>
                </div>
              </div>

              {/* Supplier Type Filter */}
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-black mb-4">Supplier Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.contractHolder}
                      onChange={(e) => updateFilters({ contractHolder: e.target.checked })}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="font-normal text-sm text-black/70">Contract holder</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.broker}
                      onChange={(e) => updateFilters({ broker: e.target.checked })}
                      className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="font-normal text-sm text-black/70">Broker</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-black mb-4">Sort By</h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={filters.sort === option.value}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="font-normal text-sm text-black/70">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full font-semibold rounded-md bg-slate-100 px-4 py-2.5 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Cards Section */}
          <section>
            {/* Results Count and Sort (Mobile) */}
            <div className="mb-6 flex items-center justify-between">
              <p className="font-bold text-lg text-slate-900">
                {loading ? 'Loading...' : `${total} Suppliers Found`}
              </p>
              <div className="lg:hidden">
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cards Grid - 2 columns on mobile, 3 on desktop */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 items-stretch">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-md border border-slate-200" />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                <p className="text-slate-600">No suppliers found. Try adjusting your filters.</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 items-stretch">
                {suppliers.map((s) => (
                  <SupplierCard key={s.slug} supplier={s} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(hasNextPage || hasPrevPage) && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2" aria-label="Pagination">
                  {hasPrevPage ? (
                    <Link
                      href={buildPageUrl(filters.page - 1)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      aria-label="Previous page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  )}

                  {(() => {
                    const pageNumbers = [];
                    const maxVisiblePages = 7;
                    const currentPage = filters.page;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    if (startPage > 1) {
                      pageNumbers.push(
                        <Link
                          key={1}
                          href={buildPageUrl(1)}
                          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        >
                          1
                        </Link>
                      );
                      if (startPage > 2) {
                        pageNumbers.push(
                          <span key="ellipsis-start" className="flex items-center justify-center w-10 h-10 text-slate-400">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      if (i === currentPage) {
                        pageNumbers.push(
                          <div
                            key={i}
                            className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-blue-600 bg-blue-600 text-white font-bold"
                            aria-current="page"
                          >
                            {i}
                          </div>
                        );
                      } else {
                        pageNumbers.push(
                          <Link
                            key={i}
                            href={buildPageUrl(i)}
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                          >
                            {i}
                          </Link>
                        );
                      }
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pageNumbers.push(
                          <span key="ellipsis-end" className="flex items-center justify-center w-10 h-10 text-slate-400">
                            ...
                          </span>
                        );
                      }
                      pageNumbers.push(
                        <Link
                          key={totalPages}
                          href={buildPageUrl(totalPages)}
                          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                        >
                          {totalPages}
                        </Link>
                      );
                    }
                    
                    return pageNumbers;
                  })()}

                  {hasNextPage ? (
                    <Link
                      href={buildPageUrl(filters.page + 1)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      aria-label="Next page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </nav>
              </div>
            )}
          </section>
        </div>

        {/* Bottom CTA */}
        <section className="mt-16">
          <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-8 sm:p-12 text-white shadow-sm transition-all duration-300 hover:shadow-lift">
            <div className="text-center">
              <h3 className="font-heading font-black text-3xl sm:text-4xl mb-4">
                List Your Business
              </h3>
              <p className="font-medium text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Get discovered by thousands of buyers looking for quality merchandise from trusted suppliers across the United States.
              </p>
              <Link
                href="/list-your-business"
                className="inline-flex items-center justify-center font-bold rounded-md bg-blue-600 px-8 py-4 text-lg text-white hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
              >
                Get Started Today
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 mb-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">FAQ</p>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto max-w-3xl space-y-4">
              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      How do I find suppliers in my area?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Finding Suppliers</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Use the Location filter to browse by region or state. Click on a region to see all states within that region, then select a specific state to view suppliers in that area. You can also use the search function to find suppliers by name or location.
                </div>
              </details>

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      What's the difference between verified and unverified suppliers?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Verification</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Verified suppliers have completed our comprehensive verification process, which includes proof of sourcing rights, warehouse inspections, insurance verification, and buyer reference checks. Unverified suppliers are listed but haven't completed this process yet. We recommend reading reviews for both types before making a purchase.
                </div>
              </details>

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      Can I buy liquidation pallets or truckloads directly through TrustPallet?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Purchasing</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  TrustPallet is a directory and review platform. We connect you with suppliers, but all purchases are made directly with the suppliers. Visit supplier profiles to find contact information, websites, and details about their inventory and purchasing process.
                </div>
              </details>

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      How do I know if a supplier is trustworthy?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Trust & Safety</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Check the supplier's verification status, read reviews from other buyers, and look at their rating average. Verified suppliers with high ratings and positive reviews are generally more trustworthy. Always do your due diligence and contact suppliers directly with any questions before making a purchase.
                </div>
              </details>

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      What information should I look for in supplier reviews?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Reviews</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Look for reviews that mention product condition accuracy, shipping times, communication quality, and overall satisfaction. Reviews with photos are especially helpful. Pay attention to both positive and negative reviews to get a balanced view of the supplier's performance.
                </div>
              </details>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Filter Modal */}
      {showFiltersModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowFiltersModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-2xl z-50 lg:hidden max-h-[90vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <SlidersHorizontalIcon size={20} />
                <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Close filters"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Search */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Search</h3>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  placeholder="Search suppliers..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Category Filter */}
              {categoryOptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Category</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="category-modal"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) => updateFilters({ category: e.target.value })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">All Categories</span>
                    </label>
                    {categoryOptions.map((cat) => (
                      <label
                        key={cat.slug}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category-modal"
                          value={cat.slug}
                          checked={filters.category === cat.slug}
                          onChange={(e) => updateFilters({ category: e.target.value })}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Filter - Region Based */}
              {stateOptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Location</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="state-modal"
                        value=""
                        checked={filters.state === ''}
                        onChange={(e) => updateFilters({ state: e.target.value })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">All States</span>
                    </label>
                    {(Object.keys(REGIONS) as RegionName[]).map((region) => (
                      <div key={region}>
                        <button
                          type="button"
                          onClick={() => setExpandedRegionMobile(expandedRegionMobile === region ? null : region)}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          <span className="font-semibold text-sm text-slate-700">{region}</span>
                          <svg
                            className={`w-4 h-4 text-slate-500 transition-transform ${expandedRegionMobile === region ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedRegionMobile === region && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 pl-3">
                            {statesByRegion[region].map((state) => (
                              <label
                                key={state.code}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name="state-modal"
                                  value={state.code}
                                  checked={filters.state === state.code}
                                  onChange={(e) => updateFilters({ state: e.target.value })}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">
                                  {state.name} ({state.count})
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Verification Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="verified-modal"
                      value=""
                      checked={filters.verified === ''}
                      onChange={(e) => updateFilters({ verified: e.target.value })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">All</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="verified-modal"
                      value="true"
                      checked={filters.verified === 'true'}
                      onChange={(e) => updateFilters({ verified: e.target.value })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Verified</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="verified-modal"
                      value="false"
                      checked={filters.verified === 'false'}
                      onChange={(e) => updateFilters({ verified: e.target.value })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Unverified</span>
                  </label>
                </div>
              </div>

              {/* Supplier Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Supplier Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.contractHolder}
                      onChange={(e) => updateFilters({ contractHolder: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Contract holder</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.broker}
                      onChange={(e) => updateFilters({ broker: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Broker</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Sort By</h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sort-modal"
                        value={option.value}
                        checked={filters.sort === option.value}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFiltersModal(false);
                  }}
                  className="w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <SuppliersPageContent />
    </Suspense>
  );
}
