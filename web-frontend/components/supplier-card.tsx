import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import type { SupplierSummary } from '@/lib/api';

export function SupplierCard({ 
  supplier, 
  variant = 'default',
  className = '',
}: { 
  supplier: SupplierSummary; 
  variant?: 'default' | 'compact';
  className?: string;
}) {
  return (
    <Link
      href={`/suppliers/${supplier.slug}`}
      className={clsx(
        'group relative flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition-all duration-300 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 h-full',
        variant === 'compact' ? 'lg:flex-row lg:h-48' : '',
        className
      )}
    >
      {/* Image Area - Increased aspect ratio for better visual impact */}
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700',
          variant === 'compact' ? 'h-40 lg:h-full lg:w-2/5' : 'aspect-[4/3]'
        )}
      >
        {supplier.heroImage ? (
          <>
            <Image
              src={supplier.heroImage}
              alt={supplier.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-110"
              priority={variant === 'compact'}
            />
            {/* Subtle gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
            {supplier.name}
          </div>
        )}
        
        {/* Status Badges - Top Right */}
        {supplier.flags && supplier.flags.length > 0 && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            {supplier.flags.map((flag, idx) => (
              <div
                key={idx}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-semibold border shadow-lg backdrop-blur-sm',
                  flag.variant === 'verified'
                    ? 'bg-blue-600/95 text-white border-blue-700'
                    : 'bg-black/95 text-white border-black/80'
                )}
              >
                {flag.variant === 'verified' ? '✓' : '⚠'} {flag.text}
              </div>
            ))}
          </div>
        )}
        
        {/* Logo - Bottom Left Overlay */}
        {supplier.logoImage && (
          <div className="absolute bottom-3 left-3 z-10 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border-2 border-white/90 bg-white/95 shadow-xl backdrop-blur-sm">
            <Image
              src={supplier.logoImage}
              alt={`${supplier.name} logo`}
              width={56}
              height={56}
              className="h-full w-full object-contain p-1.5"
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Top Content Section - Fixed height area */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Company Name - Bold Typography */}
          <div>
            <h3 className="text-lg font-bold text-black leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {supplier.name}
            </h3>
            {/* City and State */}
            {(supplier.city || supplier.state) && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-black/70">
                <svg className="w-4 h-4 text-black/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">
                  {[supplier.city, supplier.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Categories - Subtle Tags */}
          {supplier.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {supplier.categories.slice(0, 2).map((category) => (
                <span
                  key={category.slug}
                  className="inline-flex items-center rounded-md bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60"
                >
                  {category.name}
                </span>
              ))}
              {supplier.categories.length > 2 && (
                <span className="inline-flex items-center rounded-md bg-black/5 px-2.5 py-1 text-xs font-medium text-black/40">
                  +{supplier.categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer - Clear CTA - Fixed position at bottom */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5">
          <span className="text-sm font-semibold text-black/70 group-hover:text-blue-600 transition-colors">
            View Profile
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm transition-transform group-hover:translate-x-1 group-hover:bg-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

