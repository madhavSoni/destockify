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
    <article className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">Buyer Review</div>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{review.title}</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
          ★ {review.ratingOverall.toFixed(1)}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">"{review.body}"</p>

      {review.highlights && review.highlights.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2 text-xs text-emerald-700">
          {review.highlights.map((highlight) => (
            <li key={highlight} className="rounded-full bg-emerald-50 px-3 py-1">
              {highlight}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="font-medium text-slate-800">
          {review.author} {review.company ? `· ${review.company}` : ''}
        </div>
        <div>{formatDate(review.publishedAt)}</div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">Supplier</div>
          <div className="text-sm font-semibold text-slate-900">{review.supplier.name}</div>
        </div>
        <Link
          href={`/suppliers/${review.supplier.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          View profile →
        </Link>
      </div>
    </article>
  );
}

