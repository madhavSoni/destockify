import Link from 'next/link';
import { SectionHeading } from '@/components/section-heading';

export default function ListYourBusinessPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="For Suppliers"
          title="Apply to list your liquidation business on Destockify"
          description="We partner with supplier teams who prioritize transparency, consistent freight readiness, and buyer support. Share a few details and our marketplace team will reach out within two business days."
          align="center"
        />

        <div className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-2 text-sm text-slate-600">
            <p>Destockify reviews every supplier application for:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Proof of sourcing rights or retailer/manufacturer contracts</li>
              <li>Warehouse operations, inspection options, and load-out SLAs</li>
              <li>Buyer references and dispute resolution policies</li>
              <li>Insurance, compliance, and data handling processes</li>
            </ul>
          </div>

          <a
            href="https://forms.gle/your-destockify-supplier-form"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Start supplier application →
          </a>

          <p className="text-xs text-slate-500">
            Prefer a conversation first? Email <a className="underline" href="mailto:suppliers@destockify.com">suppliers@destockify.com</a> with your company details and our marketplace team will schedule a 30 minute call.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Already listed? <Link href="/contact" className="underline">Contact the Destockify team</Link> to update your profile, promote upcoming loads, or share buyer wins.
        </div>
      </div>
    </div>
  );
}
