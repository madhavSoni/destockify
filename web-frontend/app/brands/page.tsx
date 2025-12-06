import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Brand Liquidation Pages – Buy from Major Retailers | TrustPallet',
  description: 'Browse liquidation pallets and truckloads by retailer brand. Find Amazon, Walmart, Target, Home Depot, and other major retailer liquidation inventory from verified suppliers.',
  alternates: {
    canonical: 'https://trustpallet.com/brands',
  },
  openGraph: {
    title: 'Brand Liquidation Pages – Buy from Major Retailers | TrustPallet',
    description: 'Browse liquidation pallets and truckloads by retailer brand. Find Amazon, Walmart, Target, Home Depot, and other major retailer liquidation inventory from verified suppliers.',
    url: 'https://trustpallet.com/brands',
    siteName: 'TrustPallet',
    type: 'website',
  },
};

export default async function BrandsPage() {
  const allPages = await api.catalog.categoryPages.list();
  const brandPages = allPages.filter((page: any) => page.topicCategory === 'retailer');

  // Simple emoji placeholders for brand logos (can be replaced with actual logos later)
  const iconFor = (slug: string) => {
    if (slug.includes('amazon')) return '📦';
    if (slug.includes('walmart')) return '🛒';
    if (slug.includes('target')) return '🎯';
    if (slug.includes('home-depot')) return '🔨';
    if (slug.includes('lowes')) return '🛠️';
    if (slug.includes('kohls')) return '👔';
    if (slug.includes('costco')) return '🏪';
    if (slug.includes('sams-club')) return '🏬';
    if (slug.includes('best-buy')) return '📱';
    if (slug.includes('macys')) return '👗';
    if (slug.includes('nordstrom')) return '💼';
    if (slug.includes('jcpenney')) return '👕';
    if (slug.includes('tjmaxx')) return '🛍️';
    if (slug.includes('cvs')) return '💊';
    if (slug.includes('walgreens')) return '🏥';
    if (slug.includes('ace-hardware')) return '🔧';
    return '🏷️';
  };

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
            Buy Liquidation Pallets Direct From Major Retailers
          </h1>
          <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Find liquidation pallets and truckloads from top retailers including Amazon, Walmart, Target, Home Depot, and more.
          </p>
        </div>

        {/* Grid of brand cards */}
        <div className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brandPages.map((page: any) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="group relative flex flex-col h-48 items-center justify-center rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              aria-label={page.pageTitle}
              title={page.pageTitle}
            >
              {page.heroImage && (
                <div className="absolute inset-0">
                  <img src={page.heroImage} alt={page.heroImageAlt || page.pageTitle} className="w-full h-full object-cover opacity-20" />
                </div>
              )}
              <div className="relative z-10 text-center px-4">
                <div className="text-4xl mb-2">{iconFor(page.slug)}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{page.pageTitle}</h3>
                {page.metaDescription && (
                  <p className="text-xs text-slate-600 line-clamp-2">{page.metaDescription.substring(0, 100)}...</p>
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

