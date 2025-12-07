import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { generateFAQSchema, generateBreadcrumbSchema, schemaToJsonLd } from '@/lib/schema';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Liquidation Categories – Buy Wholesale by Product Type | Find Liquidation',
  description: 'Browse liquidation pallets and truckloads by category. Find wholesale electronics, apparel, home goods, tools, toys, and more from verified suppliers across the United States.',
  keywords: 'liquidation categories, wholesale merchandise, liquidation pallets, truckload liquidation, electronics liquidation, apparel liquidation, home goods liquidation',
  alternates: {
    canonical: 'https://findliquidation.com/categories',
  },
  openGraph: {
    title: 'Liquidation Categories – Buy Wholesale by Product Type | Find Liquidation',
    description: 'Browse liquidation pallets and truckloads by category. Find wholesale electronics, apparel, home goods, tools, toys, and more from verified suppliers across the United States.',
    url: 'https://findliquidation.com/categories',
    siteName: 'Find Liquidation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liquidation Categories – Buy Wholesale by Product Type | Find Liquidation',
    description: 'Browse liquidation pallets and truckloads by category. Find wholesale electronics, apparel, home goods, tools, toys, and more from verified suppliers across the United States.',
  },
};

export default async function CategoriesPage() {
  const allPages = await api.catalog.categoryPages.list();
  const categoryPages = allPages.filter((page: any) => page.topicCategory === 'category');

  // FAQ data for schema
  const faqs = [
    {
      question: "How often is supplier data refreshed?",
      answer: "Supplier profiles, ratings, and lot availability are refreshed weekly by Find Liquidation analysts. Subscribers receive alerts when new categories or truckload programs become available.",
    },
    {
      question: "How are Find Liquidation suppliers vetted?",
      answer: "Every supplier completes a multi-step verification including proof of retailer contracts or sourcing rights, warehouse walkthrough, insurance and compliance review, plus buyer reference checks.",
    },
    {
      question: "Do you support international buyers?",
      answer: "Absolutely. Many suppliers offer bilingual account reps, export documentation, and container consolidation. Filter by \"Export Friendly\" badge to find partners experienced with overseas shipping.",
    },
    {
      question: "Can Find Liquidation help me negotiate freight?",
      answer: "Yes. Our sourcing advisors maintain a roster of vetted LTL and full truckload carriers familiar with liquidation hubs. Request a freight consult and we will benchmark rates for your lane.",
    },
    {
      question: "What categories of liquidation merchandise are available?",
      answer: "Find Liquidation features suppliers offering liquidation merchandise across many categories including electronics, apparel, home goods, tools, toys, groceries, and more. Browse by category to find suppliers specializing in the types of inventory you're looking for.",
    }
  ];
  const faqSchema = generateFAQSchema(faqs);
  
  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' }
  ]);


  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(breadcrumbSchema) }}
      />
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">CATEGORIES</p>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
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

        {/* Grid of category page cards */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {categoryPages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group relative flex flex-col h-48 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift hover:-translate-y-1 overflow-hidden"
              aria-label={page.pageTitle}
              title={page.pageTitle}
            >
              <div className="flex flex-col items-center justify-center p-6 h-full text-center">
                {page.heroImage ? (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-3 group-hover:scale-105 transition-transform">
                    <Image
                      src={page.heroImage}
                      alt={page.heroImageAlt || page.pageTitle}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 96px, 112px"
                    />
                  </div>
                ) : (
                  <div className="text-4xl mb-3">🏷️</div>
                )}
                <h3 className="font-heading text-sm font-semibold text-slate-900 line-clamp-2 leading-tight px-2">{page.pageTitle}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Cards Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-600/30 to-transparent" />
          <div className="space-y-6 sm:space-y-8">
            {/* Feature 1: Split Layout - Image Left, Content Right */}
            <article className="grid gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 md:h-[450px] lg:h-[500px]">
              <div className="relative h-64 sm:h-80 w-full md:h-full">
                <Image
                  src="/feature-desk.png"
                  alt="Wholesale electronics workspace"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12">
                <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
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

            {/* Feature 2: Split Layout - Content Left, Image Right */}
            <article className="grid gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 md:h-[450px] lg:h-[500px]">
              <div className="order-2 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 md:order-1">
                <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
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
              <div className="relative order-1 h-64 sm:h-80 w-full md:order-2 md:h-full">
                <Image
                  src="/feature-family.png"
                  alt="Family sourcing pallets"
                  fill
                  className="object-cover"
                />
              </div>
            </article>
          </div>

          {/* FAQ */}
          <div className="mt-16 sm:mt-20 text-center">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">FAQ</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">Frequently Asked Questions</h2>
            <div className="mx-auto mt-8 sm:mt-10 max-w-3xl space-y-4 text-left">
              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
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
                  Supplier profiles, ratings, and lot availability are refreshed weekly by Find Liquidation analysts. Subscribers receive alerts when new categories or truckload programs become available.
                </div>
              </details>

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      How are Find Liquidation suppliers vetted?
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

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
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

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      Can Find Liquidation help me negotiate freight?
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

              <details className="group rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      What categories of liquidation merchandise are available?
                    </div>
                    <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">Categories</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Find Liquidation features suppliers offering liquidation merchandise across many categories including electronics, apparel, home goods, tools, toys, groceries, and more. Browse by category to find suppliers specializing in the types of inventory you're looking for.
                </div>
              </details>
            </div>
          </div>

        </section>
      </div>
    </div>
    </>
  );
}
