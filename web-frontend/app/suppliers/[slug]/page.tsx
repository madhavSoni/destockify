import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { ReviewCard } from '@/components/review-card';
import { SectionHeading } from '@/components/section-heading';

export default async function SupplierDetailPage({ params }: { params: { slug: string } }) {
  const detail = await api.suppliers.get(params.slug).catch(() => null);

  if (!detail) {
    notFound();
  }

  const { supplier, reviewSummary, recentReviews, testimonials, resources, relatedSuppliers } = detail;

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SupplierHero supplier={supplier} reviewSummary={reviewSummary} />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <SupplierOverview supplier={supplier} reviewSummary={reviewSummary} resources={resources} />
          <SupplierSidebar supplier={supplier} />
        </div>

        {recentReviews.length > 0 && (
          <section className="mt-16 space-y-8">
            <SectionHeading
              eyebrow="Recent Reviews"
              title="What buyers are saying about this supplier"
              description="Direct quotes from buyers sourcing pallets, half truckloads, and recurring contract programs."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {recentReviews.map((review, index) => (
                <ReviewCard
                  key={`${supplier.slug}-review-${index}`}
                  review={{
                    title: review.title,
                    author: review.author,
                    company: review.company,
                    ratingOverall: review.ratingOverall,
                    highlights: review.highlights,
                    body: review.body,
                    publishedAt: review.publishedAt,
                    supplier: {
                      slug: supplier.slug,
                      name: supplier.name,
                      heroImage: supplier.heroImage,
                      logoImage: supplier.logoImage,
                      badges: supplier.badges,
                    },
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {testimonials.length > 0 && (
          <section className="mt-16 space-y-6">
            <SectionHeading
              eyebrow="Destockify Perspective"
              title="What our sourcing advisors highlight"
              description="Pull quotes from Destockify analysts and marketplace advisors servicing buyer accounts across North America."
            />
            <div className="grid gap-6 lg:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <blockquote
                  key={`${testimonial.author}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-slate-700">“{testimonial.quote}”</p>
                  <footer className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                    {testimonial.author}
                    {testimonial.role ? ` · ${testimonial.role}` : ''}
                    {testimonial.company ? ` (${testimonial.company})` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {relatedSuppliers.length > 0 && (
          <section className="mt-16 space-y-6">
            <SectionHeading
              eyebrow="Related Suppliers"
              title="Buyers also considered these partners"
              description="Comparable sourcing programs by category, region, or lot size."
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedSuppliers.map((related) => (
                <SupplierCard key={related.slug} supplier={related} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SupplierHero({
  supplier,
  reviewSummary,
}: {
  supplier: SupplierDetail['supplier'];
  reviewSummary: SupplierDetail['reviewSummary'];
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat opacity-15 sm:block" style={{ backgroundImage: supplier.heroImage ? `url(${supplier.heroImage})` : 'none' }} />
      <div className="relative grid gap-8 p-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Link href="/suppliers" className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 hover:text-slate-800">
            ← Supplier directory
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{supplier.name}</h1>
          {supplier.shortDescription && <p className="text-sm text-slate-600 sm:text-base">{supplier.shortDescription}</p>}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
            {reviewSummary.average && reviewSummary.count ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                ★ {reviewSummary.average.toFixed(1)} ({reviewSummary.count} reviews)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                New listing
              </span>
            )}
            {supplier.trustScore != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                Trust score {supplier.trustScore}
              </span>
            )}
            {supplier.region && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                {supplier.region.name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            {supplier.badges?.map((badge) => (
              <span key={badge} className="rounded-full bg-slate-100 px-3 py-1">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Contact</h2>
          <div className="space-y-3 text-sm text-slate-700">
            {supplier.website && (
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="block hover:text-slate-900 underline-offset-4 hover:underline">
                Supplier website
              </a>
            )}
            {supplier.email && (
              <a href={`mailto:${supplier.email}`} className="block hover:text-slate-900 underline-offset-4 hover:underline">
                {supplier.email}
              </a>
            )}
            {supplier.phone && <p>{supplier.phone}</p>}
            {supplier.minimumOrder && <p>Minimum order: {supplier.minimumOrder}</p>}
            {supplier.leadTime && <p>Lead time: {supplier.leadTime}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={supplier.email ? `mailto:${supplier.email}` : '#'}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Request availability
            </a>
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View manifest samples
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type SupplierDetail = Awaited<ReturnType<typeof api.suppliers.get>>;

function SupplierOverview({
  supplier,
  reviewSummary,
  resources,
}: {
  supplier: SupplierDetail['supplier'];
  reviewSummary: SupplierDetail['reviewSummary'];
  resources: SupplierDetail['resources'];
}) {
  return (
    <section className="space-y-10">
      {supplier.description && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{supplier.description}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Specialties</h3>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
            {supplier.specialties?.map((item) => (
              <li key={item} className="rounded-full bg-slate-100 px-3 py-1">
                {item}
              </li>
            )) || <li>No specialties listed.</li>}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Certifications</h3>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
            {supplier.certifications?.map((item) => (
              <li key={item} className="rounded-full bg-slate-100 px-3 py-1">
                {item}
              </li>
            )) || <li>No certifications listed.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Lot sizes & categories</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Categories</h4>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              {supplier.categories.map((category) => (
                <li key={category.slug}>{category.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Lot sizes</h4>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              {supplier.lotSizes.map((lot) => (
                <li key={lot.slug}>{lot.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {(supplier.logisticsNotes || supplier.pricingNotes) && (
        <div className="grid gap-6 md:grid-cols-2">
          {supplier.logisticsNotes && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Logistics Notes</h3>
              <p className="mt-3 text-sm text-slate-600">{supplier.logisticsNotes}</p>
            </div>
          )}
          {supplier.pricingNotes && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pricing Notes</h3>
              <p className="mt-3 text-sm text-slate-600">{supplier.pricingNotes}</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Review Breakdown</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-4xl font-semibold text-slate-900">
              {reviewSummary.average ? reviewSummary.average.toFixed(2) : '—'}
            </div>
            <p className="text-sm text-slate-600">
              Average rating across {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}
            </p>
            <dl className="mt-4 space-y-2 text-sm text-slate-600">
              <ReviewAspect label="Manifest accuracy" value={reviewSummary.aspects.accuracy} />
              <ReviewAspect label="Logistics experience" value={reviewSummary.aspects.logistics} />
              <ReviewAspect label="Value for money" value={reviewSummary.aspects.value} />
              <ReviewAspect label="Communication" value={reviewSummary.aspects.communication} />
            </dl>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <ReviewDistribution label="5 stars" value={reviewSummary.distribution.fiveStar} total={reviewSummary.count} />
            <ReviewDistribution label="4 stars" value={reviewSummary.distribution.fourStar} total={reviewSummary.count} />
            <ReviewDistribution label="3 stars" value={reviewSummary.distribution.threeStar} total={reviewSummary.count} />
            <ReviewDistribution label="2 stars" value={reviewSummary.distribution.twoStar} total={reviewSummary.count} />
            <ReviewDistribution label="1 star" value={reviewSummary.distribution.oneStar} total={reviewSummary.count} />
          </div>
        </div>
      </div>

      {resources.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resources</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {resources.map((resource) => (
              <li key={`${resource.title}-${resource.order}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{resource.title}</div>
                  {resource.description && <div className="text-xs text-slate-500">{resource.description}</div>}
                </div>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SupplierSidebar({ supplier }: { supplier: SupplierDetail['supplier'] }) {
  return (
    <aside className="space-y-6">
      {supplier.region && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Region Insight</h3>
          <p className="mt-2 text-sm font-semibold text-slate-900">{supplier.region.name}</p>
          {supplier.region.headline && <p className="mt-2 text-sm text-slate-600">{supplier.region.headline}</p>}
          {supplier.region.description && <p className="mt-4 text-xs text-slate-500">{supplier.region.description}</p>}
        </div>
      )}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Need a second opinion?</h3>
        <p className="mt-3 text-sm text-slate-600">
          Destockify sourcing advisors can compare suppliers, review manifests, and benchmark freight lanes before you
          commit.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Talk to an advisor
        </Link>
      </div>
    </aside>
  );
}

function ReviewAspect({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-semibold text-slate-900">{value ? value.toFixed(1) : '—'}</span>
    </div>
  );
}

function ReviewDistribution({ label, value, total }: { label: string; value: number; total: number }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
