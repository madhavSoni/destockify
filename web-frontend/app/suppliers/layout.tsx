import { Metadata } from 'next';
import { generateFAQSchema, schemaToJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Buy Liquidation Truckloads & Pallets Near You',
  description: 'Browse hundreds of verified liquidators and wholesalers across the United States. Connect with suppliers offering returned, overstock, and brand-new merchandise.',
  keywords: 'liquidation suppliers, wholesale liquidators, truckload liquidation, pallet liquidation, verified suppliers, liquidation directory',
  alternates: {
    canonical: 'https://findliquidation.com/suppliers',
  },
  openGraph: {
    title: 'Buy Liquidation Truckloads & Pallets Near You | Find Liquidation',
    description: 'Browse hundreds of verified liquidators and wholesalers across the United States. Connect with suppliers offering returned, overstock, and brand-new merchandise.',
    url: 'https://findliquidation.com/suppliers',
    siteName: 'Find Liquidation',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Liquidation Truckloads & Pallets Near You | Find Liquidation',
    description: 'Browse hundreds of verified liquidators and wholesalers across the United States. Connect with suppliers offering returned, overstock, and brand-new merchandise.',
  },
};

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // FAQ data for schema (matches the FAQs in the page component)
  const faqs = [
    {
      question: "How do I find suppliers in my area?",
      answer: "Use the Location filter to browse by region or state. Click on a region to see all states within that region, then select a specific state to view suppliers in that area. You can also use the search function to find suppliers by name or location.",
    },
    {
      question: "What's the difference between verified and unverified suppliers?",
      answer: "Verified suppliers have completed our comprehensive verification process, which includes proof of sourcing rights, warehouse inspections, insurance verification, and buyer reference checks. Unverified suppliers are listed but haven't completed this process yet. We recommend reading reviews for both types before making a purchase.",
    },
    {
      question: "Can I buy liquidation pallets or truckloads directly through Find Liquidation?",
      answer: "Find Liquidation is a directory and review platform. We connect you with suppliers, but all purchases are made directly with the suppliers. Visit supplier profiles to find contact information, websites, and details about their inventory and purchasing process.",
    },
    {
      question: "How do I know if a supplier is trustworthy?",
      answer: "Check the supplier's verification status, read reviews from other buyers, and look at their rating average. Verified suppliers with high ratings and positive reviews are generally more trustworthy. Always do your due diligence and contact suppliers directly with any questions before making a purchase.",
    },
    {
      question: "What information should I look for in supplier reviews?",
      answer: "Look for reviews that mention product condition accuracy, shipping times, communication quality, and overall satisfaction. Reviews with photos are especially helpful. Pay attention to both positive and negative reviews to get a balanced view of the supplier's performance.",
    }
  ];
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaToJsonLd(faqSchema) }}
      />
      {children}
    </>
  );
}

