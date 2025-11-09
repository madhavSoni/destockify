import Link from 'next/link';
import type { GuideSummary } from '@/lib/api';

export function GuideCard({ guide }: { guide: GuideSummary }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
          Insight
          {guide.isFeatured && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">Featured</span>
          )}
        </div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-slate-700">{guide.title}</h3>
        {guide.excerpt && <p className="mt-3 text-sm text-slate-600">{guide.excerpt}</p>}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-medium text-slate-800">
        Read guide
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

