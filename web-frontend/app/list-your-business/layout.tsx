import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Business',
  description: 'List your liquidation or wholesale business on Find Liquidation. Get discovered by buyers searching for trusted suppliers across the United States.',
  alternates: { canonical: '/list-your-business' },
  openGraph: {
    title: 'List Your Business | Find Liquidation',
    description: 'Get your liquidation business discovered by buyers on Find Liquidation.',
    url: 'https://findliquidation.com/list-your-business',
    siteName: 'Find Liquidation',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
