import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Brand Liquidation Pages – Buy from Major Retailers | Find Liquidation',
  description: 'Browse liquidation pallets and truckloads by retailer brand. Find Amazon, Walmart, Target, Home Depot, and other major retailer liquidation inventory from verified suppliers.',
  alternates: {
    canonical: 'https://findliquidation.com/brands',
  },
  openGraph: {
    title: 'Brand Liquidation Pages – Buy from Major Retailers | Find Liquidation',
    description: 'Browse liquidation pallets and truckloads by retailer brand. Find Amazon, Walmart, Target, Home Depot, and other major retailer liquidation inventory from verified suppliers.',
    url: 'https://findliquidation.com/brands',
    siteName: 'Find Liquidation',
    type: 'website',
  },
};

export default async function BrandsPage() {
  const allPages = await api.catalog.categoryPages.list();
  const brandPages = allPages.filter((page: any) => page.topicCategory === 'retailer');


  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">RETAILERS</p>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
            Buy Liquidation Pallets Direct From Major Retailers
          </h1>
          <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Find liquidation pallets and truckloads from top retailers including Amazon, Walmart, Target, Home Depot, and more.
          </p>
        </div>

        {/* Grid of brand cards */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {brandPages.slice().reverse().map((page: any) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group relative flex flex-col h-48 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lift hover:-translate-y-1 overflow-hidden"
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
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Link
            href="/suppliers"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-black/90 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
          >
            Browse All Suppliers
            <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

