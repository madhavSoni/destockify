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
      {eyebrow && <div className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">{eyebrow}</div>}
      <h2 className="font-heading text-2xl font-semibold text-primary-900 sm:text-3xl">{title}</h2>
      {description && <p className="text-sm text-black/70 sm:text-base">{description}</p>}
    </div>
  );
}

