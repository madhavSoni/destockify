import { Metadata } from 'next';
import { SectionHeading } from '@/components/section-heading';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Find Liquidation sourcing team for questions about suppliers, freight, or listing your liquidation program.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | Find Liquidation',
    description: 'Get in touch with the Find Liquidation sourcing team for questions about suppliers, freight, or listing your liquidation program.',
    url: 'https://findliquidation.com/contact',
    siteName: 'Find Liquidation',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Connect with the Find Liquidation sourcing team"
          description="Have a question about suppliers, freight, or publishing your liquidation program? We're here to help."
          align="center"
        />

        <div className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Email</h2>
            <p className="mt-2 text-sm text-slate-600">
              Buyers: <a className="underline" href="mailto:hello@findliquidation.com">hello@findliquidation.com</a>
              <br />
              Suppliers: <a className="underline" href="mailto:suppliers@findliquidation.com">suppliers@findliquidation.com</a>
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Office Hours</h2>
            <p className="mt-2 text-sm text-slate-600">Monday–Friday · 9am–6pm EST</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Need a faster response?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Text <strong>(929) 412-0090</strong> for urgent freight or manifest questions. A sourcing advisor will respond within
              one business hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
