// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { DM_Sans } from 'next/font/google';
import './globals.css';

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
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900"
        >
          <span className="sr-only">Destockify</span>
          <span aria-hidden className="select-none">
            <span className="font-extrabold">Destock</span>
            <span className="font-extrabold text-blue-600">ify</span>
          </span>
        </Link>

        {/* Nav (Zillow-like typography & hover) */}
        <nav className="flex items-center gap-7 text-[15px] font-medium tracking-tight" aria-label="Primary">
          <Link className="text-slate-800 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm px-1 py-0.5" href="/suppliers">
            Buyers
          </Link>
          <Link className="text-slate-800 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm px-1 py-0.5" href="/list-your-business">
            Sellers
          </Link>
          <Link className="text-slate-800 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm px-1 py-0.5" href="/login">
            Login
          </Link>

          <Link
            href="/list-your-business"
            className="ml-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            List your Business
          </Link>
        </nav>
      </div>
    </header>
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
