import Link from 'next/link';
import { api } from '@/lib/api';
import { GuideCard } from '@/components/guide-card';
import { SectionHeading } from '@/components/section-heading';

export default async function GuidesPage() {
  // Guides API not yet implemented
  const guides: any[] = [];

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Guides"
          title="Playbooks from Trust Pallet sourcing strategists"
          description="Practical frameworks covering supplier vetting, warehouse staffing, truckload modeling, and risk mitigation."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Looking for a specific playbook? Email <a className="underline" href="mailto:hello@destockify.com">hello@destockify.com</a>{' '}
          and our sourcing team will share template manifests, freight models, and supplier introduction scripts tailored to your operation.
        </div>
      </div>
    </div>
  );
}
