import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import type { SupplierSummary } from '@/lib/api';

export function SupplierCard({ supplier, variant = 'default' }: { supplier: SupplierSummary; variant?: 'default' | 'compact' }) {
  const badges = supplier.badges?.slice(0, variant === 'compact' ? 2 : 3) ?? [];

  return (
    <Link
      href={`/suppliers/${supplier.slug}`}
      className={clsx(
        'group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg',
        variant === 'compact' ? 'lg:flex-row lg:h-48' : ''
      )}
    >
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-slate-100',
          variant === 'compact' ? 'h-40 lg:h-full lg:w-2/5' : 'h-48'
        )}
      >
        {supplier.heroImage ? (
          <Image
            src={supplier.heroImage}
            alt={supplier.name}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={variant === 'compact'}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
            Supplier preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/65 via-slate-950/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        {supplier.logoImage && (
          <div className="absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white shadow">
            <Image
              src={supplier.logoImage}
              alt={`${supplier.name} logo`}
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900 md:text-xl">{supplier.name}</h3>
            {supplier.trustScore != null && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Trust score {supplier.trustScore}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600">{supplier.shortDescription}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
            {supplier.averageRating ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                <span aria-hidden className="text-base leading-none text-amber-500">★</span>
                {supplier.averageRating.toFixed(1)} avg ({supplier.reviewCount ?? 0} reviews)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                New listing
              </span>
            )}
            {supplier.region && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                {supplier.region.name}
                {supplier.region.stateCode ? ` · ${supplier.region.stateCode}` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full bg-slate-100 px-3 py-1">
              {badge}
            </span>
          ))}
          {supplier.categories.slice(0, 2).map((category) => (
            <span key={category.slug} className="rounded-full bg-slate-100 px-3 py-1">
              {category.name}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-sm font-semibold text-slate-800">View supplier profile</div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition group-hover:translate-x-1">
            →
          </div>
        </div>
      </div>
    </Link>
  );
}

