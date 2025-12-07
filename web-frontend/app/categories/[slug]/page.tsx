import { permanentRedirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Permanent redirect from /categories/[slug] to /[slug] to enforce root slug structure
export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/${slug}`);
}
