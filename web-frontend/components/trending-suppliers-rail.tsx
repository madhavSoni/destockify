'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { api } from '@/lib/api';

export function TrendingSuppliersRail({
  suppliers,
}: {
  suppliers: Awaited<ReturnType<typeof api.suppliers.featured>>;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (count: number) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const cardWidth = card ? card.offsetWidth : 320;
    el.scrollBy({ left: count * (cardWidth + 16), behavior: 'smooth' });
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Trending Wholesale Suppliers Near You</h2>
          <p className="mt-1 text-slate-600">
            Find wholesale lots of returns, overstock and mixed merchandise by the pallet or truckload.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCards(-1)}
            className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCards(1)}
            className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 to-transparent" />

        <div
          ref={railRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {suppliers.slice(0, 8).map((s, i) => (
            <Link
              key={s.slug}
              href={`/suppliers/${s.slug}`}
              data-card
              className={`group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${
                i === suppliers.slice(0, 8).length - 1 ? 'mr-16' : ''
              }`}
            >
              {/* Header with gradient */}
              <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-slate-200">
                {/* Company Name Badge */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg px-5 py-2.5 border border-slate-200 max-w-full">
                    <div className="font-semibold text-base text-slate-900 text-center truncate">
                      {s.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                {/* Location */}
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="font-medium text-sm text-slate-700">
                    {s.region?.name ?? s.region?.stateCode ?? 'United States'}
                  </div>
                </div>

                {/* Rating */}
                {s.averageRating && s.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <svg
                          key={idx}
                          className={`w-4 h-4 ${idx < Math.round(s.averageRating!) ? 'text-yellow-400' : 'text-slate-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-semibold text-sm text-slate-900">
                      {s.averageRating.toFixed(1)}
                    </span>
                    {s.reviewCount && s.reviewCount > 0 && (
                      <span className="text-xs text-slate-600">({s.reviewCount})</span>
                    )}
                  </div>
                )}

                {/* Lot Sizes */}
                {s.lotSizes && s.lotSizes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {s.lotSizes.slice(0, 2).map((ls) => (
                      <span
                        key={ls.slug}
                        className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200"
                      >
                        {ls.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {/* half-peek spacer */}
          <div className="pointer-events-none w-[160px] shrink-0" aria-hidden />
        </div>

        {/* Mobile nudge button */}
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow ring-1 ring-slate-200"
          aria-label="Next"
        >
          <Chevron dir="right" />
        </button>
      </div>

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

function Chevron({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  const rotate = dir === 'left' ? 'rotate-180' : '';
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${rotate}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
