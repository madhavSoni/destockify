import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { SectionHeading } from '@/components/section-heading';

export default async function LotSizeDetailPage(props: any) {
  const { params } = props;
  // Lot sizes API not yet implemented
  const lotSizes: any[] = [];
  const suppliersResult = await api.suppliers.list({ limit: 12 });

  const lot = lotSizes.find((item: any) => item.slug === params.slug);
  if (!lot) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-md border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Lot Size</p>
          <h1 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">{lot.name}</h1>
          {lot.headline && <p className="mt-3 text-sm text-black/70">{lot.headline}</p>}
          {lot.description && <p className="mt-3 text-sm text-black/70">{lot.description}</p>}
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-black/50">
            {lot.minUnits && <span className="rounded-md bg-black/5 px-3 py-1">Minimum {lot.minUnits.toLocaleString()} units</span>}
            {lot.maxUnits && <span className="rounded-md bg-black/5 px-3 py-1">Up to {lot.maxUnits.toLocaleString()} units</span>}
            <span className="rounded-md bg-black/5 px-3 py-1">{lot.supplierCount} suppliers</span>
          </div>
        </section>

        <section className="mt-12 space-y-8">
          <SectionHeading
            eyebrow="Suppliers"
            title={`Suppliers shipping ${lot.name.toLowerCase()}`}
            description="Match your buying cadence to suppliers that excel at this lot format with consistent grading and load-out speed."
          />
          {suppliersResult.items.length === 0 ? (
            <div className="rounded-md border border-black/10 bg-white p-10 text-center text-sm text-black/70">
              No suppliers listed for this lot size yet. Find Liquidation is actively recruiting partners for this format—check
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
              className="inline-flex items-center gap-2 rounded-md border border-black/10 px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 hover:text-blue-600"
            >
              View more suppliers shipping {lot.name.toLowerCase()} →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
