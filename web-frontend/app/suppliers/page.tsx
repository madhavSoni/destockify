import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // existing filters (kept so your API keeps working)
  const filters = {
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
    category: typeof searchParams.category === 'string' ? searchParams.category : '',
    region: typeof searchParams.region === 'string' ? searchParams.region : '',
    lotSize: typeof searchParams['lot-size'] === 'string' ? searchParams['lot-size'] : '',
    cursor: typeof searchParams.cursor === 'string' ? Number(searchParams.cursor) : undefined,
  };

  const [result, categories, regions, lotSizes] = await Promise.all([
    api.suppliers.list({
      search: filters.search,
      category: filters.category || undefined,
      region: filters.region || undefined,
      lotSize: filters.lotSize || undefined,
      cursor: filters.cursor,
      limit: 18,
    }),
    api.catalog.categories(),
    api.catalog.regions(),
    api.catalog.lotSizes(),
  ]);

  const nextCursor = result.nextCursor;
  const nextParams = new URLSearchParams();
  if (filters.search) nextParams.set('search', filters.search);
  if (filters.category) nextParams.set('category', filters.category);
  if (filters.region) nextParams.set('region', filters.region);
  if (filters.lotSize) nextParams.set('lot-size', filters.lotSize);
  if (nextCursor) nextParams.set('cursor', String(nextCursor));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-3xl border-2 border-slate-900/80 bg-gradient-to-br from-blue-500 to-blue-600 p-8 sm:p-12 shadow-[6px_7px_0_0_rgba(2,6,23,0.85)]">
          <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Find Trusted Suppliers Near You
          </h1>
          <p className="font-medium text-lg text-blue-50 max-w-3xl">
            Browse hundreds of verified liquidators and wholesalers across the United States. Connect with suppliers offering returned, overstock, and brand new merchandise.
          </p>
        </div>

        {/* Main Grid: Filters + Cards */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <div className="rounded-2xl border-2 border-slate-900/80 bg-white p-6 shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
              <h3 className="font-black text-xl text-slate-900 mb-4">Filter by State</h3>
              
              <form method="get" className="space-y-4">
                <input type="hidden" name="search" defaultValue={filters.search} />
                
                {/* States List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {regions.map((r) => (
                    <label
                      key={r.slug}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="radio"
                        name="region"
                        value={r.slug}
                        defaultChecked={filters.region === r.slug}
                        className="h-5 w-5 rounded border-2 border-slate-900/80 text-blue-600 focus:ring-4 focus:ring-blue-200 cursor-pointer"
                      />
                      <span className="font-medium text-sm text-slate-900 group-hover:text-blue-600">
                        {r.name}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-slate-200 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full font-bold rounded-xl bg-blue-600 px-4 py-3 text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] hover:bg-blue-700 active:translate-y-0 transition-all duration-200"
                  >
                    Apply Filter
                  </button>
                  <Link
                    href="/suppliers"
                    className="w-full text-center font-medium text-sm text-slate-600 hover:text-slate-900 py-2 hover:underline underline-offset-2"
                  >
                    Clear Filter
                  </Link>
                </div>
              </form>
            </div>
          </aside>

          {/* Cards Section */}
          <section>
            {/* Results Count */}
            <div className="mb-6">
              <p className="font-bold text-lg text-slate-900">
                {result.items.length} Suppliers Found
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
                  className="group block overflow-hidden rounded-2xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-2px] transition-all duration-200"
                >
                  {/* Header with gradient */}
                  <div className="relative h-32 bg-gradient-to-br from-blue-400 to-blue-500 border-b-2 border-slate-900/80">
                    {/* Company Name Badge */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl px-6 py-3 shadow-lg border-2 border-slate-900/80 max-w-full">
                        <div className="font-black text-base text-slate-900 text-center truncate">
                          {s.name}
                        </div>
                      </div>
                    </div>
                    
                    {/* Verified Badge */}
                    {s.averageRating && s.averageRating >= 4 && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-slate-900/80 shadow-sm">
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
                    {s.averageRating && s.averageRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(s.averageRating!) ? 'text-yellow-400' : 'text-slate-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-bold text-sm text-slate-900">
                          {s.averageRating.toFixed(1)}
                        </span>
                        <span className="font-medium text-xs text-slate-500">
                          ({s.reviewCount} {s.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}

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

            {/* Pagination */}
            {nextCursor && (
              <div className="mt-10 flex justify-center">
                <Link
                  href={`/suppliers?${nextParams.toString()}`}
                  className="font-bold rounded-xl bg-blue-600 px-8 py-3 text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] hover:bg-blue-700 active:translate-y-0 transition-all duration-200"
                >
                  Load More Suppliers
                </Link>
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
