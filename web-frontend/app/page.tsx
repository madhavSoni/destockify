import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { TrendingSuppliersRail } from '@/components/trending-suppliers-rail';
import { generateWebsiteSchema, generateOrganizationSchema, schemaToJsonLd } from '@/lib/schema';
import { StateSelector } from '@/components/state-selector';
import { SearchAutocomplete } from '@/components/search-autocomplete';

export type HomepageData = Awaited<ReturnType<typeof api.home.get>>;
type SupplierSummaryList = Awaited<ReturnType<typeof api.suppliers.featured>>;
type CategoryList = Awaited<ReturnType<typeof api.catalog.categories>>;

export default async function HomePage() {
  // Fetch data with error handling for build time
  let data: HomepageData;
  let regions: CategoryList;
  
  try {
    data = await api.home.get();
  } catch (error) {
    // Fallback data if API is not available during build
    data = {
      stats: { suppliers: 0, reviews: 0, categories: 0 },
      featuredSuppliers: [],
      spotlightReviews: [],
      categories: [],
      regions: [],
    };
  }

  try {
    regions = await api.catalog.regions();
  } catch (error) {
    regions = [];
  }

  // Generate Schema.org structured data for homepage
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(organizationSchema) }}
      />

      <div className="bg-white scroll-smooth">
        <HeroSection />

        {/* Trending rail with half-peek card */}
        <TrendingSuppliersRail suppliers={data.featuredSuppliers} />

        <ConnectByState regions={regions} />
        <QuickActionsBar />
        <TwoUpFeatures />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <ListBusinessCta />
        </div>
      </div>
    </>
  );
}

/* --------------------------- HERO --------------------------- */
function HeroSection() {
  return (
    <section className="relative border-b border-black/10 min-h-[400px] sm:min-h-[500px]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/mainbg2.avif"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay with subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Left-anchored content block like Zillow */}
        <div className="max-w-xl space-y-4 sm:space-y-5">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight text-center sm:text-left antialiased m-0">
        Suppliers. Pallets. Truckloads. Deals.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-white/90 font-normal">
            Discover vetted suppliers offering truckloads and pallets of returns, overstock and liquidations in your area.
          </p>

          {/* Search bar with autocomplete */}
          <div className="mt-6 sm:mt-8 relative z-30">
            <div className="rounded-md bg-white shadow-lg border-2 border-black/10 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600 transition-all relative">
              <SearchAutocomplete />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- QUICK ACTIONS ------------------------ */
function QuickActionsBar() {
  const items = [
    { 
      icon: (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/suppliers', 
      label: 'Find Vetted Suppliers',
      description: 'Browse verified wholesale liquidators'
    },
    { 
      icon: (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      href: '/suppliers#reviews', 
      label: 'Read Reviews',
      description: 'See real buyer experiences'
    },
    { 
      icon: (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/list-your-business', 
      label: 'List Your Business',
      description: 'Get discovered by buyers'
    },
  ];

  return (
    <section className="border-y border-black/10 bg-slate-50 py-12 sm:py-16 relative">
      <div className="absolute inset-0 opacity-3 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(45deg, transparent 30%, rgba(0,85,255,0.05) 50%, transparent 70%)',
        backgroundSize: '40px 40px'
      }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="group relative flex flex-col items-center rounded-xl border-2 border-black/10 bg-white p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-blue-600 hover:-translate-y-1"
            >
              <div className="relative mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-md bg-blue-600 text-white transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105">
                {item.icon}
              </div>
              
              <h3 className="relative text-lg sm:text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                {item.label}
              </h3>
              
              <p className="relative mt-2 sm:mt-3 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
              
              <div className="relative mt-4 sm:mt-5 flex items-center text-sm font-semibold text-blue-600 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                Learn more
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- CONNECT BY STATE -------------------- */
function ConnectByState({ regions }: { regions: any[] }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16 text-center sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #0055FF 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />
      <div className="relative">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">Connect with Verified Suppliers</h3>
        <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
          Search for overstock, returns and liquidations by the pallet or truckload.
        </p>
        <StateSelector regions={regions} />
      </div>
    </section>
  );
}

/* --------------------------- TWO IMAGE FEATURES ------------------------------ */
function TwoUpFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
      <div className="space-y-6 sm:space-y-8">
        {/* Feature 1: Split Layout - Image Left, Content Right */}
        <article className="grid gap-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:shadow-xl md:grid-cols-2 md:h-[450px] lg:h-[500px]">
          <div className="relative h-64 sm:h-80 w-full md:h-full">
            <Image
              src="/feature-desk.png"
              alt="Liquidation warehouse desk"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Buy Truckload Liquidation Direct from Vetted Liquidators Near You
            </h3>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
              Source by the pallet or truckload for your bin stores, discount store, auction house and more! Buy
              truckloads of returns, overstock and liquidations directly from Amazon, Target, Walmart, Home Depot and more.
            </p>
            <Link
              href="/suppliers"
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
        <article className="grid gap-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:shadow-xl md:grid-cols-2 md:h-[450px] lg:h-[500px]">
          <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 md:order-1">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Read Real Reviews from Buyers
            </h3>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
              Find liquidation pallets, wholesale inventory, and merchandise for live auctions from trusted suppliers.
            </p>
            <Link
              href="/suppliers"
              className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Browse Reviews
              <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="relative order-1 h-64 sm:h-80 w-full md:order-2 md:h-full">
            <Image
              src="/feature-family.png"
              alt="Family business liquidation"
              fill
              className="object-cover"
            />
          </div>
        </article>
      </div>
    </section>
  );
}

/* ----------------------------- SUPPLIER CTA ---------------------------------- */
function ListBusinessCta() {
  return (
    <section className="my-12 sm:my-16 lg:my-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
      <div className="relative mx-auto max-w-6xl rounded-xl border border-black/10 bg-black p-6 sm:p-8 lg:p-10 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
        <div className="relative">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">List your Business</h3>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl lg:text-2xl leading-relaxed">
            Get seen by 1M people looking for merchandise from top suppliers.
          </p>
          <Link
            href="/list-your-business"
            className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

