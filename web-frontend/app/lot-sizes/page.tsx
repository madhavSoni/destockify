import Link from 'next/link';
import { api } from '@/lib/api';
import { SectionHeading } from '@/components/section-heading';

export default async function LotSizesPage() {
  const lotSizes = await api.catalog.lotSizes();

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Lot Sizes"
          title="Choose the lot composition that fits your operation"
          description="Compare micro-lots, pallets, partials, and truckloads so you can match supplier programs to your warehouse capacity and capital."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {lotSizes.map((lot) => (
            <Link
              key={lot.slug}
              href={`/lot-sizes/${lot.slug}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">{lot.name}</div>
                {lot.headline && <h2 className="text-lg font-semibold text-slate-900">{lot.headline}</h2>}
                {lot.description && <p className="text-sm text-slate-600">{lot.description}</p>}
              </div>
              <div className="mt-6 text-xs text-slate-500">
                {lot.minUnits && <span className="mr-3 rounded-full bg-slate-100 px-3 py-1">{lot.minUnits.toLocaleString()}+ units</span>}
                {lot.supplierCount} suppliers
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
