'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

function Chevron({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  const rotate = dir === 'left' ? 'rotate-180' : '';
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${rotate}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandCarousel({ categoryPages }: { categoryPages: any[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (count: number) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const cardWidth = card ? card.offsetWidth : 224;
    el.scrollBy({ left: count * (cardWidth + 16), behavior: 'smooth' });
  };

  // Brand order: Amazon, Home Depot, Target, Walmart, Lowe's, Kohl's
  const brandOrder = ['amazon', 'home-depot', 'target', 'walmart', 'lowes', 'kohls'];
  
  const brandPages = categoryPages
    .filter((page: any) => page.topicCategory === 'retailer')
    .sort((a: any, b: any) => {
      const aIndex = brandOrder.findIndex(brand => a.slug.includes(brand));
      const bIndex = brandOrder.findIndex(brand => b.slug.includes(brand));
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .slice(0, 6);

  if (brandPages.length === 0) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-0">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">RETAILERS</p>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
                Buy Liquidation Pallets Direct From Major Retailers
              </h2>
            </div>
            {brandPages.length > 0 && (
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
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide items-stretch -mx-4 px-4"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {brandPages.map((page: any) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                data-card
                className="group flex-shrink-0 w-48 sm:w-56 aspect-square rounded-md bg-white border border-slate-200 shadow-sm transition-all duration-300 ease-out hover:shadow-lift hover:-translate-y-1 overflow-hidden snap-start"
                aria-label={page.pageTitle}
                title={page.pageTitle}
              >
                <div className="flex items-center justify-center p-6 h-full w-full">
                  {page.heroImage ? (
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 group-hover:scale-105 transition-transform">
                      <Image
                        src={page.heroImage}
                        alt={page.heroImageAlt || page.pageTitle}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 128px, 160px"
                      />
                    </div>
                  ) : (
                    <div className="text-6xl">🏷️</div>
                  )}
                </div>
              </Link>
            ))}
            <Link
              href="/brands"
              data-card
              className="flex-shrink-0 w-48 sm:w-56 aspect-square rounded-md border-2 border-dashed border-slate-300 bg-white shadow-sm flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 hover:shadow-lift transition-all duration-300 ease-out group snap-start"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">→</div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">Show More</span>
              </div>
            </Link>
            {/* Right spacer for last card breathing room */}
            <div className="shrink-0 w-4 sm:w-8" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

