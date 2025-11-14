import Link from 'next/link';
import Image from 'next/image';
import { DM_Sans } from 'next/font/google';
import { api } from '@/lib/api';
import { FaqAccordion } from '@/components/faq-accordion';
import { TrendingSuppliersRail } from '@/components/trending-suppliers-rail';

const ui = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] });

export type HomepageData = Awaited<ReturnType<typeof api.home.get>>;
type SupplierSummaryList = Awaited<ReturnType<typeof api.suppliers.featured>>;
type GuideList = Awaited<ReturnType<typeof api.guides.list>>;
type CategoryList = Awaited<ReturnType<typeof api.catalog.categories>>;
type FaqList = Awaited<ReturnType<typeof api.faq.list>>;

export default async function HomePage() {
  const data = await api.home.get();
  const [leadGuide] = data.featuredGuides;

  return (
    <div className={`${ui.className} bg-slate-50 scroll-smooth`}>
      <HeroSection />

      {/* Trending rail with half-peek card */}
      <TrendingSuppliersRail suppliers={data.featuredSuppliers} />

      <ConnectByState />
      <QuickActionsBar />
      <TwoUpFeatures />
      <GuideStrip leadGuide={leadGuide} />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <MiniCards categories={data.categories} />
        <ListBusinessCta />
        <FaqSection faqs={data.faqs} />
      </div>
    </div>
  );
}

/* --------------------------- HERO --------------------------- */
function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 min-h-[500px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/mainbg.png"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 z-10">
        <div className="relative inline-block w-full">
          <h1 className="relative text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Trusted Wholesale Liquidation Suppliers Near You
          </h1>
        </div>

        <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-7 text-blue-50 sm:text-lg">
          Discover trusted wholesale suppliers offering truckloads and pallets in your area.
        </p>

        {/* Search */}
        <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-2xl">
          <div className="relative">
            <input
              type="search"
              name="search"
              placeholder="Search suppliers, categories, or keywords"
              className="h-14 w-full rounded-full border-2 border-white/30 bg-white pl-14 pr-28 text-base text-slate-900 shadow-lg placeholder:text-slate-500 focus:border-white focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-500 text-xl">🔍</span>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/30"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* --------------------------- QUICK ACTIONS ------------------------ */
function QuickActionsBar() {
  const items = [
    { href: '/suppliers', label: 'Find vetted suppliers' },
    { href: '/suppliers?search=review', label: 'Read reviews' },
    { href: '/guides/how-to-vet-liquidation-suppliers-2025', label: 'Buyer guides' },
  ];
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:px-8">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            {it.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------- CONNECT BY STATE -------------------- */
function ConnectByState() {
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'];
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h3 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Connect with Verified Suppliers</h3>
      <p className="mx-auto mt-4 max-w-xl text-base text-slate-700">
        Search for overstock, returns and liquidations by the pallet or truckload.
      </p>
      <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-sm">
        <div className="relative">
          <select
            name="state"
            defaultValue=""
            className="h-14 w-full appearance-none rounded-xl border border-slate-300 bg-white px-5 pr-12 text-base text-slate-900 shadow focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <option value="" disabled>Shop by State</option>
            {states.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
        </div>
      </form>
    </section>
  );
}

/* --------------------------- TWO IMAGE FEATURES ------------------------------ */
function TwoUpFeatures() {
  return (
    <section className="mx-auto max-w-[95vw] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 py-20 md:grid-cols-2">
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
          <div className="relative h-72 w-full overflow-hidden">
            <Image
              src="/feature-desk.png"
              alt="Liquidation warehouse desk"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-slate-900 leading-snug sm:text-3xl">
              Buy Truckload Liquidation Direct from Vetted Liquidators Near You
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Source by the pallet or truckload for your bin stores, discount store, auction house and more! Buy
              truckloads of returns, overstock and liquidations directly from Amazon, Target, Walmart, Home Depot and more.
            </p>
            <Link
              href="/suppliers"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              Browse
            </Link>
          </div>
        </article>

        <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-slate-900 leading-snug sm:text-3xl">Read real reviews from buyers</h3>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Find liquidation pallets, wholesale inventory, and merchandise for live auctions from trusted suppliers.
            </p>
            <Link
              href="/suppliers?search=review"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              Browse
            </Link>
          </div>
          <div className="relative min-h-[18rem] w-full flex-1 overflow-hidden">
            <Image
              src="/feature-family.png"
              alt="Family business liquidation"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </article>
      </div>
    </section>
  );
}

/* ------------------------- GUIDE STRIP ------------------------- */
function GuideStrip({ leadGuide }: { leadGuide?: GuideList[number] }) {
  const href = leadGuide ? `/guides/${leadGuide.slug}` : '/guides/how-to-vet-liquidation-suppliers-2025';
  const title = leadGuide?.title ?? 'How to find a legitimate liquidation supplier in 2025';
  return (
    <section className="relative my-12 overflow-hidden bg-slate-900 text-center text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500 blur-3xl" />
      </div>
      <div className="relative px-4 py-16">
        <h3 className="mx-auto max-w-3xl text-3xl font-semibold leading-snug sm:text-4xl">{title}</h3>
        <Link
          href={href}
          className="mt-8 inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
        >
          Read Article
        </Link>
      </div>
    </section>
  );
}

/* ----------------------------- MINI CARDS ROW -------------------------------- */
function MiniCards({ categories }: { categories: CategoryList }) {
  const items = (categories ?? []).slice(0, 5);
  if (!items.length) return null;

  return (
    <section className="py-12">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="relative mb-4 flex h-24 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-xl">→</span>
                <div className="text-left">
                  <span className="block text-base font-bold text-slate-900">Select</span>
                  <span className="block text-sm text-slate-600">liquidation</span>
                </div>
              </div>
            </div>
            <div className="text-base font-semibold leading-tight text-slate-900 group-hover:text-blue-600">
              {c.name}
            </div>
            <div className="mt-2 text-sm text-slate-600">
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
    <section className="my-20">
      <div className="relative mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white shadow-lg transition hover:shadow-xl sm:p-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        </div>
        <div className="relative">
          <h3 className="text-4xl font-bold sm:text-5xl">List your Business</h3>
          <p className="mt-4 text-xl leading-8 sm:text-2xl">
            Get seen by 1M people looking for merchandise from top suppliers.
          </p>
          <Link
            href="/list-your-business"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
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
    <section className="py-16">
      <h2 className="mb-10 text-center text-4xl font-bold text-slate-900 sm:text-5xl">FAQ</h2>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
