'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

type SupplierSummary = {
  slug: string;
  name: string;
  heroImage?: string | null;
  lotSizes?: { name: string }[] | null;
  region?: { name: string; slug: string; stateCode?: string | null } | null;
};

function Chevron({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  const rotate = dir === 'left' ? 'rotate-180' : '';
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${rotate}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendingSuppliersRail({ suppliers }: { suppliers: SupplierSummary[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const cardWidth = card ? card.offsetWidth : 320;
    el.scrollBy({ left: delta * (cardWidth + 16), behavior: 'smooth' });
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Trending Wholesale Suppliers Near You</h2>
          <p className="mt-1 text-slate-600">Find wholesale lots of returns, overstock and mixed merchandise by the pallet or truckload.</p>
        </div>

        {/* Arrows (desktop) */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
          >
            <Chevron />
          </button>
        </div>
      </div>

      {/* Horizontal rail */}
      <div className="relative">
        {/* right fade like Zillow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 to-transparent" />

        <div
          ref={railRef}
          className="
            -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
          style={{
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
            maskImage:
              'linear-gradient(90deg, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)',
          }}
        >
          {suppliers.slice(0, 8).map((s, i) => (
            <Link
              key={s.slug}
              href={`/suppliers/${s.slug}`}
              data-card
              className={`
                group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl
                border border-slate-200 bg-white shadow-sm transition hover:shadow-md
                ${i === suppliers.slice(0, 8).length - 1 ? 'mr-16' : ''}
              `}
            >
              {/* image */}
              <div className="relative h-40 w-full bg-slate-100">
                <Image
                  src={s.heroImage || '/placeholders/supplier.jpg'}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute right-3 top-3 flex gap-2">
                  {(s.lotSizes?.map((ls) => ls.name) ?? ['Pallets'])
                    .slice(0, 2)
                    .map((b: string) => (
                      <span
                        key={b}
                        className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-800 shadow"
                      >
                        {b}
                      </span>
                    ))}
                </div>
              </div>

              {/* body */}
              <div className="p-4">
                <div className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-blue-700">
                  {s.name}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {s.region?.name ?? s.region?.stateCode ?? 'United States'}
                </div>
              </div>
            </Link>
          ))}

          {/* Half-peek "teaser" card */}
          <div className="pointer-events-none w-[160px] shrink-0" aria-hidden />
        </div>

        {/* Mobile next button overlay */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-slate-200"
          aria-label="Next"
        >
          <Chevron />
        </button>
      </div>

      {/* See all */}
      <div className="mt-6 flex justify-center">
        <Link
          href="/suppliers"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          See all suppliers
        </Link>
      </div>
    </section>
  );
}
