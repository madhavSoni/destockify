import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { SectionHeading } from '@/components/section-heading';

export default async function LotSizeDetailPage(props: any) {
  const { params } = props;
  const [lotSizes, suppliersResult] = await Promise.all([
    api.catalog.lotSizes(),
    api.suppliers.list({ lotSize: params.slug, limit: 12 }),
  ]);

  const lot = lotSizes.find((item) => item.slug === params.slug);
  if (!lot) {
    notFound();
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Lot Size</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{lot.name}</h1>
          {lot.headline && <p className="mt-3 text-sm text-slate-600">{lot.headline}</p>}
          {lot.description && <p className="mt-3 text-sm text-slate-600">{lot.description}</p>}
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
            {lot.minUnits && <span className="rounded-full bg-slate-100 px-3 py-1">Minimum {lot.minUnits.toLocaleString()} units</span>}
            {lot.maxUnits && <span className="rounded-full bg-slate-100 px-3 py-1">Up to {lot.maxUnits.toLocaleString()} units</span>}
            <span className="rounded-full bg-slate-100 px-3 py-1">{lot.supplierCount} suppliers</span>
          </div>
        </section>

        <section className="mt-12 space-y-8">
          <SectionHeading
            eyebrow="Suppliers"
            title={`Suppliers shipping ${lot.name.toLowerCase()}`}
            description="Match your buying cadence to suppliers that excel at this lot format with consistent grading and load-out speed."
          />
          {suppliersResult.items.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
              No suppliers listed for this lot size yet. Destockify is actively recruiting partners for this format—check
              back soon or request a sourcing consult.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {suppliersResult.items.map((supplier) => (
                <SupplierCard key={supplier.slug} supplier={supplier} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-center">
            <Link
              href={`/suppliers?lot-size=${lot.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              View more suppliers shipping {lot.name.toLowerCase()} →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
