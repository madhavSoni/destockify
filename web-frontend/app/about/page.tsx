import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Trust Pallet',
  description: 'Learn about Trust Pallet - your trusted platform for connecting with verified liquidation and wholesale suppliers across the United States.',
  alternates: {
    canonical: 'https://trustpallet.com/about',
  },
  openGraph: {
    title: 'About Us | Trust Pallet',
    description: 'Learn about Trust Pallet - your trusted platform for connecting with verified liquidation and wholesale suppliers across the United States.',
    url: 'https://trustpallet.com/about',
    siteName: 'TrustPallet',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Us | Trust Pallet',
    description: 'Learn about Trust Pallet - your trusted platform for connecting with verified liquidation and wholesale suppliers across the United States.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">ABOUT</p>
          <h1 className="font-heading text-4xl font-bold text-primary-900 sm:text-5xl mb-4">
            About Trust Pallet
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Connecting buyers with verified liquidation and wholesale suppliers across the United States
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Mission Section */}
          <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-primary-900 mb-4">Our Mission</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Trust Pallet simplifies the process of finding reliable liquidation and wholesale suppliers. 
              We provide a curated directory of vetted companies, complete with verified reviews and 
              detailed information to help you make informed business decisions.
            </p>
          </section>

          {/* What We Do */}
          <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-semibold text-primary-900 mb-6">What We Do</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Verify Suppliers</h3>
                  <p className="text-slate-600">
                    We carefully vet and verify liquidation suppliers to ensure they meet our quality standards, 
                    helping you avoid scams and unreliable partners.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Collect Reviews</h3>
                  <p className="text-slate-600">
                    Real buyers share their experiences with suppliers, providing transparency and 
                    helping you choose the right partner for your business needs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">Build Community</h3>
                  <p className="text-slate-600">
                    Connect buyers and sellers in a trusted marketplace, fostering relationships 
                    that drive success in the liquidation industry.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* For Buyers & Sellers */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* For Buyers */}
            <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-semibold text-primary-900 mb-4">For Buyers</h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Browse verified suppliers by category and location</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Read authentic reviews from other buyers</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Access detailed company information</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Connect with reliable wholesale partners</span>
                </li>
              </ul>
              <Link 
                href="/suppliers"
                className="mt-6 block text-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Browse Directory
              </Link>
            </section>

            {/* For Sellers */}
            <section className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-semibold text-primary-900 mb-4">For Sellers</h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Reach thousands of potential buyers nationwide</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Build credibility through verified customer reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Showcase your inventory and specialties</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Connect with serious, qualified buyers</span>
                </li>
              </ul>
              <Link 
                href="/list-your-business"
                className="mt-6 block text-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                List Your Business
              </Link>
            </section>
          </div>

          {/* Contact CTA */}
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-8 shadow-sm text-center">
            <h2 className="font-heading text-2xl font-semibold text-primary-900 mb-3">Have Questions?</h2>
            <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
              We're here to help. Reach out to us with any questions about our platform, 
              listings, or how to get started.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Contact Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
