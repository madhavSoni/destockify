import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ReviewsWrapper } from './reviews-wrapper';
import { generateSupplierSchema, generateBreadcrumbSchema, schemaToJsonLd } from '@/lib/schema';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = await api.suppliers.get(slug).catch(() => null);
  
  if (!detail) {
    return {
      title: 'Supplier Not Found | TrustPallet',
      description: 'The requested supplier could not be found.',
    };
  }

  const { supplier } = detail;
  const companyName = supplier.name;
  const supplierUrl = `https://trustpallet.com/suppliers/${supplier.slug}`;

  return {
    title: `${companyName} Reviews – Are They Legit? | Truckloads & Pallets Buyer Ratings`,
    description: `Is ${companyName} legit? Read real buyer reviews, ratings, and experiences with their liquidation truckloads and pallet sales. See complaints, pricing details, and verified insights before you buy.`,
    alternates: {
      canonical: supplierUrl,
    },
    openGraph: {
      title: `${companyName} Reviews – Are They Legit? | TrustPallet`,
      description: `Is ${companyName} legit? Read real buyer reviews, ratings, and experiences with their liquidation truckloads and pallet sales.`,
      url: supplierUrl,
      siteName: 'TrustPallet',
      type: 'website',
      ...(supplier.logoImage && {
        images: [{
          url: supplier.logoImage,
          width: 1200,
          height: 630,
          alt: `${companyName} logo`,
        }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} Reviews – Are They Legit? | TrustPallet`,
      description: `Is ${companyName} legit? Read real buyer reviews, ratings, and experiences with their liquidation truckloads and pallet sales.`,
      ...(supplier.logoImage && {
        images: [supplier.logoImage],
      }),
    },
  };
}

export default async function SupplierDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params since it's a Promise in Next.js 15+
  const { slug } = await params;
  const detail = await api.suppliers.get(slug).catch(() => null);
  if (!detail) notFound();

  const { supplier, reviewSummary, recentReviews } = detail;

  // Generate Schema.org structured data - DYNAMICALLY from database
  // This updates automatically when reviews are added/changed
  const supplierSchema = generateSupplierSchema(supplier, reviewSummary, recentReviews);
  
  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Suppliers', url: '/suppliers' },
    { name: supplier.name, url: `/suppliers/${supplier.slug}` }
  ]);

  return (
    <>
      {/* Schema.org JSON-LD for SEO - Star ratings will appear in Google search! */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(supplierSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm font-medium text-black/70">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/suppliers" className="hover:text-blue-600 transition-colors">Suppliers</Link>
            <span className="mx-2">›</span>
            <span className="font-bold text-black">{supplier.name}</span>
          </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-1">
          {/* Main Content */}
          <div className="space-y-8">
            <SupplierHeader supplier={supplier} reviewSummary={reviewSummary} />
            <SupplierOverview supplier={supplier} />
            
            {/* Write Review & Reviews Section */}
            <ReviewsWrapper
              supplier={supplier}
              supplierId={supplier.slug}
              recentReviews={recentReviews}
              reviewSummary={reviewSummary}
            />
            
            {/* Ready to Order Card */}
            <ReadyToOrderCard supplier={supplier} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

type SupplierDetail = Awaited<ReturnType<typeof api.suppliers.get>>;

/* --------------------------------- HEADER ---------------------------------- */

function SupplierHeader({
  supplier,
  reviewSummary,
}: {
  supplier: SupplierDetail['supplier'];
  reviewSummary: SupplierDetail['reviewSummary'];
}) {
  const rating = reviewSummary.average ?? 0;
  const count = reviewSummary.count ?? 0;

  return (
    <section className="rounded-md border-2 border-black/10 bg-white overflow-hidden shadow-md">
      {/* Hero Image */}
      {supplier.heroImage && (
        <div className="relative h-56 w-full border-b-2 border-black/10">
          <Image src={supplier.heroImage} alt={supplier.name} fill className="object-cover" priority />
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Logo and Name */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {supplier.logoImage && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
              <Image src={supplier.logoImage} alt="" fill className="object-contain p-3" />
            </div>
          )}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap mb-2">
              <h1 className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 break-words leading-tight">
                {supplier.name}
              </h1>
              {/* Prominent Flags next to name */}
              {supplier.flags && supplier.flags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {supplier.flags.map((flag, i) => (
                    <div key={`flag-${i}`} className="group relative">
                      <span 
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-semibold shadow-sm cursor-help transition-all duration-200 hover:scale-105 ${
                          flag.variant === 'verified' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-700 text-white' 
                            : 'bg-black border-black text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          {flag.variant === 'verified' ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          )}
                        </svg>
                        {flag.text}
                      </span>
                      {/* Hover tooltip */}
                      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 rounded-md text-sm font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 shadow-lg ${
                        flag.variant === 'verified' 
                          ? 'bg-blue-700' 
                          : 'bg-black'
                      }`}>
                        {flag.variant === 'verified' 
                          ? 'This supplier has been verified by our team' 
                          : 'Warning: This supplier has been reported as fraudulent'}
                        <div className={`absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45 ${
                          flag.variant === 'verified' 
                            ? 'bg-blue-700' 
                            : 'bg-black'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="font-normal text-sm sm:text-base text-slate-600 leading-relaxed">
              Read reviews from {supplier.name}. Are they legit or a scam? Find out what buyers say about them before purchasing merchandise.
            </p>
            
            {/* Region & Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {supplier.region && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600/10 border border-blue-600/20 px-3 py-1.5 text-sm font-medium text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {supplier.region.name}
                </span>
              )}
              {supplier.isContractHolder && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600/10 border border-blue-600/20 px-3 py-1.5 text-sm font-medium text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Contract Holder
                </span>
              )}
              {supplier.isBroker && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-600/10 border border-blue-600/20 px-3 py-1.5 text-sm font-medium text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Broker
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating & Actions */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t-2 border-black/5 pt-6 bg-black/5 -mx-6 sm:-mx-8 px-6 sm:px-8 py-6 rounded-b-md">
          <div className="flex items-center gap-3">
            <RatingStars rating={rating} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl sm:text-2xl text-black">{rating.toFixed(1)}</span>
              <span className="font-normal text-sm text-black/50">
                ({count} {count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-black/5 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="hidden sm:inline">Website</span>
                <span className="sm:hidden">Visit</span>
              </a>
            )}
            {supplier.phone && (
              <a
                href={`tel:${supplier.phone}`}
                className="inline-flex items-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="hidden sm:inline">{supplier.phone}</span>
                <span className="sm:hidden">Call</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- READY TO ORDER CARD -------------------------- */

function ReadyToOrderCard({ supplier }: { supplier: SupplierDetail['supplier'] }) {
  return (
    <section className="rounded-md border-2 border-black/10 p-8 sm:p-10 shadow-md relative overflow-hidden bg-white transition-all duration-300 hover:shadow-lg">
      <div className="max-w-3xl mx-auto text-center relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-blue-600 mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="font-black text-3xl text-slate-900 mb-3 leading-tight">Ready to Work with {supplier.name}?</h2>
        <p className="text-base text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
          Get in touch to discuss your wholesale needs and start your order today
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {supplier.website && (
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-md bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Visit Website
            </a>
          )}
          {supplier.email && (
            <a
              href={`mailto:${supplier.email}`}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-md border-2 border-blue-600 bg-white px-8 py-4 text-base font-semibold text-blue-600 hover:bg-blue-600/10 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </a>
          )}
          {supplier.phone && (
            <a
              href={`tel:${supplier.phone}`}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-md border-2 border-black/10 bg-white px-8 py-4 text-base font-semibold text-black hover:bg-black/5 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {supplier.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- OVERVIEW -------------------------------- */

function SupplierOverview({ supplier }: { supplier: SupplierDetail['supplier'] }) {
  return (
    <section className="rounded-md border-2 border-black/10 bg-white p-8 sm:p-10 shadow-md">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/5">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-bold text-2xl text-slate-900">About</h2>
      </div>
      
      <div className="space-y-6">
        {supplier.description && (
          <p className="font-normal text-base text-slate-600 leading-relaxed">{supplier.description}</p>
        )}

        {/* Key Details Grid */}
        {/* minimumOrder and leadTime not available in supplier type */}
        {false && (
          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            {false && (
              <div className="rounded-md border-2 border-black/10 bg-white p-6 transition-all hover:border-blue-600 hover:shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-black/5">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-black/50 uppercase tracking-wide">Minimum Order</div>
                </div>
                <div className="text-2xl font-bold text-black tracking-tight"></div>
              </div>
            )}
            {false && (
              <div className="rounded-md border-2 border-black/10 bg-white p-6 transition-all hover:border-blue-600 hover:shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-black/5">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-black/50 uppercase tracking-wide">Lead Time</div>
                </div>
                <div className="text-2xl font-bold text-black tracking-tight"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ RATING STARS ----------------------------- */

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalf;
        
        return (
          <svg
            key={i}
            className="w-5 h-5"
            fill={isFilled ? "#3388FF" : isHalf ? "#3388FF" : "none"}
            stroke="#3388FF"
            strokeWidth={isFilled || isHalf ? 0 : 1.5}
            viewBox="0 0 24 24"
          >
            {isHalf ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#3388FF" />
                    <stop offset="50%" stopColor="white" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  stroke="#3388FF"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </>
            ) : (
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}
