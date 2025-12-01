import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://trustpallet.com/terms',
  },
  openGraph: {
    url: 'https://trustpallet.com/terms',
    siteName: 'TrustPallet',
    type: 'website',
  },
  title: 'Terms of Service | Trust Pallet',
  description: 'Terms and conditions for using Trust Pallet platform.',
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-900 mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Trust Pallet, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Use of Service</h2>
            <p>
              Trust Pallet provides a directory and marketplace platform connecting buyers with liquidation and wholesale suppliers. 
              You agree to use the service only for lawful purposes and in accordance with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Supplier Listings</h2>
            <p>
              Supplier information is provided for informational purposes. While we verify suppliers, we do not guarantee 
              the accuracy of all information or endorse any particular supplier. Users should conduct their own due diligence 
              before engaging in any business transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Reviews and Content</h2>
            <p>
              By submitting reviews or other content to Trust Pallet, you grant us a non-exclusive, worldwide, royalty-free license 
              to use, display, and distribute such content. You agree that your reviews are honest and based on your actual experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Prohibited Activities</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Use the service for spam or unauthorized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Intellectual Property</h2>
            <p>
              All content on Trust Pallet, including text, graphics, logos, and software, is the property of Trust Pallet 
              or its licensors and is protected by copyright and intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Disclaimer of Warranties</h2>
            <p>
              Trust Pallet is provided "as is" without warranties of any kind, either express or implied. We do not warrant 
              that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Limitation of Liability</h2>
            <p>
              Trust Pallet shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Last updated: November 17, 2025
            </p>
            <p className="mt-4 text-sm text-slate-600">
              For questions about these terms, please contact us at{' '}
              <a className="underline hover:text-slate-900" href="mailto:legal@destockify.com">
                legal@destockify.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
