// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
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
    url: 'https://destockify.com',
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
      <body className={`${inter.variable} bg-white text-black antialiased`}>
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
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-3">
          <Link href="/" className="text-lg font-semibold text-black">
            Trust Pallet
          </Link>
          <p className="text-sm leading-6 text-black/70">
            Your guide to trusted liquidation and wholesale pallet suppliers. We verify sourcing, highlight buyer wins,
            and help you scale without surprises.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm text-black/70 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-semibold text-black">Marketplace</p>
            <Link href="/suppliers" className="block hover:text-blue-600">Supplier directory</Link>
            <Link href="/categories" className="block hover:text-blue-600">Categories</Link>
            <Link href="/locations" className="block hover:text-blue-600">Locations</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-black">Resources</p>
            <Link href="/suppliers?search=export" className="block hover:text-blue-600">Export programs</Link>
            <Link href="/suppliers?search=contract" className="block hover:text-blue-600">Contract loads</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-black">Company</p>
            <Link href="/list-your-business" className="block hover:text-blue-600">Become a partner</Link>
            <Link href="/contact" className="block hover:text-blue-600">Contact</Link>
            <Link href="/privacy" className="block hover:text-blue-600">Privacy</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-black/5 py-4 text-center text-xs text-black/50">
        © {new Date().getFullYear()} Trust Pallet. Built for liquidation buyers.
      </div>
    </footer>
  );
}
