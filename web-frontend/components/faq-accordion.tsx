import type { FaqItem } from '@/lib/api';

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <details
          key={`${faq.question}-${index}`}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left">
            <div>
              <div className="text-sm font-semibold text-slate-900">{faq.question}</div>
              {faq.category && <div className="text-xs uppercase tracking-wide text-slate-400">{faq.category}</div>}
            </div>
            <span className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-4 text-sm text-slate-600 leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

