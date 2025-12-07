import Link from 'next/link';
import Image from 'next/image';
import { StateSelector } from './state-selector';
import { InteractiveMap } from './interactive-map';

export default async function LocationsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">LOCATIONS</p>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
            Buy Wholesale Merchandise by Location
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

        {/* Interactive Map */}
        <InteractiveMap />

        {/* Shop by State dropdown */}
        <StateSelector />
      </div>

      {/* Feature cards section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
        <div className="space-y-6 sm:space-y-8">
          {/* Feature 1: Split Layout - Image Left, Content Right */}
          <article className="grid gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 md:h-[450px] lg:h-[500px]">
            <div className="relative h-64 sm:h-80 w-full md:h-full">
              <Image
                src="/feature-desk.png"
                alt="Wholesale suppliers"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12">
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
                Find Wholesale Suppliers in Florida
              </h3>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                The largest directory for truckload liquidation in the United States, featuring returns, overstock,
                general merchandise, and a wide variety of other categories.
              </p>
              <Link
                href="/suppliers?region=florida"
                className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
              >
                Browse Suppliers
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>

          {/* Feature 2: Split Layout - Content Left, Image Right */}
          <article className="grid gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 md:h-[450px] lg:h-[500px]">
            <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 md:order-1">
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
                Find Liquidation Pallets Near You
              </h3>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                Buy wholesale clothing, shoes, and purses in bulk. Find mens, womens, and kids apparel for sale from
                suppliers near you.
              </p>
              <Link
                href="/suppliers"
                className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Browse Suppliers
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="relative order-1 h-64 sm:h-80 w-full md:order-2 md:h-full">
              <Image
                src="/feature-family.png"
                alt="Family business"
                fill
                className="object-cover"
              />
            </div>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-white text-center">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">FAQ</p>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-8 sm:mb-10">Frequently Asked Questions</h2>
          <div className="mx-auto max-w-3xl space-y-4 text-left">
            <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-semibold text-slate-900">
                    How do I find suppliers in my state?
                  </div>
                </div>
                <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                Use the "Shop by State" dropdown above to filter suppliers by location. You can also browse by region or search for specific cities. Each supplier profile shows their warehouse locations and service areas.
              </div>
            </details>

            <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-semibold text-slate-900">
                    What types of products can I buy by location?
                  </div>
                </div>
                <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                Suppliers offer a wide variety of liquidation merchandise including clothing, electronics, home goods, toys, and more. Each supplier profile lists their available categories and minimum order requirements. Filter by category to find specific product types in your area.
              </div>
            </details>

            <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-semibold text-slate-900">
                    Do suppliers ship nationwide or only locally?
                  </div>
                </div>
                <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                Shipping policies vary by supplier. Some offer nationwide shipping, while others prefer local pickup or have specific service areas. Check each supplier's profile for their logistics notes, which detail shipping options, freight costs, and pickup availability.
              </div>
            </details>

            <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-semibold text-slate-900">
                    What's the minimum order quantity?
                  </div>
                </div>
                <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                Minimum order requirements vary significantly by supplier. Some accept pallet orders (typically 500-1,500 units), while others require full truckloads. Each supplier profile displays their minimum order and lot size options. Contact suppliers directly for specific requirements.
              </div>
            </details>

            <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                <div className="flex-1">
                  <div className="text-base sm:text-lg font-semibold text-slate-900">
                    How do I contact suppliers in my area?
                  </div>
                </div>
                <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </summary>
              <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                Each supplier profile includes contact information including email, phone, and website. You can reach out directly through their listed contact methods. Many suppliers also have inquiry forms on their websites for bulk order requests.
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
