import Link from 'next/link';
import { SectionHeading } from '@/components/section-heading';

export default function ListYourBusinessPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="For Suppliers"
          title="Apply to list your liquidation business on Find Liquidation"
          description="We partner with supplier teams who prioritize transparency, consistent freight readiness, and buyer support. Share a few details and our marketplace team will reach out within two business days."
          align="center"
        />

        <div className="mt-8 space-y-6 rounded-lg border border-slate-200 bg-white p-8">
          <div className="space-y-2 text-sm text-slate-600">
            <p>Find Liquidation reviews every supplier application for:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Proof of sourcing rights or retailer/manufacturer contracts</li>
              <li>Warehouse operations, inspection options, and load-out SLAs</li>
              <li>Buyer references and dispute resolution policies</li>
              <li>Insurance, compliance, and data handling processes</li>
            </ul>
          </div>

          <Link
            href="/submit-listing"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Start supplier application →
          </Link>

          <p className="text-xs text-slate-500">
            Prefer a conversation first? Email <a className="underline hover:text-blue-600" href="mailto:suppliers@destockify.com">suppliers@destockify.com</a> with your company details and our marketplace team will schedule a 30 minute call.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Already listed? <Link href="/contact" className="underline hover:text-blue-600">Contact the Find Liquidation team</Link> to update your profile, promote upcoming loads, or share buyer wins.
        </div>
      </div>
    </div>
  );
}
