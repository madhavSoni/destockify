import Link from 'next/link';
import { Patrick_Hand } from 'next/font/google';
import { api } from '@/lib/api';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default async function LotSizesPage() {
  // Lot sizes API not yet implemented
  const lotSizes: any[] = [];

  // tiny icon map for the sketch cards
  const iconFor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('micro') || n.includes('case')) return '📦';
    if (n.includes('pallet')) return '🧱';
    if (n.includes('partial') || n.includes('half')) return '🛒';
    if (n.includes('truck') || n.includes('truckload')) return '🚚';
    return '📦';
  };

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Heading like the other hand-drawn pages */}
        <h1 className={`${hand.className} text-center text-4xl sm:text-5xl text-slate-900`}>
          Buy Wholesale Merchandise by Lot Size
        </h1>
        <p className={`${hand.className} mt-2 text-center text-lg text-slate-700`}>
          Compare Micro-lots, Pallets, Partials and full Truckloads
        </p>

        {/* Marketplace pill */}
        <div className="mt-4 flex justify-center">
          <Link
            href="/suppliers"
            className={`${hand.className} inline-flex items-center justify-center rounded-[12px] bg-[#2f6feb] px-4 py-2 text-white text-sm shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 transition hover:-translate-y-[1px]`}
          >
            Marketplace
          </Link>
        </div>

        {/* Sketch grid of lot-size cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lotSizes.map((lot) => (
            <Link
              key={lot.slug}
              href={`/lot-sizes/${lot.slug}`}
              className="group relative flex h-28 items-center justify-between gap-4 rounded-[18px] border-2 border-slate-900/80 bg-white px-5 shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition hover:-translate-y-[2px]"
              aria-label={lot.name}
            >
              {/* icon */}
              <span className="text-4xl select-none">{iconFor(lot.name)}</span>

              {/* text block */}
              <div className="min-w-0 flex-1">
                <div className={`${hand.className} truncate text-xl text-slate-900`}>
                  {lot.name}
                </div>
                <div className={`${hand.className} mt-1 line-clamp-2 text-sm text-slate-700`}>
                  {lot.headline || lot.description || 'Explore programs for this lot size.'}
                </div>
              </div>

              {/* meta pill */}
              <span className={`${hand.className} shrink-0 rounded-[12px] bg-slate-100 px-3 py-1 text-sm text-slate-800 ring-1 ring-slate-300`}>
                {lot.supplierCount} suppliers
              </span>

              {/* faint inner ring for sketch look */}
              <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-slate-900/5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
