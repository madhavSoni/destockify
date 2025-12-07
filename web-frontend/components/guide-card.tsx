import Link from 'next/link';
type GuideSummary = {
  slug: string;
  title: string;
  intro?: string | null;
  categories?: Array<{ slug: string; name: string }> | null;
};

export function GuideCard({ guide }: { guide: GuideSummary }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex h-full flex-col justify-between rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lift"
    >
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
          Insight
        </div>
        <h3 className="font-heading mt-3 text-xl font-semibold text-black group-hover:text-blue-600">{guide.title}</h3>
        {guide.intro && <p className="mt-3 text-sm text-black/70">{guide.intro}</p>}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm font-medium text-black">
        Read guide
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-black text-white transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

