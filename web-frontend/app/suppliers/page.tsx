import Link from 'next/link';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';

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
    verified: typeof searchParams.verified === 'string' ? searchParams.verified : '',
    regionGroup: typeof searchParams['region-group'] === 'string' ? searchParams['region-group'] : '',
    page: typeof searchParams.page === 'string' ? Math.max(1, Number(searchParams.page)) : 1,
  };

  const itemsPerPage = 18;
  const cursor = filters.page > 1 ? (filters.page - 1) * itemsPerPage : undefined;

  const [result, categories, regions] = await Promise.all([
    api.suppliers.list({
      search: filters.search,
      category: filters.category || undefined,
      region: filters.region || undefined,
      verified: filters.verified === 'true' ? true : filters.verified === 'false' ? false : undefined,
      cursor: cursor,
      limit: itemsPerPage,
    }),
    api.catalog.categories(),
    api.catalog.regions(),
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
    if (filters.verified) params.set('verified', filters.verified);
    if (filters.regionGroup) params.set('region-group', filters.regionGroup);
    if (page > 1) params.set('page', String(page));
    return `/suppliers${params.toString() ? '?' + params.toString() : ''}`;
  };

  // Get the selected region name for the header
  const selectedRegion = filters.region 
    ? regions.find(r => r.slug === filters.region) 
    : null;
  const headerTitle = selectedRegion 
    ? `Find Trusted Suppliers in ${selectedRegion.name}`
    : 'Find Trusted Suppliers Near You';

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-md border-2 border-black/10 bg-gradient-to-br from-blue-600 to-blue-700 p-8 sm:p-12 shadow-md">
          <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
            {headerTitle}
          </h1>
          <p className="font-normal text-lg text-white/90 max-w-3xl leading-relaxed">
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
              <div className="rounded-md border-2 border-black/10 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-black mb-4">Filter by State</h3>
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
                        <summary className="flex items-center justify-between p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors duration-200 list-none">
                          <span className="font-semibold text-sm text-black group-hover:text-blue-600">
                            {groupLabels[groupName]}
                          </span>
                          <svg
                            className="w-4 h-4 text-black/50 group-open:rotate-180 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-1 ml-2 space-y-1 border-l-2 border-black/5 pl-3">
                          {groupRegions.map((r) => (
                            <label
                              key={r.slug}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors duration-200 group"
                            >
                              <input
                                type="radio"
                                name="region"
                                value={r.slug}
                                defaultChecked={filters.region === r.slug}
                                className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                              />
                              <span className="font-normal text-sm text-black/70 group-hover:text-blue-600">
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

              {/* Verified Filter */}
              <div className="rounded-md border-2 border-black/10 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-black mb-4">Verification Status</h3>
                <div className="space-y-2">
                  {[
                    { value: 'true', label: 'Verified' },
                    { value: 'false', label: 'Not Verified' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600/10 cursor-pointer transition-colors duration-200 group"
                    >
                      <input
                        type="radio"
                        name="verified"
                        value={option.value}
                        defaultChecked={filters.verified === option.value}
                        className="h-4 w-4 rounded border-black/20 text-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer"
                      />
                      <span className="font-normal text-sm text-black/70 group-hover:text-blue-600">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full font-semibold rounded-md bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
                >
                  Apply Filters
                </button>
                <Link
                  href="/suppliers"
                  className="w-full text-center font-normal text-sm text-black/50 hover:text-black py-2 hover:underline underline-offset-2"
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
                  <span className="font-medium text-slate-500"> in {regions.find(r => r.slug === filters.region)?.name}</span>
                )}
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {result.items.map((s) => (
                <SupplierCard key={s.slug} supplier={s} />
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
                          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
                          className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
          <div className="mx-auto max-w-4xl rounded-md border-2 border-black/10 bg-black p-8 sm:p-12 text-white shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="text-center">
              <h3 className="font-black text-3xl sm:text-4xl mb-4">
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
      </div>
    </div>
  );
}
