import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { SectionHeading } from '@/components/section-heading';

export default async function LocationDetailPage({ params }: { params: { slug: string } }) {
  const [regions, suppliersResult, categories] = await Promise.all([
    api.catalog.regions(),
    api.suppliers.list({ region: params.slug, limit: 12 }),
    api.catalog.categories(),
  ]);

  const region = regions.find((item) => item.slug === params.slug);
  if (!region) {
    notFound();
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Liquidation Hub</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{region.name}</h1>
          {region.headline && <p className="mt-3 text-sm text-slate-600">{region.headline}</p>}
          {region.description && <p className="mt-3 text-sm text-slate-600">{region.description}</p>}
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
            {region.marketStats && 'averageFreight' in region.marketStats && region.marketStats.averageFreight && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Avg freight: {String(region.marketStats.averageFreight)}
              </span>
            )}
            {region.marketStats && 'buyerSegments' in region.marketStats && Array.isArray(region.marketStats.buyerSegments) && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Buyer segments: {(region.marketStats.buyerSegments as string[]).join(', ')}
              </span>
            )}
          </div>
        </section>

        <section className="mt-12 space-y-8">
          <SectionHeading
            eyebrow="Suppliers"
            title={`Verified suppliers operating out of ${region.name}`}
            description="These partners maintain warehouses, inspection programs, or loadout teams in this market."
          />
          {suppliersResult.items.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
              No suppliers published for this region yet. Destockify is onboarding additional partners—reach out if you
              need introductions in this market.
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
              href={`/suppliers?region=${region.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              View more suppliers in {region.name} →
            </Link>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <SectionHeading
            eyebrow="Popular Categories"
            title="Top categories leaving this market"
            description="Based on the suppliers Destockify tracks, these categories see the highest load velocity from this hub."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {categories
              .filter((category) => category.supplierCount > 0)
              .slice(0, 6)
              .map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{category.name}</div>
                    {category.headline && <div className="text-xs text-slate-500">{category.headline}</div>}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {category.supplierCount} suppliers
                  </span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
