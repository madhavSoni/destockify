import Link from 'next/link';
import type { ReviewHighlight } from '@/lib/api';

function formatDate(input?: string | Date) {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ReviewCard({ review }: { review: ReviewHighlight }) {
  return (
    <article className="flex h-full flex-col justify-between rounded-md border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-blue-600">Buyer Review</div>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-blue-600/10 px-3 py-1 text-sm font-semibold text-blue-600">
          ★ {review.ratingOverall.toFixed(1)}
        </div>
      </div>

      <p className="mt-4 text-sm text-black/70">"{review.body}"</p>

      <div className="mt-6 border-t border-black/5 pt-4 text-sm text-black/50">
        <div className="font-medium text-black">
          {review.author}
        </div>
        <div>{formatDate(review.publishedAt)}</div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-md bg-black/5 p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-black/50">Supplier</div>
          <div className="text-sm font-semibold text-black">{review.supplier.name}</div>
        </div>
        <Link
          href={`/suppliers/${review.supplier.slug}`}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90"
        >
          View profile →
        </Link>
      </div>
    </article>
  );
}

