import Link from 'next/link';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { GuideCard } from '@/components/guide-card';
import { SectionHeading } from '@/components/section-heading';
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
  schemaToJsonLd,
} from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Liquidation Buying Guides',
  description: 'Practical playbooks from Find Liquidation sourcing strategists covering supplier vetting, truckload modeling, and risk mitigation.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Liquidation Buying Guides | Find Liquidation',
    description: 'Practical playbooks covering supplier vetting, truckload modeling, and risk mitigation.',
    url: 'https://findliquidation.com/guides',
    siteName: 'Find Liquidation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liquidation Buying Guides | Find Liquidation',
    description: 'Practical playbooks covering supplier vetting, truckload modeling, and risk mitigation.',
  },
};

export default async function GuidesPage() {
  // Guides API not yet implemented
  const guides: any[] = [];

  const collectionSchema = generateCollectionPageSchema({
    name: 'Liquidation Buying Guides',
    url: 'https://findliquidation.com/guides',
    description: 'Practical playbooks from Find Liquidation sourcing strategists covering supplier vetting, truckload modeling, and risk mitigation.',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guides' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(breadcrumbSchema) }}
      />
    <div className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Guides"
          title="Playbooks from Find Liquidation sourcing strategists"
          description="Practical frameworks covering supplier vetting, warehouse staffing, truckload modeling, and risk mitigation."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Looking for a specific playbook? Email <a className="underline" href="mailto:findliquidationteam@gmail.com">findliquidationteam@gmail.com</a>{' '}
          and our sourcing team will share template manifests, freight models, and supplier introduction scripts tailored to your operation.
        </div>
      </div>
    </div>
    </>
  );
}
