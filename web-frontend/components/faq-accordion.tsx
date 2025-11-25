type FaqItem = {
  question: string;
  answer: string;
  category?: string | null;
};

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <details
          key={`${faq.question}-${index}`}
          className="group rounded-md border border-black/10 bg-white p-5 transition hover:border-blue-600"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
            <div>
              <div className="font-semibold text-base text-black">{faq.question}</div>
              {faq.category && <div className="mt-1 text-xs font-normal uppercase tracking-wide text-black/50">{faq.category}</div>}
            </div>
            <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-black/10 bg-white text-black font-medium text-lg transition group-open:rotate-45 group-open:bg-blue-600 group-open:border-blue-600 group-open:text-white">
              +
            </span>
          </summary>
          <div className="mt-4 font-normal text-sm text-black/70 leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

