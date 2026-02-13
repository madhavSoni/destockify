import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { TrendingSuppliersRail } from '@/components/trending-suppliers-rail';
import { generateWebsiteSchema, generateOrganizationSchema, generateFAQSchema, schemaToJsonLd } from '@/lib/schema';
import { StateSelector } from '@/components/state-selector';
import { SearchAutocomplete } from '@/components/search-autocomplete';
import { BrandCarousel } from '@/components/brand-carousel';
import { CategoryCarousel } from '@/components/category-carousel';

export const metadata: Metadata = {
  title: {
    absolute: 'Find Liquidation – Buy Liquidation Truckloads | Reviews & Supplier Directory',
  },
  description: 'Find liquidation truckloads and pallets for sale from verified suppliers. Browse reviews, compare liquidators, and use the Find Liquidation directory to source returns, overstock, and wholesale inventory with confidence.',
  alternates: {
    canonical: 'https://findliquidation.com',
  },
  openGraph: {
    title: 'Find Liquidation – Buy Liquidation Truckloads | Reviews & Supplier Directory',
    description: 'Find liquidation truckloads and pallets for sale from verified suppliers. Browse reviews, compare liquidators, and use the Find Liquidation directory to source returns, overstock, and wholesale inventory with confidence.',
    url: 'https://findliquidation.com',
    siteName: 'Find Liquidation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Liquidation – Buy Liquidation Truckloads | Reviews & Supplier Directory',
    description: 'Find liquidation truckloads and pallets for sale from verified suppliers. Browse reviews, compare liquidators, and use the Find Liquidation directory to source returns, overstock, and wholesale inventory with confidence.',
  },
};

export type HomepageData = Awaited<ReturnType<typeof api.home.get>>;
type SupplierSummaryList = Awaited<ReturnType<typeof api.suppliers.featured>>;
type CategoryList = Awaited<ReturnType<typeof api.catalog.categories>>;

export default async function HomePage() {
  // Fetch data with error handling for build time
  let data: HomepageData;
  let regions: CategoryList;
  let categoryPages: any[] = [];
  
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

  try {
    categoryPages = await api.catalog.categoryPages.list();
  } catch (error) {
    categoryPages = [];
  }

  // Generate Schema.org structured data for homepage
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();
  
  // FAQ data for schema
  const faqs = [
    {
      question: "How do I find the best liquidation suppliers near me?",
      answer: "Use our directory to search by location, category, and supplier reputation. Filter by state or region to find liquidators in your area. Read verified reviews from other buyers to compare suppliers before making a purchase.",
    },
    {
      question: "What types of liquidation inventory can I buy?",
      answer: "You can find a wide variety of liquidation merchandise including returns, overstock, closeout items, and brand-new products. Categories range from electronics and apparel to home goods, tools, toys, and more. Most suppliers offer pallets or full truckloads.",
    },
    {
      question: "How are suppliers verified on Find Liquidation?",
      answer: "Every supplier goes through a verification process that includes proof of sourcing rights, warehouse inspections, insurance verification, and buyer reference checks. Verified suppliers display a verification badge on their profile.",
    },
    {
      question: "Can I read reviews before buying from a supplier?",
      answer: "Yes, all suppliers have a reviews section where you can read detailed feedback from verified buyers. Reviews include ratings, written feedback, and sometimes photos of the merchandise received. This helps you make informed purchasing decisions.",
    },
    {
      question: "What should I expect when buying liquidation truckloads?",
      answer: "Liquidation truckloads typically contain mixed merchandise that may include customer returns, overstock, or closeout items. Condition varies, so it's important to read supplier descriptions and reviews carefully. Many suppliers offer inspection options before purchase.",
    }
  ];
  const faqSchema = generateFAQSchema(faqs);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(faqSchema) }}
      />

      <div className="bg-slate-50 scroll-smooth">
        <HeroSection />

        {/* Trending rail with half-peek card */}
        <TrendingSuppliersRail suppliers={data.featuredSuppliers} />

        <SearchDirectorySection />
        <BrandCarousel categoryPages={categoryPages} />
        <CategoryCarousel categoryPages={categoryPages} />
        <ConnectByState regions={regions} />
        <QuickActionsBar />
        <TwoUpFeatures />

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <ListBusinessCta />
        </div>

        {/* FAQ Section */}
        <FaqSection />
      </div>
    </>
  );
}

/* --------------------------- HERO --------------------------- */
function HeroSection() {
  return (
    <section className="relative min-h-[300px] sm:min-h-[350px] scroll-mt-[70px]">
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
        {/* Enhanced dark overlay with subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/30" />
        {/* Subtle brand gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-primary-800/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-4 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12">
        {/* Left-anchored content block like Zillow */}
        <div className="max-w-xl space-y-3 sm:space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight text-center sm:text-left antialiased m-0">
        Buy Liquidation Truckloads – Find Verified Suppliers
          </h1>

          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 font-normal">
            Read real reviews from liquidation companies selling truckloads and pallets of returns, overstock, and wholesale merchandise.
          </p>

          {/* Search bar with autocomplete - square geometric style */}
          <div className="mt-4 sm:mt-5 relative z-30">
            <div className="rounded-lg bg-white shadow-sm border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all relative">
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
    <section className="bg-white py-16 sm:py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="group relative flex flex-col items-center rounded-md bg-white border border-slate-200 p-6 sm:p-8 text-center shadow-sm transition-all duration-300 ease-out hover:shadow-lift hover:-translate-y-1"
            >
              <div className="relative mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-md bg-blue-600 text-white transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105">
                {item.icon}
              </div>
              
              <h2 className="font-heading relative text-lg sm:text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                {item.label}
              </h2>
              
              <p className="relative mt-2 sm:mt-3 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
              
              <div className="relative mt-4 sm:mt-5 flex items-center text-sm font-semibold text-blue-600 transition-all">
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
    <section className="w-full px-4 py-16 sm:py-20 text-center sm:px-6 lg:px-8 relative bg-white">
      <div className="relative mx-auto max-w-7xl">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">LOCATIONS</p>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">Top-Rated Liquidation & Wholesale Suppliers Near You</h2>
        <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
          Discover wholesale lots of returns, overstock, and liquidation inventory sold by the pallet or by the truckload.
        </p>
        <StateSelector regions={regions} />
      </div>
    </section>
  );
}

