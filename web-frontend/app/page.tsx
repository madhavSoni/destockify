import Link from 'next/link';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import { api } from '@/lib/api';
import { FaqAccordion } from '@/components/faq-accordion';
import { TrendingSuppliersRail } from '@/components/trending-suppliers-rail';
import { generateWebsiteSchema, generateOrganizationSchema, schemaToJsonLd } from '@/lib/schema';
import { StateSelector } from '@/components/state-selector';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export type HomepageData = Awaited<ReturnType<typeof api.home.get>>;
type SupplierSummaryList = Awaited<ReturnType<typeof api.suppliers.featured>>;
type GuideList = Awaited<ReturnType<typeof api.guides.list>>;
type CategoryList = Awaited<ReturnType<typeof api.catalog.categories>>;
type FaqList = Awaited<ReturnType<typeof api.faq.list>>;

export default async function HomePage() {
  const data = await api.home.get();
  const regions = await api.catalog.regions();

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

      <div className={`${inter.className} bg-slate-50 scroll-smooth`} style={{
        WebkitFontSmoothing: 'antialiased',
        textTransform: 'none',
        fontFamily: '"Inter", "Adjusted Arial", Tahoma, Geneva, sans-serif',
      }}>
        <HeroSection />

        {/* Trending rail with half-peek card */}
        <TrendingSuppliersRail suppliers={data.featuredSuppliers} />

        <ConnectByState regions={regions} />
        <QuickActionsBar />
        <TwoUpFeatures />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <ListBusinessCta />
          <FaqSection faqs={data.faqs} />
        </div>
      </div>
    </>
  );
}

/* --------------------------- HERO --------------------------- */
function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 min-h-[450px] sm:min-h-[500px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/mainbg2.avif"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay for text readability - lighter for more vibrant image */}
        <div className="absolute inset-0 bg-slate-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Left-anchored content block like Zillow */}
        <div className="max-w-xl space-y-4 sm:space-y-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Find Liquidation Suppliers Near You
          </h1>

          <p className="text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 text-blue-50/90">
            Discover vetted suppliers offering truckloads and pallets of returns, overstock and liquidations in your area.
          </p>

          {/* Search bar – Zillow-style, clean & simple */}
          <form action="/suppliers" method="get" className="mt-6 sm:mt-8">
            <div className="relative flex items-center rounded-lg bg-white shadow-xl">
              <input
                type="search"
                name="search"
                placeholder="Enter city, state, or keyword"
                className="h-14 sm:h-16 w-full bg-transparent border-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 focus:outline-none px-4 sm:px-6 pr-12 sm:pr-14"
              />
              <button
                type="submit"
                className="absolute right-2 sm:right-3 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/30 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
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
    <section className="border-y border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="group relative flex flex-col items-center rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-6 sm:p-8 text-center transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400 hover:from-blue-50/50"
            >
              {/* Subtle background decoration */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm transition-all group-hover:bg-blue-100 group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3">
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
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16 text-center sm:px-6 lg:px-8">
      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">Connect with Verified Suppliers</h3>
      <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-slate-700">
        Search for overstock, returns and liquidations by the pallet or truckload.
      </p>
      <StateSelector regions={regions} />
    </section>
  );
}

/* --------------------------- TWO IMAGE FEATURES ------------------------------ */
function TwoUpFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        {/* Feature 1: Split Layout - Image Left, Content Right */}
        <article className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg md:grid-cols-2 md:h-[450px] lg:h-[500px]">
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
            <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 text-slate-600">
              Source by the pallet or truckload for your bin stores, discount store, auction house and more! Buy
              truckloads of returns, overstock and liquidations directly from Amazon, Target, Walmart, Home Depot and more.
            </p>
            <Link
              href="/suppliers"
              className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-900/20"
            >
              Browse Suppliers
              <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </article>

        {/* Feature 2: Split Layout - Content Left, Image Right */}
        <article className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg md:grid-cols-2 md:h-[450px] lg:h-[500px]">
          <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 md:order-1">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Read Real Reviews from Buyers
            </h3>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-6 sm:leading-7 text-slate-600">
              Find liquidation pallets, wholesale inventory, and merchandise for live auctions from trusted suppliers.
            </p>
            <Link
              href="/suppliers"
              className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-900/20"
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
    <section className="my-12 sm:my-16 lg:my-20">
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-900 p-6 sm:p-8 lg:p-10 text-white shadow-lg transition hover:shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        </div>
        <div className="relative">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold">List your Business</h3>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl lg:text-2xl leading-7 sm:leading-8">
            Get seen by 1M people looking for merchandise from top suppliers.
          </p>
          <Link
            href="/list-your-business"
            className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ -------------------------------------- */
function FaqSection({ faqs }: { faqs: FaqList }) {
  return (
    <section className="py-12 sm:py-16">
      <h2 className="mb-8 sm:mb-10 text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">FAQ</h2>
      <div className="mx-auto w-full max-w-6xl px-0">
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
