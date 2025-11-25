import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { GuideCard } from '@/components/guide-card';
import { SectionHeading } from '@/components/section-heading';

export default async function CategoryDetailPage(props: any) {
  const { params } = props;
  const [categories, suppliersResult] = await Promise.all([
    api.catalog.categories(),
    api.suppliers.list({ category: params.slug, limit: 12 }),
  ]);

  const category = categories.find((item) => item.slug === params.slug);
  if (!category) {
    notFound();
  }

  const relatedGuides: any[] = [];

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Liquidation Category</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{category.name}</h1>
          {category.headline && <p className="mt-3 text-sm text-slate-600">{category.headline}</p>}
          {category.description && <p className="mt-3 text-sm text-slate-600">{category.description}</p>}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
            {category.supplierCount.toLocaleString()} vetted suppliers
          </div>
        </section>

        <section className="mt-12 space-y-8">
          <SectionHeading
            eyebrow="Suppliers"
            title={`Trusted suppliers specialising in ${category.name.toLowerCase()}`}
            description="These partners regularly release pallets, mixed loads, and truckload programs tailored to this commodity."
          />
          {suppliersResult.items.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
              No suppliers published in this category yet. Trust Pallet is onboarding new partners weekly—check back soon or
              request a sourcing consult.
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
              href={`/suppliers?category=${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              View more suppliers in this category →
            </Link>
          </div>
        </section>

        {relatedGuides.length > 0 && (
          <section className="mt-12 space-y-6">
            <SectionHeading
              eyebrow="Guides"
              title="Recommended playbooks for this product class"
              description="Operational checklists and negotiation tactics curated for this type of inventory."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {relatedGuides.slice(0, 4).map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
