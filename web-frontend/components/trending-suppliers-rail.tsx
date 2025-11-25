'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { api } from '@/lib/api';
import { SupplierCard } from './supplier-card';

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
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
      <div className="mb-4 sm:mb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-black">Trending Wholesale Suppliers Near You</h2>
          <p className="mt-1 text-sm sm:text-base text-black/70">
            Find wholesale lots of returns, overstock and mixed merchandise by the pallet or truckload.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCards(-1)}
            className="rounded-md border border-black/10 bg-white p-2 text-black hover:bg-black/5 transition-colors"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCards(1)}
            className="rounded-md border border-black/10 bg-white p-2 text-black hover:bg-black/5 transition-colors"
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Mobile navigation arrows */}
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          className="lg:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 rounded-md bg-white/95 p-2 shadow-lg ring-1 ring-black/10 text-black hover:bg-white transition-all"
          aria-label="Previous"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          className="lg:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 rounded-md bg-white/95 p-2 shadow-lg ring-1 ring-black/10 text-black hover:bg-white transition-all"
          aria-label="Next"
        >
          <Chevron dir="right" />
        </button>

        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide items-stretch"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {suppliers.slice(0, 8).map((s) => (
            <div
              key={s.slug}
              data-card
              className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
            >
              <SupplierCard supplier={s} />
            </div>
          ))}
          
          {/* "See more" button card - half peek */}
          <Link
            href="/suppliers"
            className="group relative shrink-0 snap-start overflow-hidden rounded-md border border-dashed border-black/20 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-blue-600 transition-all duration-200"
            style={{ width: '160px' }}
            aria-label="See more suppliers"
          >
            <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-2 p-4 text-center">
              <span className="text-2xl text-black/30 group-hover:text-blue-600 transition-colors">→</span>
              <span className="text-sm font-medium text-black/50 group-hover:text-blue-600 transition-colors">See more</span>
            </div>
          </Link>

          {/* Right spacer for last card breathing room */}
          <div className="shrink-0 w-4 sm:w-8" aria-hidden />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/suppliers"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-blue-700 transition-colors"
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
