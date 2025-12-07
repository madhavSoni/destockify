'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { SupplierCard } from './supplier-card';
import type { SupplierSummary } from '@/lib/api';

function Chevron({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  const rotate = dir === 'left' ? 'rotate-180' : '';
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${rotate}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeaturedSuppliersCarousel({
  suppliers,
  title,
  description,
  enableDivider,
  supplierIds,
}: {
  suppliers: SupplierSummary[];
  title?: string | null;
  description?: string | null;
  enableDivider?: boolean | null;
  supplierIds?: number[] | null;
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
    <section className="mb-16 sm:mb-20">
      {enableDivider && <div className="border-t border-slate-200 mb-12"></div>}
      
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-0">
          <div>
            {title && (
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-3xl">
                {description}
              </p>
            )}
          </div>
          {suppliers.length > 0 && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByCards(-1)}
                className="rounded-md border border-slate-200 bg-white shadow-sm p-2 text-black hover:bg-slate-50 hover:border-blue-500 hover:shadow-lift transition-all duration-200"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByCards(1)}
                className="rounded-md border border-slate-200 bg-white shadow-sm p-2 text-black hover:bg-slate-50 hover:border-blue-500 hover:shadow-lift transition-all duration-200"
              >
                <Chevron dir="right" />
              </button>
            </div>
          )}
        </div>
      </div>

      {suppliers.length > 0 ? (
        <div className="relative">
          {/* Mobile navigation arrows */}
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="lg:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 rounded-md bg-white border border-slate-200 p-2 shadow-sm text-black hover:bg-white hover:shadow-lift transition-all duration-200"
            aria-label="Previous"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="lg:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 rounded-md bg-white/95 p-2 shadow-lg ring-1 ring-black/10 text-black hover:bg-white transition-all duration-200"
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
            {suppliers.map((supplier) => (
              <div
                key={supplier.slug || supplier.id || `supplier-${supplier.name}`}
                data-card
                className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col"
              >
                <SupplierCard supplier={supplier} />
              </div>
            ))}
            
            {/* Right spacer for last card breathing room */}
            <div className="shrink-0 w-4 sm:w-8" aria-hidden />
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-600 py-8">
          {supplierIds && supplierIds.length > 0 ? (
            <div>
              <p>No featured suppliers found.</p>
              <p className="text-sm mt-2">Supplier IDs configured: {supplierIds.join(', ')}</p>
              <p className="text-xs mt-1 text-slate-500">Check console for debugging information.</p>
            </div>
          ) : (
            <p>No featured suppliers selected.</p>
          )}
        </div>
      )}
    </section>
  );
}