/* -------------------- SEARCH DIRECTORY SECTION -------------------- */
function SearchDirectorySection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20 text-center sm:px-6 lg:px-8 relative bg-slate-50">
      <div className="relative">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">DIRECTORY</p>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">The Largest Liquidation Directory</h2>
        <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
          Use Find Liquidation to find the best liquidation truckload and pallet sellers. Read reviews from bin stores, discount stores, auction houses, and more.
        </p>
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Link
            href="/suppliers"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
          >
            See all suppliers
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- TWO IMAGE FEATURES ------------------------------ */
function TwoUpFeatures() {
  return (
    <section className="w-full bg-white relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2 text-center">HOW IT WORKS</p>
        </div>
        <div className="space-y-6 sm:space-y-8">
          {/* Feature 1: Split Layout - Image Left, Content Right */}
          <article className="grid gap-0 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 md:h-[450px] lg:h-[500px]">
            <div className="relative h-64 sm:h-80 w-full md:h-full">
              <Image
                src="/PHOTO-2025-11-30-11-00-27.jpg"
                alt="Liquidation warehouse with product pallets"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
                Buy Truckload Liquidation Direct From Verified Liquidators
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                Source pallets and truckloads for your bin store, discount store, flea market business, or auction house. Buy direct from liquidators handling inventory from Amazon, Walmart, Target, Home Depot, and other major retailers.
              </p>
              <Link
                href="/suppliers"
                className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-primary-900 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-primary-800 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
              >
                Browse Suppliers
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </article>

          {/* Feature 2: Split Layout - Content Left, Image Right */}
          <article className="grid gap-0 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 md:h-[450px] lg:h-[500px]">
            <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 md:order-1">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
                Read Supplier Reviews from Buyers
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                Get honest insights before you buy. Read reviews from real resellers about liquidation pallets, truckloads, wholesale merchandise, and liquidation inventory from suppliers near you.
              </p>
              <Link
                href="/suppliers"
                className="mt-6 sm:mt-8 inline-flex w-fit items-center justify-center rounded-md bg-primary-900 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-primary-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Browse Reviews
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="relative order-1 h-64 sm:h-80 w-full md:order-2 md:h-full">
              <Image
                src="/PHOTO-2025-11-30-10-58-35.jpg"
                alt="Team reviewing supplier reviews on laptop"
                fill
                className="object-cover"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- SUPPLIER CTA ---------------------------------- */
function ListBusinessCta() {
  return (
    <section className="my-16 sm:my-20 lg:my-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />
      <div className="relative mx-auto max-w-6xl rounded-lg bg-black p-6 sm:p-8 lg:p-10 text-white shadow-sm transition-all duration-300 hover:shadow-lift hover:scale-[1.01]">
        <div className="relative">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">List your Business</h2>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl lg:text-2xl leading-relaxed">
            Get seen by 1M people looking for merchandise from top suppliers.
          </p>
          <Link
            href="/list-your-business"
            className="mt-6 sm:mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- FAQ SECTION ---------------------------------- */
function FaqSection() {
  const faqs = [
    {
      question: "How do I find the best liquidation suppliers near me?",
      answer: "Use our directory to search by location, category, and supplier reputation. Filter by state or region to find liquidators in your area. Read verified reviews from other buyers to compare suppliers before making a purchase.",
      category: "Getting Started"
    },
    {
      question: "What types of liquidation inventory can I buy?",
      answer: "You can find a wide variety of liquidation merchandise including returns, overstock, closeout items, and brand-new products. Categories range from electronics and apparel to home goods, tools, toys, and more. Most suppliers offer pallets or full truckloads.",
      category: "Inventory Types"
    },
    {
      question: "How are suppliers verified on Find Liquidation?",
      answer: "Every supplier goes through a verification process that includes proof of sourcing rights, warehouse inspections, insurance verification, and buyer reference checks. Verified suppliers display a verification badge on their profile.",
      category: "Verification"
    },
    {
      question: "Can I read reviews before buying from a supplier?",
      answer: "Yes, all suppliers have a reviews section where you can read detailed feedback from verified buyers. Reviews include ratings, written feedback, and sometimes photos of the merchandise received. This helps you make informed purchasing decisions.",
      category: "Reviews"
    },
    {
      question: "What should I expect when buying liquidation truckloads?",
      answer: "Liquidation truckloads typically contain mixed merchandise that may include customer returns, overstock, or closeout items. Condition varies, so it's important to read supplier descriptions and reviews carefully. Many suppliers offer inspection options before purchase.",
      category: "Buying Process"
    }
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8 bg-slate-50">
      <div className="text-center mb-8 sm:mb-10">
        <div className="text-xs sm:text-sm uppercase tracking-widest text-slate-500 font-semibold mb-2">FAQ</div>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">Frequently Asked Questions</h2>
      </div>
      <div className="mx-auto max-w-3xl space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="group rounded-md bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
              <div className="flex-1">
                <div className="text-base sm:text-lg font-semibold text-primary-900">
                  {faq.question}
                </div>
                <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">{faq.category}</div>
              </div>
              <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </summary>
            <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}


