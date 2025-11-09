import type { Metadata } from 'next';
import Link from 'next/link';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const NAV_LINKS = [
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/categories', label: 'Categories' },
  { href: '/locations', label: 'Locations' },
  { href: '/lot-sizes', label: 'Lot sizes' },
  { href: '/guides', label: 'Guides' },
];

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
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              D
            </span>
            Destockify
          </Link>
          <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700 md:inline-flex">
            Trusted wholesale network
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/liquidation-companies"
            className="rounded-full px-3 py-1 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Directory
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/guides/how-to-vet-liquidation-suppliers-2025"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Buyer toolkit
          </Link>
          <Link
            href="/list-your-business"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            List your business
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Destockify
          </Link>
          <p className="text-sm text-slate-600">
            Your guide to trusted liquidation and wholesale pallet suppliers. We verify sourcing, highlight buyer
            wins, and help you scale without surprises.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm text-slate-600 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Marketplace</p>
            <Link href="/suppliers" className="block hover:text-slate-900">
              Supplier directory
            </Link>
            <Link href="/categories" className="block hover:text-slate-900">
              Categories
            </Link>
            <Link href="/locations" className="block hover:text-slate-900">
              Locations
            </Link>
            <Link href="/lot-sizes" className="block hover:text-slate-900">
              Lot sizes
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Resources</p>
            <Link href="/guides" className="block hover:text-slate-900">
              Buyer guides
            </Link>
            <Link href="/suppliers?search=export" className="block hover:text-slate-900">
              Export programs
            </Link>
            <Link href="/suppliers?search=contract" className="block hover:text-slate-900">
              Contract loads
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Company</p>
            <Link href="/list-your-business" className="block hover:text-slate-900">
              Become a partner
            </Link>
            <Link href="/contact" className="block hover:text-slate-900">
              Contact
            </Link>
            <Link href="/privacy" className="block hover:text-slate-900">
              Privacy
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Destockify. Built for liquidation buyers.
      </div>
    </footer>
  );
}
