import Link from 'next/link';
import Image from 'next/image';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';
// import { SupplierCard } from '@/components/supplier-card';
// import { ReviewCard } from '@/components/review-card';
// import { GuideCard } from '@/components/guide-card';
// import { FaqAccordion } from '@/components/faq-accordion';
// import { SectionHeading } from '@/components/section-heading';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

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
      <HeroSection />

      {/* HAND-DRAWN: Trending Suppliers */}
      <TrendingHandSuppliers suppliers={data.featuredSuppliers} />

      <ConnectByState />

      {/* Quick actions bar */}
      <QuickActionsBar />

      {/* Two feature blocks with images - full width */}
      <TwoUpFeatures />

      {/* Dark guide strip - full width */}
      <GuideStrip leadGuide={leadGuide} />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Compact cards row (like the 5 tiny cards) */}
        <MiniCards categories={data.categories} />

        {/* Supplier CTA (dark card) */}
        <ListBusinessCta />

        {/* FAQ (simple) */}
        <FaqSection faqs={data.faqs} />
      </div>
    </div>
  );
}

/* --------------------------- HERO (light, centered) --------------------------- */
function HeroSection() {
  return (
    <section className="border-b border-slate-200 bg-[#cfe0ff]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12 lg:py-14 sm:px-6 lg:px-8">
        <h1
          className={`${hand.className} text-center text-3xl sm:text-4xl md:text-5xl leading-snug text-slate-900`}
        >
          Find Trusted Wholesale Liquidation Suppliers Near You
        </h1>

        <p className="mt-3 text-center text-sm sm:text-base text-slate-700">
          Discover Trusted Wholesale Suppliers offering truckloads and pallets in your area
        </p>

        {/* pill search bar */}
        <form action="/suppliers" method="get" className="mx-auto mt-6 max-w-xl">
          <div className="relative">
            <input
              type="search"
              name="search"
              placeholder="Search suppliers, categories, or keywords"
              className="h-11 w-full rounded-full border border-slate-300 bg-white px-12 text-sm text-slate-900 placeholder:text-slate-400 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-slate-600"
            />
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              🔍
            </span>
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* --------------------------- QUICK ACTIONS (dark) ---------------------------- */
function QuickActionsBar() {
  const items = [
    { href: '/suppliers', label: 'Find Vetted Suppliers' },
    { href: '/suppliers?search=review', label: 'Read real reviews' },
    { href: '/guides/how-to-vet-liquidation-suppliers-2025', label: 'Avoid scams' },
  ];
  return (
    <section className="bg-slate-900">
      <div className="mx-auto flex w-full flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-24 lg:px-30">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`${hand.className} inline-flex items-center justify-center rounded-xl bg-slate-800 px-16 py-8 text-xl font-semibold text-white ring-1 ring-white/10 hover:bg-slate-700 flex-1 sm:flex-none`}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------- TRENDING SUPPLIERS (hand-drawn style) ---------------------- */
function TrendingHandSuppliers({ suppliers }: { suppliers: SupplierSummaryList }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <h2 className={`${hand.className} text-center text-2xl sm:text-3xl text-slate-900`}>
        Trending Wholesale Suppliers Near You
      </h2>

      <div className="mt-2 relative">
        <p className="text-center text-xs text-slate-600">
          Find wholesale lots of returns, overstock and mixed merchandise by the pallet or truckload.
        </p>
        
        <a
          href="/suppliers"
          className={`${hand.className} hidden sm:inline-flex items-center gap-2 text-sm text-slate-800 hover:underline underline-offset-4 absolute right-0 top-1/2 -translate-y-1/2`}
        >
          Explore all →
        </a>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {suppliers.slice(0, 4).map((s) => (
          <a
            key={s.slug}
            href={`/suppliers/${s.slug}`}
            className="group block overflow-hidden rounded-[18px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-2px] transition"
            aria-label={s.name}
          >
            {/* top: logo area */}
            <div className="relative flex h-36 items-center justify-center bg-slate-50">
              {/* if you have a logo url on supplier, swap src to s.logo */}
              <div className="h-16 w-28 rounded-md bg-white ring-1 ring-slate-200 flex items-center justify-center text-slate-700 text-sm font-semibold">
                {s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name}
              </div>

              {/* corner badges like "Pallets", "Truckloads" */}
              <div className="absolute right-2 top-2 flex gap-2">
                {((s.lotSizes?.map((ls) => ls.name) ?? ['Pallets']).slice(0, 2)).map((b: string) => (
                  <span
                    key={b}
                    className={`${hand.className} rounded-full bg-amber-100 px-2 py-[2px] text-[11px] text-slate-800 ring-1 ring-amber-300`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* bottom: label strip like the mock */}
            <div className="border-t-2 border-slate-900/80 bg-white p-3">
              <div className="text-sm font-semibold text-slate-900">{s.name}</div>
              <div className={`${hand.className} mt-1 text-[12px] leading-4 text-slate-700`}>
                {s.region?.name ?? s.region?.stateCode ?? 'United States'}
              </div>
            </div>
          </a>
        ))}
      </div>

      
    </section>
  );
}

/* -------------------- CONNECT BY STATE ---------------------- */
function ConnectByState() {
  const states = [
    'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA',
    'MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI',
    'SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'
  ];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 text-center">
      <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900`}>
        Connect with Verified Liquidation Suppliers
        <br />
        <span className="block">in The United States</span>
      </h3>

      <p className={`${hand.className} mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-800`}>
        Search for Overstock, Returns and Liquidation merchandise
        <br />by the Pallet or Truckload.
      </p>

      <form action="/suppliers" method="get" className="mx-auto mt-5 max-w-xs">
        <div className="relative">
          <select
            name="state"
            defaultValue=""
            className={`${hand.className} h-11 w-full appearance-none rounded-[14px] border-2 border-slate-900/80 bg-white px-4 pr-10 text-sm text-slate-900 shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] focus:outline-none`}
          >
            <option value="" disabled>
              Shop by State
            </option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-700">▾</span>
        </div>
      </form>
    </section>
  );
}

/* --------------------------- REUSABLE HAND BUTTONS ------------------------------ */
function HandPrimaryButton({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${hand.className} inline-flex items-center justify-center rounded-[12px] bg-[#2f6feb] px-5 py-2 text-base text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 transition hover:translate-y-[-1px] ${className}`}
    >
      {children}
    </Link>
  );
}

function HandOutlineButton({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${hand.className} inline-flex items-center justify-center rounded-[12px] border-2 border-white px-5 py-2 text-base text-white shadow-[3px_4px_0_0_rgba(0,0,0,0.45)] ring-2 ring-slate-900/40 transition hover:translate-y-[-1px] ${className}`}
    >
      {children}
    </Link>
  );
}

/* --------------------------- TWO IMAGE FEATURES ------------------------------ */
function TwoUpFeatures() {
  return (
    <section className="mx-auto max-w-[95vw] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 py-6 md:grid-cols-2">
      {/* LEFT CARD — image on top, text below */}
      <article className="overflow-hidden rounded-[18px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)]">
        <div className="relative h-64 w-full">
          <Image
            src="/feature-desk.png"
            alt="Liquidation warehouse desk"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-5">
          <h3 className={`${hand.className} text-2xl text-slate-900`}>
            Buy Truckload Liquidation Direct from
            <br /> Vetted Liquidators Near You
          </h3>
          <p className={`${hand.className} mt-3 text-[15px] leading-6 text-slate-800`}>
            Source by the pallet or truckload for your bin stores, discount store, auction house and more! Buy
            Truckloads of returns, overstock and liquidations directly from Amazon, Target, Walmart, Home Depot and more!
          </p>
          <HandPrimaryButton href="/suppliers" className="mt-4">Browse</HandPrimaryButton>
        </div>
      </article>

      {/* RIGHT CARD — text on top, image on bottom (alternating) */}
      <article className="overflow-hidden rounded-[18px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] flex flex-col">
        <div className="p-5">
          <h3 className={`${hand.className} text-2xl text-slate-900`}>Read real reviews from buyers</h3>
          <p className={`${hand.className} mt-3 text-[15px] leading-6 text-slate-800`}>
            Find Liquidation Pallets, Wholesale Inventory, and Merchandise for Whatnot Reselling and Live Auctions from
            Trusted Suppliers to Enhance Your Business
          </p>
          <HandPrimaryButton href="/suppliers?search=review" className="mt-4">Browse</HandPrimaryButton>
        </div>
        <div className="relative flex-1 w-full min-h-[16rem]">
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

/* ------------------------- DARK GUIDE STRIP (center) ------------------------- */
function GuideStrip({ leadGuide }: { leadGuide?: GuideList[number] }) {
  const href = leadGuide ? `/guides/${leadGuide.slug}` : '/guides/how-to-vet-liquidation-suppliers-2025';
  const title = leadGuide?.title ?? 'How to find a legitimate liquidation supplier in 2025';

  return (
    <section className="overflow-hidden bg-[#4b4b4b] text-center text-white">
      <div className="px-4 py-10">
        <h3 className={`${hand.className} text-2xl sm:text-3xl`}>{title}</h3>
        <HandOutlineButton href={href} className="mt-6">Read Article</HandOutlineButton>
      </div>
    </section>
  );
}

/* ----------------------------- MINI CARDS ROW -------------------------------- */
function MiniCards({ categories }: { categories: CategoryList }) {
  const items = (categories ?? []).slice(0, 5);
  if (!items.length) return null;

  return (
    <section className="py-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group relative flex flex-col items-center rounded-[18px] border-[3px] border-slate-900/80 bg-slate-100 p-4 text-center shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:translate-y-[-2px] hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]"
          >
            {/* Inner white logo box */}
            <div className="relative mb-3 flex h-20 w-full items-center justify-center rounded-[12px] border-[3px] border-slate-900/80 bg-white">
              {/* Decorative connecting lines at top */}
              <div className="absolute -top-1 left-1/2 h-2 w-[2px] -translate-x-1/2 bg-slate-900/80" />
              <div className="absolute -top-1 left-1/4 h-2 w-[2px] bg-slate-900/80" />
              <div className="absolute -top-1 right-1/4 h-2 w-[2px] bg-slate-900/80" />
              
              {/* Logo placeholder - you can replace with actual logo */}
              <div className="flex items-center gap-1">
                <span className="text-red-500 text-lg">→</span>
                <div className="text-left">
                  <span className={`${hand.className} block text-sm font-black text-slate-900`}>Select</span>
                  <span className={`${hand.className} block text-xs text-slate-600`}>liquidation</span>
                </div>
              </div>
            </div>

            {/* Decorative connecting lines from logo box to text */}
            <div className="absolute left-1/2 top-20 h-3 w-[2px] -translate-x-1/2 bg-slate-900/80" />
            <div className="absolute left-1/4 top-20 h-3 w-[2px] bg-slate-900/80" />
            <div className="absolute right-1/4 top-20 h-3 w-[2px] bg-slate-900/80" />

            {/* Category text at bottom */}
            <div className={`${hand.className} mt-2 text-sm leading-tight text-slate-900`}>
              {c.name}
            </div>
            <div className={`${hand.className} mt-1 text-xs text-slate-700`}>
              {c.headline ?? c.description ?? 'Popular liquidations'}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- SUPPLIER CTA ---------------------------------- */
function ListBusinessCta() {
  return (
    <section className="my-10">
      <div className="mx-auto max-w-4xl rounded-[22px] border-2 border-slate-900/80 bg-[#3b3b3b] p-6 text-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] sm:p-8">
        <h3 className={`${hand.className} text-3xl`}>List your Business</h3>
        <p className={`${hand.className} mt-3 text-lg leading-7`}>
          Get seen by 1M People looking for
          <br /> Merchandise from top suppliers
        </p>

        <Link
          href="/list-your-business"
          className={`${hand.className} mt-5 inline-flex items-center justify-center rounded-[14px] bg-[#2f6feb] px-5 py-2 text-lg text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-1px] transition`}
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ -------------------------------------- */
function FaqSection({ faqs }: { faqs: FaqList }) {
  // We'll just render the simple boxes to match the mock.
  // (If you want the real accordion wired in later, easy to swap.)
  const rows = 4;

  return (
    <section className="py-10">
      <h2 className={`${hand.className} mb-6 text-center text-3xl text-slate-900`}>FAQ</h2>

      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 sm:px-0">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full rounded-[16px] border-2 border-slate-900/70 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)]"
          />
        ))}
      </div>
    </section>
  );
}
