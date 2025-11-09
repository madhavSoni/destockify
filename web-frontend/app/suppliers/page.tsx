import Link from 'next/link';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { SectionHeading } from '@/components/section-heading';

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
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
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Supplier Directory"
          title="Browse vetted liquidation suppliers by category, location, and lot size"
          description="Use the filters below to narrow down suppliers that match your freight strategy, merchandising mix, and operational readiness."
        />

        <FilterForm
          filters={filters}
          categories={categories}
          regions={regions}
          lotSizes={lotSizes}
        />

        {result.items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
            No suppliers match those filters yet. Try removing a filter or check back as Destockify onboards new partners weekly.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {result.items.map((supplier) => (
              <SupplierCard key={supplier.slug} supplier={supplier} />
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="mt-12 flex items-center justify-center">
            <Link
              href={`/suppliers?${nextParams.toString()}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Load more suppliers →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterForm({
  filters,
  categories,
  regions,
  lotSizes,
}: {
  filters: { search: string; category: string; region: string; lotSize: string };
  categories: Awaited<ReturnType<typeof api.catalog.categories>>;
  regions: Awaited<ReturnType<typeof api.catalog.regions>>;
  lotSizes: Awaited<ReturnType<typeof api.catalog.lotSizes>>;
}) {
  return (
    <form className="mt-10 grid gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4" method="get">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Search
        <input
          type="search"
          name="search"
          defaultValue={filters.search}
          placeholder="Supplier name, keyword, badge"
          className="h-11 rounded-full border border-slate-200 px-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Category
        <select
          name="category"
          defaultValue={filters.category}
          className="h-11 rounded-full border border-slate-200 px-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Region
        <select
          name="region"
          defaultValue={filters.region}
          className="h-11 rounded-full border border-slate-200 px-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          <option value="">United States</option>
          {regions.map((region) => (
            <option key={region.slug} value={region.slug}>
              {region.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Lot size
        <select
          name="lot-size"
          defaultValue={filters.lotSize}
          className="h-11 rounded-full border border-slate-200 px-4 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
        >
          <option value="">All lot sizes</option>
          {lotSizes.map((lot) => (
            <option key={lot.slug} value={lot.slug}>
              {lot.name}
            </option>
          ))}
        </select>
      </label>
      <div className="md:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Apply filters
        </button>
        <Link
          href="/suppliers"
          className="ml-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Clear all
        </Link>
      </div>
    </form>
  );
}
