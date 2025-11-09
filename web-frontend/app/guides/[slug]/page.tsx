import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SectionHeading } from '@/components/section-heading';

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = await api.guides.get(params.slug).catch(() => null);

  if (!guide) {
    notFound();
  }

  const sections = Array.isArray(guide.sections) ? (guide.sections as GuideSection[]) : [];

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <Link href="/guides" className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 hover:text-blue-800">
            ← Guides
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">{guide.title}</h1>
          {guide.intro && <p className="mt-4 text-sm text-slate-600">{guide.intro}</p>}
          {guide.categories && guide.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              {guide.categories.map((category) => (
                <span key={category.slug} className="rounded-full bg-slate-100 px-3 py-1">
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <article className="mt-10 space-y-8">
          {sections.map((section, index) => (
            <section key={`${section.heading}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeading title={section.heading} description={section.body} />
              {section.checklist && section.checklist.length > 0 && (
                <ul className="mt-4 list-inside list-disc text-sm text-slate-600">
                  {section.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Looking for help implementing this playbook? Book a consult with the Destockify sourcing team and we’ll map it to
          your buying plan.
        </div>
      </div>
    </div>
  );
}

type GuideSection = {
  heading: string;
  body?: string;
  checklist?: string[];
};
