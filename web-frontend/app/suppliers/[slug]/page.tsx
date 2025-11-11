import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';
import { ReviewsWrapper } from './reviews-wrapper';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function SupplierDetailPage({ params }: { params: { slug: string } }) {
  const detail = await api.suppliers.get(params.slug).catch(() => null);
  if (!detail) notFound();

  const { supplier, reviewSummary, recentReviews } = detail;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">Home</Link> › 
          <Link href="/suppliers" className="hover:text-slate-900"> Suppliers</Link> › 
          <span className="font-medium text-slate-900"> {supplier.name}</span>
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
    <section className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
      {/* Hero Image */}
      {supplier.heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-3xl">
          <Image src={supplier.heroImage} alt={supplier.name} fill className="object-cover" priority />
        </div>
      )}

      <div className="p-6">
        {/* Logo and Name */}
        <div className="flex items-start gap-4">
          {supplier.logoImage && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white">
              <Image src={supplier.logoImage} alt="" fill className="object-contain p-2" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className={`${hand.className} text-4xl text-slate-900 mb-2`}>
              {supplier.name}
            </h1>
            {supplier.shortDescription && (
              <p className="text-slate-600">{supplier.shortDescription}</p>
            )}
            
            {/* Region & Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {supplier.region && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  📍 {supplier.region.name}
                </span>
              )}
              {supplier.badges?.map((badge, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Rating & Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-4">
            <RatingStars rating={rating} />
            <span className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">{rating.toFixed(1)}</span> ({count} {count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                🌐 Website
              </a>
            )}
            {supplier.phone && (
              <button className="rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:shadow-sm transition-all">
                📞 {supplier.phone}
              </button>
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
    <section className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] p-6">
      <h2 className={`${hand.className} text-3xl text-slate-900 mb-4`}>About</h2>
      
      <div className="space-y-4">
        {supplier.description && (
          <p className="text-slate-700 leading-relaxed">{supplier.description}</p>
        )}

        {/* Key Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          {supplier.minimumOrder && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500 mb-1">Minimum Order</div>
              <div className="text-lg font-bold text-slate-900">{supplier.minimumOrder}</div>
            </div>
          )}
          {supplier.leadTime && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500 mb-1">Lead Time</div>
              <div className="text-lg font-bold text-slate-900">{supplier.leadTime}</div>
            </div>
          )}
        </div>

        {/* Specialties */}
        {supplier.specialties && supplier.specialties.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.specialties.map((specialty, i) => (
                <span key={i} className="rounded-xl bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {supplier.certifications && supplier.certifications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {supplier.certifications.map((cert, i) => (
                <span key={i} className="rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
                  🏆 {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {(supplier.logisticsNotes || supplier.pricingNotes) && (
          <div className="mt-6 space-y-3">
            {supplier.logisticsNotes && (
              <div className="rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="text-sm font-semibold text-blue-900 mb-1">📦 Logistics</div>
                <p className="text-sm text-blue-800">{supplier.logisticsNotes}</p>
              </div>
            )}
            {supplier.pricingNotes && (
              <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-900 mb-1">💰 Pricing</div>
                <p className="text-sm text-emerald-800">{supplier.pricingNotes}</p>
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
        <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] p-6">
          <h3 className={`${hand.className} text-2xl text-slate-900 mb-4`}>Categories</h3>
          <div className="space-y-2">
            {supplier.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lot Sizes */}
      {supplier.lotSizes && supplier.lotSizes.length > 0 && (
        <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] p-6">
          <h3 className={`${hand.className} text-2xl text-slate-900 mb-4`}>Lot Sizes</h3>
          <div className="space-y-2">
            {supplier.lotSizes.map((lotSize) => (
              <div
                key={lotSize.slug}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">{lotSize.name}</span>
                <span className="text-xs text-slate-500">Available</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Card */}
      <div className="rounded-3xl border-2 border-slate-900/80 bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
        <h3 className={`${hand.className} text-2xl mb-4`}>Ready to Order?</h3>
        <p className="text-sm text-blue-100 mb-4">
          Contact {supplier.name} to discuss your wholesale needs
        </p>
        {supplier.website && (
          <a
            href={supplier.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-white px-4 py-3 text-center font-bold text-blue-600 hover:shadow-lg transition-all"
          >
            Visit Website →
          </a>
        )}
        {supplier.email && (
          <a
            href={`mailto:${supplier.email}`}
            className="mt-2 block w-full rounded-2xl border-2 border-white px-4 py-3 text-center font-bold text-white hover:bg-white/10 transition-all"
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
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-2xl">
          {i < fullStars ? '⭐' : i === fullStars && hasHalf ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}
