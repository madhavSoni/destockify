import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

// Helper function to categorize states into regions
function getRegionGroup(stateCode: string | null | undefined): string {
  if (!stateCode) return 'other';
  
  const state = stateCode.toUpperCase();
  
  const southStates = ['FL', 'GA', 'TX', 'AL', 'MS', 'LA', 'AR', 'TN', 'NC', 'SC', 'KY', 'VA', 'WV'];
  const westStates = ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT', 'CO', 'NM', 'ID', 'MT', 'WY', 'AK', 'HI'];
  const northeastStates = ['NY', 'NJ', 'PA', 'MA', 'CT', 'RI', 'VT', 'NH', 'ME', 'DE', 'MD', 'DC'];
  const midwestStates = ['IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS', 'OK'];
  
  if (southStates.includes(state)) return 'south';
  if (westStates.includes(state)) return 'west';
  if (northeastStates.includes(state)) return 'northeast';
  if (midwestStates.includes(state)) return 'midwest';
  return 'other';
}

export default async function SuppliersPage(props: any) {
  const searchParams = await props.searchParams;
  // existing filters (kept so your API keeps working)
  const filters = {
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
    category: typeof searchParams.category === 'string' ? searchParams.category : '',
    region: typeof searchParams.region === 'string' ? searchParams.region : '',
    lotSize: typeof searchParams['lot-size'] === 'string' ? searchParams['lot-size'] : '',
    verified: typeof searchParams.verified === 'string' ? searchParams.verified : '',
    regionGroup: typeof searchParams['region-group'] === 'string' ? searchParams['region-group'] : '',
    page: typeof searchParams.page === 'string' ? Math.max(1, Number(searchParams.page)) : 1,
  };

  const itemsPerPage = 18;
  const cursor = filters.page > 1 ? (filters.page - 1) * itemsPerPage : undefined;

  const [result, categories, regions, lotSizes] = await Promise.all([
    api.suppliers.list({
      search: filters.search,
      category: filters.category || undefined,
      region: filters.region || undefined,
      lotSize: filters.lotSize || undefined,
      verified: filters.verified === 'true' ? true : filters.verified === 'false' ? false : undefined,
      regionGroup: filters.regionGroup && ['south', 'west', 'northeast', 'midwest', 'other'].includes(filters.regionGroup) 
        ? filters.regionGroup as 'south' | 'west' | 'northeast' | 'midwest' | 'other'
        : undefined,
      cursor: cursor,
      limit: itemsPerPage,
    }),
    api.catalog.categories(),
    api.catalog.regions(),
    api.catalog.lotSizes(),
  ]);

  // Group regions by region group
  const regionsByGroup: Record<string, typeof regions> = {
    south: [],
    west: [],
    northeast: [],
    midwest: [],
    other: [],
  };

  regions.forEach(region => {
    const group = getRegionGroup(region.stateCode);
    if (regionsByGroup[group]) {
      regionsByGroup[group].push(region);
    }
  });

  // Calculate pagination info
  const total = result.total ?? result.items.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = filters.page < totalPages;
  const hasPrevPage = filters.page > 1;
  
  // Helper function to build URL with page number
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.region) params.set('region', filters.region);
    if (filters.lotSize) params.set('lot-size', filters.lotSize);
    if (filters.verified) params.set('verified', filters.verified);
    if (filters.regionGroup) params.set('region-group', filters.regionGroup);
    if (page > 1) params.set('page', String(page));
    return `/suppliers${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-gradient-to-br from-blue-500 to-blue-600 p-8 sm:p-12">
          <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Find Trusted Suppliers Near You
          </h1>
          <p className="font-normal text-lg text-blue-50 max-w-3xl">
            Browse hundreds of verified liquidators and wholesalers across the United States. Connect with suppliers offering returned, overstock, and brand new merchandise.
          </p>
        </div>

        {/* Main Grid: Filters + Cards */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <form method="get" className="space-y-6">
              <input type="hidden" name="search" defaultValue={filters.search} />
              
              {/* State Filter with Expandable Region Groups */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Filter by State</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {Object.entries(regionsByGroup).map(([groupName, groupRegions]) => {
                    if (groupRegions.length === 0) return null;
                    const groupLabels: Record<string, string> = {
                      south: 'South',
                      west: 'West',
                      northeast: 'Northeast',
                      midwest: 'Midwest',
                      other: 'Other',
                    };
                    return (
                      <details key={groupName} className="group">
                        <summary className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors list-none">
                          <span className="font-semibold text-sm text-slate-900 group-hover:text-blue-600">
                            {groupLabels[groupName]}
                          </span>
                          <svg
                            className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-1 ml-2 space-y-1 border-l-2 border-slate-200 pl-3">
                          {groupRegions.map((r) => (
                            <label
                              key={r.slug}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                            >
                              <input
                                type="radio"
                                name="region"
                                value={r.slug}
                                defaultChecked={filters.region === r.slug}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="font-normal text-sm text-slate-700 group-hover:text-blue-600">
                                {r.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>

              {/* Lot Size Filter */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Filter by Lot Size</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {lotSizes.map((ls) => (
                    <label
                      key={ls.slug}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="radio"
                        name="lot-size"
                        value={ls.slug}
                        defaultChecked={filters.lotSize === ls.slug}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-normal text-sm text-slate-700 group-hover:text-blue-600">
                        {ls.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified Filter */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">Verification Status</h3>
                <div className="space-y-2">
                  {[
                    { value: 'true', label: 'Verified' },
                    { value: 'false', label: 'Not Verified' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="radio"
                        name="verified"
                        value={option.value}
                        defaultChecked={filters.verified === option.value}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-normal text-sm text-slate-700 group-hover:text-blue-600">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full font-semibold rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  Apply Filters
                </button>
                <Link
                  href="/suppliers"
                  className="w-full text-center font-normal text-sm text-slate-600 hover:text-slate-900 py-2 hover:underline underline-offset-2"
                >
                  Clear All Filters
                </Link>
              </div>
            </form>
          </aside>

          {/* Cards Section */}
          <section>
            {/* Results Count */}
            <div className="mb-6">
              <p className="font-bold text-lg text-slate-900">
                {total} Suppliers Found
                {filters.region && regions.find(r => r.slug === filters.region) && (
                  <span className="font-medium text-slate-600"> in {regions.find(r => r.slug === filters.region)?.name}</span>
                )}
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((s) => (
                <Link
                  key={s.slug}
                  href={`/suppliers/${s.slug}`}
                  className="group block overflow-hidden rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  {/* Header with gradient */}
                  <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-slate-200">
                    {/* Company Name Badge */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="bg-white rounded-lg px-5 py-2.5 border border-slate-200 max-w-full">
                        <div className="font-semibold text-base text-slate-900 text-center truncate">
                          {s.name}
                        </div>
                      </div>
                    </div>
                    
                    {/* Verified Badge */}
                    {s.averageRating && s.averageRating >= 4 && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium border border-green-600">
                          ✓ Verified
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="font-medium text-sm text-slate-700">
                        {s.region?.name || 'United States'}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${s.averageRating && i < Math.round(s.averageRating) ? 'text-yellow-400' : 'text-slate-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        {s.averageRating ? s.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="font-medium text-xs text-slate-500">
                        ({s.reviewCount ?? 0} {(s.reviewCount ?? 0) === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* View Details Button */}
                    <div className="pt-2">
                      <div className="font-bold text-sm text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                        View Details
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Page-based Pagination */}
            {(hasNextPage || hasPrevPage) && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2" aria-label="Pagination">
                  {/* Previous Button */}
                  {hasPrevPage ? (
                    <Link
                      href={buildPageUrl(filters.page - 1)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
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

                  {/* Page Numbers */}
                  {(() => {
                    const pageNumbers = [];
                    const maxVisiblePages = 7;
                    const currentPage = filters.page;
                    
                    // Calculate range of pages to show
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Adjust startPage if we're near the end
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    // Show first page and ellipsis if needed
                    if (startPage > 1) {
                      pageNumbers.push(
                        <Link
                          key={1}
                          href={buildPageUrl(1)}
                          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
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
                    
                    // Show page numbers in range
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
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                          >
                            {i}
                          </Link>
                        );
                      }
                    }
                    
                    // Show ellipsis and last page if needed
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
                          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                        >
                          {totalPages}
                        </Link>
                      );
                    }
                    
                    return pageNumbers;
                  })()}

                  {/* Next Button */}
                  {hasNextPage ? (
                    <Link
                      href={buildPageUrl(filters.page + 1)}
                      className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
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
          <div className="mx-auto max-w-4xl rounded-3xl border-2 border-slate-900/80 bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12 text-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)]">
            <div className="text-center">
              <h3 className="font-black text-3xl sm:text-4xl mb-4">
                List Your Business
              </h3>
              <p className="font-medium text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
                Get discovered by thousands of buyers looking for quality merchandise from trusted suppliers across the United States.
              </p>
              <Link
                href="/list-your-business"
                className="inline-flex items-center justify-center font-bold rounded-xl bg-blue-600 px-8 py-4 text-lg text-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-blue-700 active:translate-y-0 transition-all duration-200"
              >
                Get Started Today
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
