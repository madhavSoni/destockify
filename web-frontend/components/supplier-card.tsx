import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import type { SupplierSummary } from '@/lib/api';

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const starColor = "#FBBF24"; // Yellow color
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < fullStars;
        const isHalf = i === fullStars && hasHalf;
        
        return (
          <svg
            key={i}
            className="w-4 h-4"
            fill={isFilled ? starColor : isHalf ? starColor : "none"}
            stroke={starColor}
            strokeWidth={isFilled || isHalf ? 0 : 1.5}
            viewBox="0 0 24 24"
          >
            {isHalf ? (
              <>
                <defs>
                  <linearGradient id={`half-card-${i}`}>
                    <stop offset="50%" stopColor={starColor} />
                    <stop offset="50%" stopColor="white" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-card-${i})`}
                  stroke={starColor}
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </>
            ) : (
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

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
        'group relative flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 h-full',
        variant === 'compact' ? 'lg:flex-row lg:h-48' : '',
        className
      )}
    >
      {/* Image Area - More compact, vertically shorter */}
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700',
          variant === 'compact' ? 'h-32 lg:h-full lg:w-2/5' : 'h-48'
        )}
      >
        {supplier.heroImage ? (
          <>
            <Image
              src={supplier.heroImage}
              alt={supplier.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              priority={variant === 'compact'}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-white/80">
            {supplier.name}
          </div>
        )}
        
        {/* Status Badges - Top Right */}
        {supplier.flags && supplier.flags.length > 0 && (
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {supplier.flags.map((flag, idx) => (
              <div
                key={idx}
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-semibold border shadow-lg backdrop-blur-sm',
                  flag.variant === 'verified'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700'
                    : 'bg-black/95 text-white border-black/80'
                )}
              >
                {flag.variant === 'verified' ? '✓' : '⚠'} {flag.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Area - More compact */}
      <div className="flex flex-1 flex-col p-4">
        {/* Company Name */}
        <h3 className="text-base font-bold text-black leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {supplier.name}
        </h3>

        {/* Star Rating */}
        {supplier.ratingAverage !== null && supplier.ratingAverage !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={supplier.ratingAverage} />
            <span className="text-sm font-semibold text-black">
              {supplier.ratingAverage.toFixed(1)}
            </span>
          </div>
        )}

        {/* Categories - Subtle Tags */}
        {supplier.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {supplier.categories.slice(0, 2).map((category) => (
              <span
                key={category.slug}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
              >
                {category.name}
              </span>
            ))}
            {supplier.categories.length > 2 && (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                +{supplier.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

