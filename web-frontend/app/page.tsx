import Link from 'next/link';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { ReviewCard } from '@/components/review-card';
import { GuideCard } from '@/components/guide-card';
import { FaqAccordion } from '@/components/faq-accordion';
import { StatsBar } from '@/components/stats-bar';
import { SectionHeading } from '@/components/section-heading';

export type HomepageData = Awaited<ReturnType<typeof api.home.get>>;
type SupplierSummaryList = Awaited<ReturnType<typeof api.suppliers.featured>>;
type ReviewHighlightList = HomepageData['spotlightReviews'];
type GuideList = Awaited<ReturnType<typeof api.guides.list>>;
type CategoryList = Awaited<ReturnType<typeof api.catalog.categories>>;
type RegionList = Awaited<ReturnType<typeof api.catalog.regions>>;
type LotSizeList = Awaited<ReturnType<typeof api.catalog.lotSizes>>;
type FaqList = Awaited<ReturnType<typeof api.faq.list>>;

export default async function HomePage() {
  const data = await api.home.get();
  const [leadGuide, ...supportingGuides] = data.featuredGuides;

  return (
    <div className="bg-slate-50">
      <HeroSection stats={data.stats} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8">
        <FeaturedSuppliers suppliers={data.featuredSuppliers} />
        <ReviewSpotlight reviews={data.spotlightReviews} />
        <GuidesSection leadGuide={leadGuide} guides={supportingGuides} />
        <CategoryShowcase categories={data.categories} />
        <RegionSpotlight regions={data.regions} lotSizes={data.lotSizes} />
        <ListBusinessCta />
        <FaqSection faqs={data.faqs} />
      </div>
    </div>
  );
}

function HeroSection({
  stats,
}: {
  stats: {
    suppliers: number;
    reviews: number;
    guides: number;
    categories: number;
  };
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/40 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Verified supplier intelligence
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Find trusted wholesale liquidation suppliers near you
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            Destockify highlights vetted liquidation marketplaces, truckload programs, and pallet sellers with verified
            buyer reviews, manifest transparency, and real-world guidance from high-volume resellers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Find verified suppliers →
            </Link>
            <Link
              href="/guides/how-to-vet-liquidation-suppliers-2025"
              className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2 text-sm font-semibold text-white ring-1 ring-white/50 transition hover:bg-white/10"
            >
              Avoid liquidation scams →
            </Link>
            <Link
              href="/suppliers?search=review"
              className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2 text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
            >
              Read real buyer reviews
            </Link>
          </div>
          <form action="/suppliers" method="get" className="relative mt-6 max-w-xl overflow-hidden rounded-full bg-white/10">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-200">
              <span aria-hidden>🔍</span>
            </div>
            <input
              type="search"
              name="search"
              placeholder="Search by supplier, category, or keyword"
              className="h-12 w-full rounded-full border border-white/10 bg-transparent pl-11 pr-16 text-sm text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Search
            </button>
          </form>
        </div>
        <div className="flex-1 lg:max-w-sm">
          <StatsBar
            stats={[
              { label: 'Vetted suppliers in our network', value: stats.suppliers.toLocaleString() },
              { label: 'Verified buyer reviews', value: stats.reviews.toLocaleString() },
              { label: 'Live categories tracked', value: stats.categories.toLocaleString() },
              { label: 'Guides & playbooks', value: stats.guides.toLocaleString() },
            ]}
          />
          <div className="mt-4 rounded-3xl bg-white/5 px-5 py-4 text-xs text-slate-200 ring-1 ring-white/10">
            Destockify analysts confirm sourcing rights, warehouse operations, insurance, and buyer references for every
            supplier before publication.
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSuppliers({ suppliers }: { suppliers: SupplierSummaryList }) {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Marketplace"
        title="Trending liquidation suppliers buyers trust right now"
        description="These supplier programs consistently deliver dependable manifests, responsive account teams, and strong landed-cost economics across pallets and truckloads."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.slice(0, 6).map((supplier) => (
          <SupplierCard key={supplier.slug} supplier={supplier} />
        ))}
      </div>
      <div className="flex items-center justify-center">
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Browse the full supplier directory →
        </Link>
      </div>
    </section>
  );
}

function ReviewSpotlight({ reviews }: { reviews: ReviewHighlightList }) {
  if (!reviews.length) {
    return null;
  }

  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Buyer Intelligence"
        title="Real reviews from liquidation buyers who manage weekly freight"
        description="Understand how manifests matched reality, how quickly trucks were ready, and the level of support buyers received when issues surfaced."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={`${review.supplier.slug}-${review.title}`} review={review} />
        ))}
      </div>
    </section>
  );
}

