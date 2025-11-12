import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ReviewsWrapper } from './reviews-wrapper';

export default async function SupplierDetailPage(props: any) {
  const { params } = props;
  const detail = await api.suppliers.get(params.slug).catch(() => null);
  if (!detail) notFound();

  const { supplier, reviewSummary, recentReviews } = detail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/suppliers" className="hover:text-blue-600 transition-colors">Suppliers</Link>
          <span className="mx-2">›</span>
          <span className="font-bold text-slate-900">{supplier.name}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <SupplierHeader supplier={supplier} reviewSummary={reviewSummary} />
            <SupplierOverview supplier={supplier} />
            
            {/* Write Review & Reviews Section */}
            <ReviewsWrapper
              supplier={supplier}
              supplierId={supplier.slug}
              recentReviews={recentReviews}
              reviewSummary={reviewSummary}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <SupplierSidebar supplier={supplier} />
          </div>
        </div>
      </div>
    </div>
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
    <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {/* Hero Image */}
      {supplier.heroImage && (
        <div className="relative h-56 w-full border-b border-slate-200">
          <Image src={supplier.heroImage} alt={supplier.name} fill className="object-cover" priority />
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Logo and Name */}
        <div className="flex items-start gap-6">
          {supplier.logoImage && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <Image src={supplier.logoImage} alt="" fill className="object-contain p-3" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-3xl sm:text-4xl text-slate-900 mb-2">
              {supplier.name}
            </h1>
            {supplier.shortDescription && (
              <p className="font-normal text-base text-slate-600">{supplier.shortDescription}</p>
            )}
            
            {/* Region & Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {supplier.region && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {supplier.region.name}
                </span>
              )}
              {supplier.badges?.map((badge, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-sm font-medium text-green-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Rating & Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3">
            <RatingStars rating={rating} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-slate-900">{rating.toFixed(1)}</span>
              <span className="font-normal text-sm text-slate-600">
                ({count} {count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website
              </a>
            )}
            {supplier.phone && (
              <a
                href={`tel:${supplier.phone}`}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 hover:border-blue-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {supplier.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- OVERVIEW -------------------------------- */

function SupplierOverview({ supplier }: { supplier: SupplierDetail['supplier'] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="font-bold text-2xl text-slate-900 mb-6">About</h2>
      
      <div className="space-y-6">
        {supplier.description && (
          <p className="font-normal text-base text-slate-700 leading-relaxed">{supplier.description}</p>
        )}

        {/* Key Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {supplier.minimumOrder && (
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <div className="text-sm font-medium text-blue-600 mb-1">Minimum Order</div>
              <div className="text-xl font-semibold text-slate-900">{supplier.minimumOrder}</div>
            </div>
          )}
          {supplier.leadTime && (
            <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <div className="text-sm font-medium text-purple-600 mb-1">Lead Time</div>
              <div className="text-xl font-semibold text-slate-900">{supplier.leadTime}</div>
            </div>
          )}
        </div>

        {/* Specialties */}
        {supplier.specialties && supplier.specialties.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.specialties.map((specialty, i) => (
                <span key={i} className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-sm font-medium text-purple-700">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {supplier.certifications && supplier.certifications.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-slate-900 mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.certifications.map((cert, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {(supplier.logisticsNotes || supplier.pricingNotes) && (
          <div className="space-y-4">
            {supplier.logisticsNotes && (
              <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div className="font-medium text-sm text-blue-900">Logistics</div>
                </div>
                <p className="font-normal text-sm text-blue-800">{supplier.logisticsNotes}</p>
              </div>
            )}
            {supplier.pricingNotes && (
              <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="font-medium text-sm text-emerald-900">Pricing</div>
                </div>
                <p className="font-normal text-sm text-emerald-800">{supplier.pricingNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------- SIDEBAR --------------------------------- */

function SupplierSidebar({ supplier }: { supplier: SupplierDetail['supplier'] }) {
  return (
    <aside className="space-y-6 sticky top-6">
      {/* Categories */}
      {supplier.categories.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-lg text-slate-900 mb-4">Categories</h3>
          <div className="space-y-2">
            {supplier.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group block rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <span className="flex items-center justify-between">
                  {category.name}
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lot Sizes */}
      {supplier.lotSizes && supplier.lotSizes.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-lg text-slate-900 mb-4">Lot Sizes</h3>
          <div className="space-y-2">
            {supplier.lotSizes.map((lotSize) => (
              <div
                key={lotSize.slug}
                className="flex items-center justify-between rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3"
              >
                <span className="text-sm font-medium text-purple-900">{lotSize.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Available
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Card */}
      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
        <h3 className="font-black text-2xl mb-3">Ready to Order?</h3>
        <p className="text-sm font-medium text-blue-100 mb-5">
          Contact {supplier.name} to discuss your wholesale needs
        </p>
        {supplier.website && (
          <a
            href={supplier.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-white px-4 py-3.5 text-center font-black text-blue-600 hover:translate-y-[-2px] hover:shadow-md transition-all shadow-sm border-2 border-slate-900/80 ring-2 ring-slate-900/80"
          >
            Visit Website →
          </a>
        )}
        {supplier.email && (
          <a
            href={`mailto:${supplier.email}`}
            className="mt-3 block w-full rounded-xl border-2 border-white px-4 py-3.5 text-center font-black text-white hover:bg-white/20 hover:translate-y-[-2px] hover:shadow-md transition-all"
          >
            Send Email
          </a>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------ RATING STARS ----------------------------- */

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalf;
        
        return (
          <svg
            key={i}
            className="w-6 h-6"
            fill={isFilled || isHalf ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isFilled || isHalf ? 0 : 2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              className={isFilled || isHalf ? "text-yellow-400" : "text-slate-300"}
            />
          </svg>
        );
      })}
    </div>
  );
}
