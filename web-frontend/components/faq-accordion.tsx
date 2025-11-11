import type { FaqItem } from '@/lib/api';

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <details
          key={`${faq.question}-${index}`}
          className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
            <div>
              <div className="font-semibold text-base text-slate-900">{faq.question}</div>
              {faq.category && <div className="mt-1 text-xs font-normal uppercase tracking-wide text-slate-500">{faq.category}</div>}
            </div>
            <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 font-medium text-lg transition group-open:rotate-45 group-open:bg-blue-50 group-open:border-blue-200 group-open:text-blue-600">
              +
            </span>
          </summary>
          <div className="mt-4 font-normal text-sm text-slate-700 leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

