import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Business Listing',
  description: 'Submit your liquidation or wholesale business listing for review on Find Liquidation.',
  alternates: { canonical: '/submit-listing' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
