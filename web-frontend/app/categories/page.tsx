import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

export default async function CategoriesPage() {
  const categories = await api.catalog.categories();

  // simple emoji placeholders (swap to icons later)
  const iconFor = (slug: string) => {
    if (/\b(appar|clothes|fashion|apparel)\b/i.test(slug)) return '🧥';
    if (/\b(elec|tech|computer|phone)\b/i.test(slug)) return '💻';
    if (/\btools?|hardware\b/i.test(slug)) return '🛠️';
    if (/\bhome|house|furni\b/i.test(slug)) return '🏠';
    if (/\btoys?\b/i.test(slug)) return '🧸';
    if (/\bgrocery|food\b/i.test(slug)) return '🛒';
    return '🏷️';
  };

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
            Buy Wholesale Merchandise by the Category
          </h1>
          <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Find Liquidation Pallets and Truckloads across multiple categories
          </p>
        </div>

        {/* Marketplace button */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/suppliers"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
          >
            Browse Marketplace
            <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Grid of category cards */}
        <div className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group relative flex h-32 items-center justify-center rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              aria-label={c.name}
              title={c.name}
            >
              <span className="text-4xl select-none">{iconFor(c.slug + c.name)}</span>
              <span className="sr-only">{c.name}</span>
            </Link>
          ))}
        </div>

        {/* Feature Cards Section */}
        <section className="mt-16 sm:mt-20">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Left card */}
            <article className="grid gap-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 sm:h-80 w-full bg-gray-50">
                <Image
                  src="/feature-desk.png"
                  alt="Wholesale electronics workspace"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  Buy Wholesale Electronics From Trusted Suppliers
                </h3>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  The largest directory for truckload liquidation in the United States,
                  featuring returns, overstock, general merchandise, and a wide variety
                  of other categories.
                </p>
                <Link
                  href="/suppliers?category=electronics"
                  className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
                >
                  Browse Suppliers
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </article>

            {/* Right card */}
            <article className="grid gap-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:shadow-xl">
              <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 md:order-1">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  Find Wholesale Clothing and Apparel Suppliers Near You
                </h3>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  Buy wholesale clothing, shoes, and purses in bulk. Find wholesale men's,
                  women's, and kids' apparel from suppliers near you.
                </p>
                <Link
                  href="/suppliers?category=clothing"
                  className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  Browse Suppliers
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <div className="relative order-1 h-64 sm:h-80 w-full md:order-2 bg-gray-50">
                <Image
                  src="/feature-family.png"
                  alt="Family sourcing pallets"
                  fill
                  className="object-contain"
                />
              </div>
            </article>
          </div>

          {/* FAQ */}
          <div className="mt-16 sm:mt-20 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">Frequently Asked Questions</h2>
            <div className="mx-auto mt-8 sm:mt-10 max-w-3xl space-y-4 text-left">
              <details className="group rounded-lg border border-black/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      How often is supplier data refreshed?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Account & Alerts</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Supplier profiles, ratings, and lot availability are refreshed weekly by Trust Pallet analysts. Subscribers receive alerts when new categories or truckload programs become available.
                </div>
              </details>

              <details className="group rounded-lg border border-black/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      How are Trust Pallet suppliers vetted?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Getting Started</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Every supplier completes a multi-step verification including proof of retailer contracts or sourcing rights, warehouse walkthrough, insurance and compliance review, plus buyer reference checks.
                </div>
              </details>

              <details className="group rounded-lg border border-black/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      Do you support international buyers?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">International</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Absolutely. Many suppliers offer bilingual account reps, export documentation, and container consolidation. Filter by "Export Friendly" badge to find partners experienced with overseas shipping.
                </div>
              </details>

              <details className="group rounded-lg border border-black/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      Can Trust Pallet help me negotiate freight?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Logistics & Freight</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Yes. Our sourcing advisors maintain a roster of vetted LTL and full truckload carriers familiar with liquidation hubs. Request a freight consult and we will benchmark rates for your lane.
                </div>
              </details>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