function GuidesSection({ leadGuide, guides }: { leadGuide?: GuideList[number]; guides: GuideList }) {
  if (!leadGuide && (!guides || guides.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Guides"
        title="Playbooks from Destockify sourcing strategists"
        description="Step-by-step frameworks to vet suppliers, staff your warehouse, and model all-in landed costs before you wire funds."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {leadGuide && (
          <div className="rounded-3xl bg-slate-900 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Featured guide</p>
            <h3 className="mt-4 text-3xl font-semibold">{leadGuide.title}</h3>
            <p className="mt-3 text-sm text-slate-200">{leadGuide.excerpt ?? leadGuide.intro}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>✔️ Eight-point supplier verification checklist</li>
              <li>✔️ Chain of custody and manifest validation templates</li>
              <li>✔️ Questions to ask before wiring funds or booking freight</li>
            </ul>
            <Link
              href={`/guides/${leadGuide.slug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Read the full guide →
            </Link>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {guides.slice(0, 3).map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ categories }: { categories: CategoryList }) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Browse by Category"
        title="Liquidation channels for every merchandising strategy"
        description="Filter the directory by the commodity types you stock today or the categories you want to test next quarter."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.slice(0, 9).map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{category.name}</div>
              <h3 className="text-lg font-semibold text-slate-900">{category.headline ?? category.name}</h3>
              {category.description && <p className="text-sm text-slate-600">{category.description}</p>}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm font-semibold text-slate-800">
              {category.supplierCount.toLocaleString()} suppliers
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          View all liquidation categories →
        </Link>
      </div>
    </section>
  );
}

function RegionSpotlight({ regions, lotSizes }: { regions: RegionList; lotSizes: LotSizeList }) {
  if (!regions.length) {
    return null;
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <SectionHeading
          eyebrow="Locations"
          title="Where liquidation freight is moving fastest"
          description="Tap into high-volume hubs with bonded storage, inspection programs, and same-day pickup windows."
        />
        <div className="space-y-5">
          {regions.slice(0, 4).map((region) => (
            <div key={region.slug} className="rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{region.name}</h4>
                  <p className="text-sm text-slate-500">{region.headline}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {region.supplierCount} suppliers
                </span>
              </div>
              {region.marketStats && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                  {'averageFreight' in region.marketStats && region.marketStats.averageFreight && (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Avg freight: {String(region.marketStats.averageFreight)}
                    </span>
                  )}
                  {'topPorts' in region.marketStats && Array.isArray(region.marketStats.topPorts) && (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Ports: {(region.marketStats.topPorts as string[]).join(', ')}
                    </span>
                  )}
                </div>
              )}
              {region.description && <p className="mt-3 text-sm text-slate-600">{region.description}</p>}
            </div>
          ))}
        </div>
        <Link
          href="/locations"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Explore all regions →
        </Link>
      </div>
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Lot sizes</p>
        <h3 className="text-2xl font-semibold">Build a buying plan by lot size</h3>
        <p className="text-sm text-slate-200">
          From curated micro-lots for live-sellers to recurring full truckloads, Destockify highlights which suppliers
          excel at each format.
        </p>
        <ul className="space-y-4 text-sm text-slate-100">
          {lotSizes.slice(0, 5).map((lot) => (
            <li key={lot.slug} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">{lot.name}</div>
              <div className="text-xs text-slate-200">{lot.headline ?? lot.description}</div>
              <div className="mt-2 text-xs text-slate-300">
                {lot.minUnits ? `${lot.minUnits.toLocaleString()}+ units` : 'Variable'} · {lot.supplierCount} suppliers
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/lot-sizes"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          Compare lot sizes →
        </Link>
      </div>
    </section>
  );
}

function ListBusinessCta() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-8 text-white shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">For suppliers</p>
          <h3 className="text-3xl font-semibold">List your liquidation business on Destockify</h3>
          <p className="text-sm text-emerald-50">
            Gain access to high-intent buyers sourcing pallets, half-truckloads, and contract truck programs. Showcase
            verified manifests, load-out SLAs, and inspection options.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/list-your-business"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Apply to list your business →
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/20"
          >
            Talk with a marketplace advisor
          </Link>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }: { faqs: FaqList }) {
  if (!faqs.length) {
    return null;
  }

  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="FAQ"
        title="Answers to the liquidation questions buyers ask the most"
        description="Everything from supplier vetting to freight, payments, and international buyers."
      />
      <FaqAccordion faqs={faqs} />
      <div className="rounded-3xl bg-slate-900 p-6 text-sm text-white">
        Still have a question? Email <a href="mailto:hello@destockify.com" className="underline">hello@destockify.com</a>{' '}
        and a Destockify sourcing advisor will reach out within one business day.
      </div>
    </section>
  );
}

