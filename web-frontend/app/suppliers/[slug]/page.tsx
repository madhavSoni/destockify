import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function SupplierDetailPage({ params }: { params: { slug: string } }) {
  const detail = await api.suppliers.get(params.slug).catch(() => null);
  if (!detail) notFound();

  const { supplier, reviewSummary } = detail;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 text-sm text-slate-600">
          Home › <span className="font-medium">quicklotz-reviews</span>
        </div>

        <SupplierHero supplier={supplier} reviewSummary={reviewSummary} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <SupplierOverview supplier={supplier} reviewSummary={reviewSummary} />
          <SupplierSidebar supplier={supplier} />
        </div>

        {/* Bottom CTA */}
        <section className="mt-10">
          <div className="mx-auto max-w-4xl rounded-2xl bg-[#3b3b3b] p-6 text-white sm:p-8">
            <h3 className={`${hand.className} text-3xl`}>List your Business</h3>
            <p className={`${hand.className} mt-3 text-lg leading-7`}>
              Get seen by 1M People looking for
              <br /> Merchandise from top suppliers
            </p>
            <Link
              href="/list-your-business"
              className={`${hand.className} mt-5 inline-flex items-center justify-center rounded-xl bg-[#2f6feb] px-5 py-2 text-lg text-white hover:opacity-95 transition`}
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

type SupplierDetail = Awaited<ReturnType<typeof api.suppliers.get>>;

/* --------------------------------- HERO ---------------------------------- */

function SupplierHero({
  supplier,
  reviewSummary,
}: {
  supplier: SupplierDetail['supplier'];
  reviewSummary: SupplierDetail['reviewSummary'];
}) {
  const rating = reviewSummary.average ?? null;
  const count = reviewSummary.count ?? 0;

  return (
    // lighter, no thick outline or heavy shadow
    <section className="rounded-2xl border border-slate-200 bg-white">
      {/* cover image */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-2xl">
        {supplier.heroImage ? (
          <Image src={supplier.heroImage} alt="" fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-slate-200" />
        )}
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:p-5">
        {/* left */}
        <div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="relative h-10 w-10 overflow-hidden rounded">
              {supplier.logoImage ? (
                <Image src={supplier.logoImage} alt="" fill className="object-contain" />
              ) : (
                <div className="h-full w-full bg-slate-100" />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{supplier.name}</div>
              <div className="truncate text-xs text-slate-600">
                {supplier.region?.name ?? ''}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars rating={rating} />
            <span className="text-sm text-slate-600">({count} reviews)</span>

            <div className="ml-auto flex items-center gap-2">
              <GhostPill>Share</GhostPill>
              {supplier.website && (
                <GhostPill as="a" href={supplier.website} target="_blank" rel="noopener noreferrer">
                  Website
                </GhostPill>
              )}
              {supplier.phone && <GhostPill>Call</GhostPill>}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <TabPill active>Overview</TabPill>
            <TabPill>Gallery</TabPill>
            <TabPill>Reviews</TabPill>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm leading-6 text-slate-700">
              {supplier.description ||
                'This seller offers wholesale/return loads and pallets. Details about specialties, logistics and order process appear here.'}
            </p>
          </div>
        </div>

        {/* right */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Is this your business?</div>
            <button
              type="button"
              className={`${hand.className} mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600`}
            >
              Claim This Listing
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Contact & Hours</div>
            <button
              type="button"
              className={`${hand.className} mt-3 w-full rounded-lg bg-[#2f6feb] px-3 py-2 text-sm font-semibold text-white`}
            >
              Call Now
            </button>

            <div className="mt-3 space-y-1 text-sm">
              <div className="text-slate-700">
                Open Now <span className="text-xs text-slate-500">Closes at 6:00 PM</span>
              </div>
              <HoursRow day="Monday" hours="9:00 AM - 6:00 PM" />
              <HoursRow day="Tuesday" hours="9:00 AM - 6:00 PM" />
              <HoursRow day="Wednesday" hours="9:00 AM - 6:00 PM" />
              <HoursRow day="Thursday" hours="9:00 AM - 6:00 PM" />
              <HoursRow day="Friday" hours="9:00 AM - 6:00 PM" />
              <HoursRow day="Saturday" hours="10:00 AM - 3:00 PM" />
              <HoursRow day="Sunday" hours="Closed" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- OVERVIEW -------------------------------- */

function SupplierOverview({
  supplier,
}: {
  supplier: SupplierDetail['supplier'];
  reviewSummary: SupplierDetail['reviewSummary'];
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Overview</div>
          <div className="flex items-center gap-2">
            <GhostPill>Share</GhostPill>
            {supplier.website && (
              <GhostPill as="a" href={supplier.website} target="_blank" rel="noopener noreferrer">
                Website
              </GhostPill>
            )}
            <GhostPill>Call</GhostPill>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-700">
          {supplier.shortDescription || supplier.description || 'Overview content goes here.'}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------- SIDEBAR --------------------------------- */

function SupplierSidebar({ supplier }: { supplier: SupplierDetail['supplier'] }) {
  return (
    <aside className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Business Info</div>
        <dl className="mt-2 space-y-1 text-sm text-slate-700">
          {supplier.categories.length > 0 && (
            <div>
              <dt className="inline text-slate-500">Categories: </dt>
              <dd className="inline">{supplier.categories.map((c) => c.name).join(', ')}</dd>
            </div>
          )}
          {supplier.specialties?.length ? (
            <div>
              <dt className="inline text-slate-500">Specialties: </dt>
              <dd className="inline">{supplier.specialties.join(', ')}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </aside>
  );
}

/* ------------------------------ SMALL PIECES ----------------------------- */

function RatingStars({ rating }: { rating: number | null }) {
  const full = Math.floor(rating ?? 0);
  const stars = Array.from({ length: 5 }).map((_, i) => (i < full ? '★' : '☆'));
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-600">
      {stars.map((s, i) => (
        <span key={i} className="text-base leading-none">{s}</span>
      ))}
    </div>
  );
}

function TabPill({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`${hand.className} inline-flex items-center rounded-md px-3 py-1 text-sm ${
        active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {children}
    </span>
  );
}

function GhostPill({
  as: As = 'button',
  children,
  ...props
}: any) {
  return (
    <As
      {...props}
      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      {children}
    </As>
  );
}

function HoursRow({ day, hours }: { day: string; hours: string }) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-600">
      <span className="w-28">{day}</span>
      <span>{hours}</span>
    </div>
  );
}
