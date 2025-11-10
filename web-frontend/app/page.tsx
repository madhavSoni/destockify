import Link from 'next/link';
import Image from 'next/image';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';
import { FaqAccordion } from '@/components/faq-accordion';
// import { SupplierCard } from '@/components/supplier-card';
// import { ReviewCard } from '@/components/review-card';
// import { GuideCard } from '@/components/guide-card';
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
    <div className="bg-slate-50 scroll-smooth">
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
    <section className="relative border-b border-slate-200 bg-gradient-to-br from-[#cfe0ff] via-[#dbe9ff] to-[#cfe0ff] overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(0 0 0) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-12 lg:py-14 sm:px-6 lg:px-8">
        <h1
          className={`${hand.className} text-center text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-tight text-slate-900 animate-in fade-in duration-700`}
        >
          Find Trusted Wholesale Liquidation Suppliers Near You
        </h1>

        <p className="mt-4 text-center text-sm sm:text-base md:text-lg leading-relaxed text-slate-700 max-w-3xl mx-auto animate-in fade-in duration-700 delay-150">
          Discover Trusted Wholesale Suppliers offering truckloads and pallets in your area
        </p>

        {/* pill search bar */}
        <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-2xl animate-in fade-in duration-700 delay-300">
          <div className="relative group">
            <input
              type="search"
              name="search"
              placeholder="Search suppliers, categories, or keywords"
              className="h-14 w-full rounded-full border-2 border-slate-300 bg-white px-14 text-base text-slate-900 placeholder:text-slate-400 shadow-lg shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-400 text-xl">
              🔍
            </span>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
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
    <section className="bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(255 255 255) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      <div className="relative mx-auto flex w-full flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-16 lg:px-24">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`${hand.className} inline-flex items-center justify-center rounded-2xl bg-slate-800 px-8 py-5 text-xl font-semibold text-white ring-2 ring-white/10 hover:bg-slate-700 hover:ring-white/20 hover:scale-105 hover:-translate-y-1 active:scale-100 flex-1 sm:flex-none transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
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
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
      <h2 className={`${hand.className} text-center text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-3`}>
        Trending Wholesale Suppliers Near You
      </h2>

      <div className="mt-4 relative">
        <p className="text-center text-sm sm:text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
          Find wholesale lots of returns, overstock and mixed merchandise by the pallet or truckload.
        </p>
        
        <a
          href="/suppliers"
          className={`${hand.className} hidden sm:inline-flex items-center gap-2 text-base text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 absolute right-0 top-1/2 -translate-y-1/2 transition-colors duration-200`}
        >
          Explore all →
        </a>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {suppliers.slice(0, 4).map((s) => (
          <a
            key={s.slug}
            href={`/suppliers/${s.slug}`}
            className="group block overflow-hidden rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-4px] hover:shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={s.name}
          >
            {/* top: logo area */}
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-slate-100 group-hover:to-slate-50 transition-colors duration-300">
              {/* if you have a logo url on supplier, swap src to s.logo */}
              <div className="h-20 w-32 rounded-xl bg-white ring-2 ring-slate-200 flex items-center justify-center text-slate-700 text-base font-semibold shadow-sm group-hover:ring-slate-300 group-hover:shadow-md transition-all duration-300">
                {s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name}
              </div>

              {/* corner badges like "Pallets", "Truckloads" */}
              <div className="absolute right-3 top-3 flex gap-2">
                {((s.lotSizes?.map((ls) => ls.name) ?? ['Pallets']).slice(0, 2)).map((b: string) => (
                  <span
                    key={b}
                    className={`${hand.className} rounded-full bg-amber-100 px-3 py-1 text-xs text-slate-800 ring-2 ring-amber-300 shadow-sm group-hover:shadow-md transition-shadow duration-300`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* bottom: label strip like the mock */}
            <div className="border-t-2 border-slate-900/80 bg-white p-4">
              <div className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">{s.name}</div>
              <div className={`${hand.className} mt-1.5 text-sm leading-5 text-slate-700`}>
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
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h3 className={`${hand.className} text-3xl sm:text-4xl text-slate-900 tracking-wide`}>
        Connect with Verified Liquidation Suppliers
        <br />
        <span className="block mt-2">in The United States</span>
      </h3>

      <p className={`${hand.className} mx-auto mt-5 max-w-xl text-base sm:text-lg leading-7 text-slate-800`}>
        Search for Overstock, Returns and Liquidation merchandise
        <br />by the Pallet or Truckload.
      </p>

      <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-sm">
        <div className="relative">
          <select
            name="state"
            defaultValue=""
            className={`${hand.className} h-14 w-full appearance-none rounded-2xl border-2 border-slate-900/80 bg-white px-5 pr-12 text-base text-slate-900 shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer`}
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
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 text-lg">▾</span>
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
      className={`${hand.className} inline-flex items-center justify-center rounded-2xl bg-[#2f6feb] px-6 py-3 text-lg text-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
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
      className={`${hand.className} inline-flex items-center justify-center rounded-2xl border-2 border-white px-6 py-3 text-lg text-white shadow-[4px_5px_0_0_rgba(0,0,0,0.45)] ring-2 ring-slate-900/40 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(0,0,0,0.45)] hover:bg-white/10 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
    >
      {children}
    </Link>
  );
}

/* --------------------------- TWO IMAGE FEATURES ------------------------------ */
function TwoUpFeatures() {
  return (
    <section className="mx-auto max-w-[95vw] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 py-20 md:grid-cols-2">
      {/* LEFT CARD — image on top, text below */}
      <article className="group overflow-hidden rounded-3xl border-2 border-slate-900/80 bg-white shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-4px] hover:shadow-[7px_8px_0_0_rgba(2,6,23,0.85)] transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src="/feature-desk.png"
            alt="Liquidation warehouse desk"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-7">
          <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900 leading-snug`}>
            Buy Truckload Liquidation Direct from
            <br /> Vetted Liquidators Near You
          </h3>
          <p className={`${hand.className} mt-4 text-base leading-7 text-slate-700`}>
            Source by the pallet or truckload for your bin stores, discount store, auction house and more! Buy
            Truckloads of returns, overstock and liquidations directly from Amazon, Target, Walmart, Home Depot and more!
          </p>
          <HandPrimaryButton href="/suppliers" className="mt-6">Browse</HandPrimaryButton>
        </div>
      </article>

      {/* RIGHT CARD — text on top, image on bottom (alternating) */}
      <article className="group overflow-hidden rounded-3xl border-2 border-slate-900/80 bg-white shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] flex flex-col hover:translate-y-[-4px] hover:shadow-[7px_8px_0_0_rgba(2,6,23,0.85)] transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
        <div className="p-7">
          <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900 leading-snug`}>Read real reviews from buyers</h3>
          <p className={`${hand.className} mt-4 text-base leading-7 text-slate-700`}>
            Find Liquidation Pallets, Wholesale Inventory, and Merchandise for Whatnot Reselling and Live Auctions from
            Trusted Suppliers to Enhance Your Business
          </p>
          <HandPrimaryButton href="/suppliers?search=review" className="mt-6">Browse</HandPrimaryButton>
        </div>
        <div className="relative flex-1 w-full min-h-[18rem] overflow-hidden">
          <Image
            src="/feature-family.png"
            alt="Family business liquidation"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
    <section className="relative overflow-hidden bg-gradient-to-r from-[#4b4b4b] via-[#3b3b3b] to-[#4b4b4b] text-center text-white my-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>
      
      <div className="relative px-4 py-16">
        <h3 className={`${hand.className} text-3xl sm:text-4xl max-w-3xl mx-auto leading-snug`}>{title}</h3>
        <HandOutlineButton href={href} className="mt-8">Read Article</HandOutlineButton>
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
            className="group relative flex flex-col items-center rounded-3xl border-2 border-slate-900/80 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] hover:from-slate-100 hover:to-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {/* Inner white logo box */}
            <div className="relative mb-4 flex h-24 w-full items-center justify-center rounded-2xl border-2 border-slate-900/80 bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
              {/* Decorative connecting lines at top */}
              <div className="absolute -top-1 left-1/2 h-2 w-[3px] -translate-x-1/2 bg-slate-900/80" />
              <div className="absolute -top-1 left-1/4 h-2 w-[3px] bg-slate-900/80" />
              <div className="absolute -top-1 right-1/4 h-2 w-[3px] bg-slate-900/80" />
              
              {/* Logo placeholder - you can replace with actual logo */}
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-xl group-hover:scale-110 transition-transform duration-300">→</span>
                <div className="text-left">
                  <span className={`${hand.className} block text-base font-black text-slate-900`}>Select</span>
                  <span className={`${hand.className} block text-sm text-slate-600`}>liquidation</span>
                </div>
              </div>
            </div>

            {/* Decorative connecting lines from logo box to text */}
            <div className="absolute left-1/2 top-24 h-4 w-[3px] -translate-x-1/2 bg-slate-900/80" />
            <div className="absolute left-1/4 top-24 h-4 w-[3px] bg-slate-900/80" />
            <div className="absolute right-1/4 top-24 h-4 w-[3px] bg-slate-900/80" />

            {/* Category text at bottom */}
            <div className={`${hand.className} mt-3 text-base leading-tight text-slate-900 group-hover:text-blue-600 transition-colors duration-200`}>
              {c.name}
            </div>
            <div className={`${hand.className} mt-2 text-sm text-slate-700`}>
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
      <div className="group mx-auto max-w-6xl rounded-3xl border-2 border-slate-900/80 bg-gradient-to-br from-[#3b3b3b] to-[#2b2b2b] p-8 text-white shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-2px] transition-all duration-300 sm:p-10 relative overflow-hidden">
        {/* Subtle shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative">
          <h3 className={`${hand.className} text-4xl sm:text-5xl`}>List your Business</h3>
          <p className={`${hand.className} mt-4 text-xl sm:text-2xl leading-8`}>
            Get seen by 1M People looking for
            <br /> Merchandise from top suppliers
          </p>

          <Link
            href="/list-your-business"
            className={`${hand.className} mt-8 inline-flex items-center justify-center rounded-2xl bg-[#2f6feb] px-8 py-4 text-xl text-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] hover:scale-105 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
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
      <h2 className={`${hand.className} mb-10 text-center text-4xl sm:text-5xl text-slate-900`}>FAQ</h2>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">
        <FaqAccordion faqs={faqs} />
      </div>
    </section>
  );
}
