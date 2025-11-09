import clsx from 'clsx';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={clsx('mx-auto max-w-3xl space-y-3', {
        'text-center': align === 'center',
      })}
    >
      {eyebrow && <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">{eyebrow}</div>}
      <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h2>
      {description && <p className="text-sm text-slate-600 sm:text-base">{description}</p>}
    </div>
  );
}

