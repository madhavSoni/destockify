import Link from 'next/link';
import { api } from '@/lib/api';
import { SectionHeading } from '@/components/section-heading';

export default async function CategoriesPage() {
  const categories = await api.catalog.categories();

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Categories"
          title="Liquidation inventory categories we monitor"
          description="Dive into the nuances of each category, including typical load composition, popular sourcing regions, and the suppliers dominating the segment."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{category.name}</div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {category.headline ?? `Wholesale ${category.name}`}
                </h2>
                {category.description && <p className="text-sm text-slate-600">{category.description}</p>}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-slate-800">
                {category.supplierCount} vetted suppliers
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
