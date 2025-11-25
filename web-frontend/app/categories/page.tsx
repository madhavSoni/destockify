import Link from 'next/link';
import Image from 'next/image';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function CategoriesPage() {
  const categories = await api.catalog.categories();

  // simple emoji placeholders (swap to icons later)
  const iconFor = (slug: string) => {
    if (/\b(appar|clothes|fashion|apparel)\b/i.test(slug)) return '🧥';
    if (/\b(elec|tech|computer|phone)\b/i.test(slug)) return '💻';
    if (/\btools?|hardware\b/i.test(slug)) return '🛠️';
    if (/\bhome|house|furni\b/i.test(slug)) return '🏠';
    if (/\btoys?\b/i.test(slug)) return '🧸';
    if (/\bgrocery|food\b/i.test(slug)) return '🛒';
    return '🏷️';
  };

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Heading */}
        <h1 className={`${hand.className} text-center text-3xl sm:text-4xl text-slate-900`}>
          Buy Wholesale Merchandise by the Category
        </h1>
        <p className={`${hand.className} mt-2 text-center text-base text-slate-700`}>
          Find Liquidation Pallets and Truckloads across multiple categories
        </p>

        {/* top pill button */}
        <div className="mt-4 flex justify-center">
          <Link
            href="/suppliers"
            className={`${hand.className} inline-flex items-center justify-center rounded-[12px] bg-[#2f6feb] px-4 py-2 text-white text-sm shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-1px] transition`}
          >
            Marketplace
          </Link>
        </div>

        {/* Grid of “hand-drawn” cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="group relative flex h-28 items-center justify-center rounded-[18px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:-translate-y-[2px]"
              aria-label={c.name}
              title={c.name}
            >
              <span className="text-4xl select-none">{iconFor(c.slug + c.name)}</span>
              <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-slate-900/5" />
              <span className="sr-only">{c.name}</span>
            </Link>
          ))}
        </div>

        {/* --- Added News + FAQ section --- */}
        <section className="mt-16">
          {/* 2-up “News” style features */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left card */}
            <article className="group overflow-hidden rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-3px] transition">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/feature-desk.png"
                  alt="Wholesale electronics workspace"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900`}>
                  Buy Wholesale Electronics From Trusted Suppliers
                </h3>
                <p className={`${hand.className} mt-3 text-base leading-7 text-slate-700`}>
                  The largest directory for truckload liquidation in the United States,
                  featuring returns, overstock, general merchandise, and a wide variety
                  of other categories.
                </p>
                <Link
                  href="/suppliers?category=electronics"
                  className={`${hand.className} mt-5 inline-flex items-center justify-center rounded-[12px] bg-[#2f6feb] px-4 py-2 text-white text-sm shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-1px] transition`}
                >
                  Browse
                </Link>
              </div>
            </article>

            {/* Right card */}
            <article className="group overflow-hidden rounded-3xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] flex flex-col hover:translate-y-[-3px] transition">
              <div className="p-6">
                <h3 className={`${hand.className} text-2xl sm:text-3xl text-slate-900`}>
                  Find Wholesale Clothing and Apparel Suppliers Near You
                </h3>
                <p className={`${hand.className} mt-3 text-base leading-7 text-slate-700`}>
                  Buy wholesale clothing, shoes, and purses in bulk. Find wholesale men’s,
                  women’s, and kids’ apparel from suppliers near you.
                </p>
                <Link
                  href="/suppliers?category=clothing"
                  className={`${hand.className} mt-5 inline-flex items-center justify-center rounded-[12px] bg-[#2f6feb] px-4 py-2 text-white text-sm shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-1px] transition`}
                >
                  Browse
                </Link>
              </div>
              <div className="relative flex-1 min-h-[16rem] w-full overflow-hidden">
                <Image
                  src="/feature-family.png"
                  alt="Family sourcing pallets"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </article>
          </div>

          {/* FAQ */}
          <div className="mt-16 text-center">
            <h2 className={`${hand.className} text-3xl text-slate-900`}>FAQ</h2>
            <div className="mx-auto mt-6 max-w-2xl space-y-4 text-left">
              <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div>
                    <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                      How often is supplier data refreshed?
                    </div>
                    <div className="text-sm uppercase tracking-wide text-slate-400">Account & Alerts</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
                  Supplier profiles, ratings, and lot availability are refreshed weekly by Trust Pallet analysts. Subscribers receive alerts when new categories or truckload programs become available.
                </div>
              </details>

              <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div>
                    <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                      How are Trust Pallet suppliers vetted?
                    </div>
                    <div className="text-sm uppercase tracking-wide text-slate-400">Getting Started</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
                  Every supplier completes a multi-step verification including proof of retailer contracts or sourcing rights, warehouse walkthrough, insurance and compliance review, plus buyer reference checks.
                </div>
              </details>

              <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div>
                    <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                      Do you support international buyers?
                    </div>
                    <div className="text-sm uppercase tracking-wide text-slate-400">International</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
                  Absolutely. Many suppliers offer bilingual account reps, export documentation, and container consolidation. Filter by "Export Friendly" badge to find partners experienced with overseas shipping.
                </div>
              </details>

              <details className="group rounded-[14px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div>
                    <div className={`${hand.className} text-base font-semibold text-xl text-slate-900`}>
                      Can Trust Pallet help me negotiate freight?
                    </div>
                    <div className="text-sm uppercase tracking-wide text-slate-400">Logistics & Freight</div>
                  </div>
                  <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className={`${hand.className} mt-4 px-5 pb-5 text-base text-slate-700 leading-relaxed`}>
                  Yes. Our sourcing advisors maintain a roster of vetted LTL and full truckload carriers familiar with liquidation hubs. Request a freight consult and we will benchmark rates for your lane.
                </div>
              </details>
            </div>
          </div>

          {/* Bottom grey news block
          <div className="mt-12 h-72 w-full rounded-3xl bg-slate-100" /> */}
        </section>
      </div>
    </div>
  );
}
