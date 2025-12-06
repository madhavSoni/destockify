// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sora } from 'next/font/google';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trust Pallet | Wholesale Liquidation Supplier Directory',
  description:
    'Trust Pallet helps liquidation buyers find vetted wholesale pallet and truckload suppliers with transparent reviews, guides, and buyer insights.',
  openGraph: {
    title: 'Trust Pallet | Wholesale Liquidation Supplier Directory',
    description:
      'Find vetted liquidation suppliers, read verified buyer reviews, and learn how to scale your wholesale sourcing with confidence.',
    url: 'https://trustpallet.com',
    siteName: 'Trust Pallet',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust Pallet | Wholesale Liquidation Supplier Directory',
    description:
      'Find vetted liquidation suppliers, read verified buyer reviews, and learn how to scale your wholesale sourcing with confidence.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} bg-white text-black antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-3">
          <Link href="/" className="text-lg font-semibold text-black">
            Trust Pallet
          </Link>
          <p className="text-sm leading-6 text-black/70">
            Buy Truckload Liquidation from trusted sellers across the United States. Your go to directory for Liquidation and Wholesale Suppliers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm text-black/70 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="font-semibold text-black">Marketplace</p>
            <Link href="/suppliers" className="block hover:text-blue-600 transition-colors duration-200">Supplier directory</Link>
            <Link href="/categories" className="block hover:text-blue-600 transition-colors duration-200">Categories</Link>
            <Link href="/brands" className="block hover:text-blue-600 transition-colors duration-200">Brands</Link>
            <Link href="/locations" className="block hover:text-blue-600 transition-colors duration-200">Locations</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-black">Company</p>
            <Link href="/list-your-business" className="block hover:text-blue-600 transition-colors duration-200">Become a partner</Link>
            <Link href="/contact" className="block hover:text-blue-600 transition-colors duration-200">Contact</Link>
            <Link href="/privacy" className="block hover:text-blue-600 transition-colors duration-200">Privacy</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-black/5 py-4 text-center text-xs text-black/50">
        © {new Date().getFullYear()} Trust Pallet. Built for liquidation buyers.
      </div>
    </footer>
  );
}
