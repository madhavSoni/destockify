'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

// ---------- Types ----------
type DashboardStats = {
  stats: {
    totalSuppliers: number;
    totalReviews: number;
    pendingReviews: number;
  };
  recentActivity: {
    suppliers: Array<{
      id: number;
      name: string;
      slug: string;
      createdAt: string;
    }>;
    reviews: Array<{
      id: number;
      title: string;
      rating: number;
      isApproved: boolean;
      createdAt: string;
      supplier: {
        id: number;
        name: string;
        slug: string;
      };
      reviewer: string;
    }>;
  };
};

const DEV_MOCK_DASHBOARD: DashboardStats = {
  stats: { totalSuppliers: 0, totalReviews: 0, pendingReviews: 0 },
  recentActivity: { suppliers: [], reviews: [] },
};

// ---------- Utilities ----------
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function classNames(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ');
}

// ---------- Small UI bits ----------
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-md bg-slate-200/60', className)} />;
}

function Badge({ color = 'slate', children }: { color?: 'slate' | 'amber' | 'green' | 'blue' | 'rose'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-800',
    amber: 'bg-amber-100 text-amber-900',
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-blue-100 text-blue-800',
    rose: 'bg-rose-100 text-rose-800',
  };
  return (
    <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', map[color])}>
      {children}
    </span>
  );
}

function EmptyState({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/60 py-10">
      <div className="text-sm text-slate-600">{title}</div>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

// ---------- Cards ----------
function StatCard({
  label,
  value,
  icon,
  accent = 'blue',
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: 'blue' | 'emerald' | 'amber';
  href?: string;
}) {
  const accentRing =
    accent === 'blue'
      ? 'ring-blue-100'
      : accent === 'emerald'
      ? 'ring-emerald-100'
      : 'ring-amber-100';

  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm font-medium text-slate-600">{label}</div>
        <div className={classNames('flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full ring-4 sm:ring-8', accentRing)}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-xl">
        {content}
      </Link>
    );
  }
  return content;
}

function StarRow({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div aria-label={`Rating ${r} out of 5`} className="inline-flex items-center gap-0.5">
      {new Array(5).fill(0).map((_, i) => (
        <svg
          key={i}
          className={classNames('h-4 w-4', i < r ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.953L10 0l2.949 5.957 6.562.953-4.755 4.635 1.122 6.545z" />
        </svg>
      ))}
    </div>
  );
}

// ---------- Page ----------
export default function AdminDashboard() {
  const { authToken } = useAuth();
  const initialData = authToken ? null : DEV_MOCK_DASHBOARD;
  const [data, setData] = useState<DashboardStats | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!!authToken);
  const [error, setError] = useState<string | null>(null);

  const hasData = useMemo(() => !!data, [data]);

  useEffect(() => {
    if (!authToken) return;

    setLoading(true);
    setError(null);
    api.admin
      .dashboard(authToken)
      .then(setData)
      .catch((e: any) => {
        console.error(e);
        setError('Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, [authToken]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600">Overview of your directory</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/companies/new"
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 text-center"
          >
            + Add Company
          </Link>
          <Link
            href="/admin/reviews?filter=pending"
            className="w-full sm:w-auto rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 text-center"
          >
            Review Queue
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : hasData ? (
          <>
            <StatCard
              label="Total Companies"
              value={data!.stats.totalSuppliers}
              icon={<svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2Zm2-4h14V7H5v10Zm2-8h10v6H7V9Zm7-6H10v2h4V3Z"/></svg>}
              accent="blue"
              href="/admin/companies"
            />
            <StatCard
              label="Total Reviews"
              value={data!.stats.totalReviews}
              icon={<svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24"><path d="M21 6h-2v9H7v2a1 1 0 0 0 1 1h9l4 4V7a1 1 0 0 0-1-1ZM17 2H3a1 1 0 0 0-1 1v14l4-4h11a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/></svg>}
              accent="emerald"
              href="/admin/reviews"
            />
            <StatCard
              label="Pending Reviews"
              value={data!.stats.pendingReviews}
              icon={<svg className="h-4 w-4 text-amber-600" viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"/></svg>}
              accent="amber"
              href="/admin/reviews?filter=pending"
            />
          </>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/admin/companies/new"
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 text-center"
          >
            ➕ Add Company
          </Link>
          <Link
            href="/admin/reviews"
            className="w-full sm:w-auto rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 text-center"
          >
            🗂️ View All Reviews
          </Link>
          <Link
            href="/admin/companies"
            className="w-full sm:w-auto rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 text-center"
          >
            ⚙️ Manage Companies
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Companies */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recently Added Companies</h2>
            <Link href="/admin/companies" className="text-sm font-medium text-blue-700 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : data!.recentActivity.suppliers.length === 0 ? (
            <EmptyState title="No companies added yet." actionHref="/admin/companies/new" actionLabel="Add your first company" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data!.recentActivity.suppliers.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 sm:gap-3 py-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/companies/${s.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
                        {s.name}
                      </Link>
                      <div className="text-xs text-slate-500">{timeAgo(s.createdAt)}</div>
                    </div>
                  </div>
                  <Badge color="blue">New</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reviews */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recently Submitted Reviews</h2>
            <Link href="/admin/reviews" className="text-sm font-medium text-blue-700 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : data!.recentActivity.reviews.length === 0 ? (
            <EmptyState title="No reviews yet." actionHref="/admin/reviews" actionLabel="Open reviews" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data!.recentActivity.reviews.slice(0, 6).map((r) => (
                <li key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-slate-900">{r.title || 'Untitled Review'}</div>
                      <StarRow rating={r.rating} />
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {r.reviewer} • {r.supplier.name} • {timeAgo(r.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!r.isApproved ? <Badge color="amber">Pending</Badge> : <Badge color="green">Approved</Badge>}
                    <Link
                      href={`/admin/reviews`}
                      className="text-sm font-medium text-blue-700 hover:underline whitespace-nowrap"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
