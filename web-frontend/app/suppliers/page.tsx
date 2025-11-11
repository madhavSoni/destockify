import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Patrick_Hand } from 'next/font/google';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // existing filters (kept so your API keeps working)
  const filters = {
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
    category: typeof searchParams.category === 'string' ? searchParams.category : '',
    region: typeof searchParams.region === 'string' ? searchParams.region : '',
    lotSize: typeof searchParams['lot-size'] === 'string' ? searchParams['lot-size'] : '',
    cursor: typeof searchParams.cursor === 'string' ? Number(searchParams.cursor) : undefined,
  };

  const [result, categories, regions, lotSizes] = await Promise.all([
    api.suppliers.list({
      search: filters.search,
      category: filters.category || undefined,
      region: filters.region || undefined,
      lotSize: filters.lotSize || undefined,
      cursor: filters.cursor,
      limit: 18,
    }),
    api.catalog.categories(),
    api.catalog.regions(),
    api.catalog.lotSizes(),
  ]);

  const nextCursor = result.nextCursor;
  const nextParams = new URLSearchParams();
  if (filters.search) nextParams.set('search', filters.search);
  if (filters.category) nextParams.set('category', filters.category);
  if (filters.region) nextParams.set('region', filters.region);
  if (filters.lotSize) nextParams.set('lot-size', filters.lotSize);
  if (nextCursor) nextParams.set('cursor', String(nextCursor));

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero spacer (blue box) */}
        <div className="mb-6 rounded-[18px] border-2 border-slate-900/80 bg-[#cfe0ff] p-10 shadow-[3px_4px_0_0_rgba(2,6,23,0.85)]" />

        {/* Title + description */}
        <h1 className={`${hand.className} text-2xl sm:text-3xl text-slate-900`}>
          Browse Hundreds of Liquidators, Wholesalers and more Near You
        </h1>
        <p className={`${hand.className} mt-2 max-w-3xl text-[15px] leading-6 text-slate-800`}>
          The largest b2b directory of returned, overstock and brand new merchandise. Browse Hundreds of Liquidators,
          Wholesalers and more Near You. Browse Hundreds of Liquidators, Wholesalers and more Near You.
        </p>

        {/* Main grid: Filters + Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sidebar filters (hand-drawn look) */}
          <aside className="space-y-8">
            <div>
              <h3 className={`${hand.className} text-xl text-slate-900`}>Filters</h3>
            </div>

            {/* Supplier Type (visual only) */}
            <fieldset className="space-y-2">
              <legend className={`${hand.className} text-lg text-slate-900`}>Supplier Type</legend>
              <label className={`${hand.className} flex items-center gap-2 text-[15px]`}>
                <input type="radio" className="h-4 w-4 rounded border-2 border-slate-900/80" name="noop-type" />
                Liquidation
              </label>
              <label className={`${hand.className} flex items-center gap-2 text-[15px]`}>
                <input type="radio" className="h-4 w-4 rounded border-2 border-slate-900/80" name="noop-type" />
                Wholesale
              </label>
            </fieldset>

            {/* Categories quick grid */}
            <form method="get" className="space-y-4">
              <input type="hidden" name="search" defaultValue={filters.search} />
              <fieldset className="space-y-2">
                <legend className={`${hand.className} text-lg text-slate-900`}>Top Categories</legend>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 4).map((c) => (
                    <label key={c.slug} className={`${hand.className} flex items-center gap-2 text-[14px]`}>
                      <input
                        type="radio"
                        name="category"
                        value={c.slug}
                        defaultChecked={filters.category === c.slug}
                        className="h-4 w-4 rounded border-2 border-slate-900/80"
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
                <Link href="/categories" className={`${hand.className} inline-flex items-center text-[14px] text-blue-700`}>→ See All</Link>
              </fieldset>

              {/* Regions */}
              <fieldset className="mt-4 space-y-2">
                <legend className={`${hand.className} text-lg text-slate-900`}>Location</legend>
                {regions.slice(0, 5).map((r) => (
                  <label key={r.slug} className={`${hand.className} flex items-center gap-2 text-[14px]`}>
                    <input
                      type="radio"
                      name="region"
                      value={r.slug}
                      defaultChecked={filters.region === r.slug}
                      className="h-4 w-4 rounded border-2 border-slate-900/80"
                    />
                    {r.name}
                  </label>
                ))}
                <Link href="/locations" className={`${hand.className} inline-flex items-center text-[14px] text-blue-700`}>→ See All</Link>
              </fieldset>

              {/* Lot size (small) */}
              <fieldset className="mt-4 space-y-2">
                <legend className={`${hand.className} text-lg text-slate-900`}>Lot Size</legend>
                {lotSizes.slice(0, 3).map((lot) => (
                  <label key={lot.slug} className={`${hand.className} flex items-center gap-2 text-[14px]`}>
                    <input
                      type="radio"
                      name="lot-size"
                      value={lot.slug}
                      defaultChecked={filters.lotSize === lot.slug}
                      className="h-4 w-4 rounded border-2 border-slate-900/80"
                    />
                    {lot.name}
                  </label>
                ))}
              </fieldset>

              <button
                type="submit"
                className={`${hand.className} mt-3 inline-flex items-center justify-center rounded-[12px] bg-slate-900 px-4 py-2 text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] hover:translate-y-[-1px]`}
              >
                Apply Filters
              </button>
              <Link href="/suppliers" className={`${hand.className} ml-3 text-[14px] text-slate-700 hover:underline`}>Clear all</Link>
            </form>
          </aside>

          {/* Cards area */}
          <section>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((s, idx) => (
                <a
                  key={s.slug}
                  href={`/suppliers/${s.slug}`}
                  className="group block overflow-hidden rounded-[18px] border-2 border-slate-900/80 bg-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)]"
                >
                  {/* ribbon */}
                  <div className="relative h-28 bg-slate-50">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-14 w-28 rounded-md bg-white ring-1 ring-slate-200 text-center text-slate-800 font-semibold grid place-items-center">
                        {s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name}
                      </div>
                    </div>
                    {/* Trusted ribbon (just for flair) */}
                    <div className="absolute right-[-45px] top-3 rotate-45 rounded bg-[#8bb7ff] px-10 py-1 text-xs font-semibold text-slate-900 shadow">
                      Trusted
                    </div>
                  </div>
                  <div className="border-t-2 border-slate-900/80 bg-white p-3">
                    <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                    <div className={`${hand.className} mt-1 text-[12px] leading-4 text-slate-700`}>
                      {s.region?.name ?? s.region?.stateCode ?? '154 Trenton St, WY, 82822'}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination look (numbers) */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <button className="text-slate-700">{'<'}</button>
              <div className={`${hand.className} flex items-center gap-3 text-[16px]`}>
                <span className="underline underline-offset-4">1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>…</span>
                <span>50</span>
              </div>
              {/* Hooked to your real cursor for forward navigation */}
              {nextCursor ? (
                <Link href={`/suppliers?${nextParams.toString()}`} className="text-slate-700">{'>'}</Link>
              ) : (
                <span className="text-slate-400">{'>'}</span>
              )}
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <section className="mt-12">
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
      </div>
    </div>
  );
}
