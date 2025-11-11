// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteHeader } from '@/components/site-header';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Destockify | Wholesale Liquidation Supplier Directory',
  description:
    'Destockify helps liquidation buyers find vetted wholesale pallet and truckload suppliers with transparent reviews, guides, and buyer insights.',
  openGraph: {
    title: 'Destockify | Wholesale Liquidation Supplier Directory',
    description:
      'Find vetted liquidation suppliers, read verified buyer reviews, and learn how to scale your wholesale sourcing with confidence.',
    url: 'https://destockify.com',
    siteName: 'Destockify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destockify | Wholesale Liquidation Supplier Directory',
    description:
      'Find vetted liquidation suppliers, read verified buyer reviews, and learn how to scale your wholesale sourcing with confidence.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-3">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Destockify
          </Link>
          <p className="text-sm leading-6 text-slate-600">
            Your guide to trusted liquidation and wholesale pallet suppliers. We verify sourcing, highlight buyer wins,
            and help you scale without surprises.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm text-slate-700 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Marketplace</p>
            <Link href="/suppliers" className="block hover:text-blue-700">Supplier directory</Link>
            <Link href="/categories" className="block hover:text-blue-700">Categories</Link>
            <Link href="/locations" className="block hover:text-blue-700">Locations</Link>
            <Link href="/lot-sizes" className="block hover:text-blue-700">Lot sizes</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Resources</p>
            <Link href="/guides" className="block hover:text-blue-700">Buyer guides</Link>
            <Link href="/suppliers?search=export" className="block hover:text-blue-700">Export programs</Link>
            <Link href="/suppliers?search=contract" className="block hover:text-blue-700">Contract loads</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Company</p>
            <Link href="/list-your-business" className="block hover:text-blue-700">Become a partner</Link>
            <Link href="/contact" className="block hover:text-blue-700">Contact</Link>
            <Link href="/privacy" className="block hover:text-blue-700">Privacy</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Destockify. Built for liquidation buyers.
      </div>
    </footer>
  );
}
