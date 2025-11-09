import Link from 'next/link';
import { api } from '@/lib/api';
import { SectionHeading } from '@/components/section-heading';

export default async function LocationsPage() {
  const regions = await api.catalog.regions();

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Locations"
          title="Major liquidation hubs across the United States"
          description="Understand freight lanes, export opportunities, and buyer segments for the most active liquidation markets."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {regions.map((region) => (
            <Link
              key={region.slug}
              href={`/locations/${region.slug}`}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">{region.name}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {region.supplierCount} suppliers
                  </span>
                </div>
                {region.headline && <p className="text-sm text-slate-600">{region.headline}</p>}
                {region.marketStats && 'topPorts' in region.marketStats && Array.isArray(region.marketStats.topPorts) && (
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {(region.marketStats.topPorts as string[]).map((port) => (
                      <span key={port} className="rounded-full bg-slate-100 px-3 py-1">
                        Port: {port}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-slate-800">
                Explore region
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
