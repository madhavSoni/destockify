'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    reviews: number;
    submissions: number;
  };
}

interface UserDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  reviews: Array<{
    id: number;
    author: string;
    ratingOverall: number;
    body: string;
    isApproved: boolean;
    createdAt: string;
    supplier: { id: number; name: string; slug: string };
  }>;
  submissions: Array<{
    id: number;
    companyName: string;
    status: string;
    createdAt: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const { authToken } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    if (!authToken) return;
    setLoading(true);
    api.admin.users
      .list(authToken, { search: debouncedSearch || undefined, page, limit: 20 })
      .then((result) => {
        setUsers(result.items || []);
        setPagination(result.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authToken, debouncedSearch, page]);

  useEffect(() => {
    if (!authToken || expandedUserId === null) {
      setUserDetail(null);
      return;
    }
    setDetailLoading(true);
    api.admin.users
      .get(expandedUserId, authToken)
      .then((detail) => setUserDetail(detail))
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  }, [authToken, expandedUserId]);

  const toggleExpand = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const startItem = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User Accounts</h1>
        <p className="mt-1 text-sm text-gray-500">
          {pagination ? `${pagination.total} registered account${pagination.total !== 1 ? 's' : ''}` : 'View all registered accounts and their activity'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-gray-400">Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">
            {debouncedSearch ? 'No users match your search' : 'No users found'}
          </p>
          {debouncedSearch && (
            <button onClick={() => setSearch('')} className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Cards */}
          <div className="space-y-2">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isExpanded={expandedUserId === user.id}
                onToggle={() => toggleExpand(user.id)}
                detail={expandedUserId === user.id ? userDetail : null}
                detailLoading={expandedUserId === user.id && detailLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{startItem}</span> to{' '}
                <span className="font-medium text-gray-700">{endItem}</span> of{' '}
                <span className="font-medium text-gray-700">{pagination.total}</span> users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm text-gray-500">Page</span>
                  <span className="text-sm font-medium text-gray-900">{pagination.page}</span>
                  <span className="text-sm text-gray-500">of {pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserCard({
  user,
  isExpanded,
  onToggle,
  detail,
  detailLoading,
}: {
  user: UserSummary;
  isExpanded: boolean;
  onToggle: () => void;
  detail: UserDetail | null;
  detailLoading: boolean;
}) {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className={`rounded-lg border bg-white shadow-sm transition-all ${isExpanded ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow'}`}>
      {/* Main row */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer"
      >
        {/* Avatar */}
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
          {initials}
        </div>

        {/* Name + Email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </span>
            {user.isAdmin && (
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                Admin
              </span>
            )}
            {user.isVerified ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-inset ring-gray-500/10">
                Unverified
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500 truncate">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="hidden items-center gap-6 sm:flex">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 tabular-nums">{user._count.reviews}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 tabular-nums">{user._count.submissions}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">Submissions</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">Joined</div>
          </div>
        </div>

        {/* Expand chevron */}
        <div className="flex-shrink-0 ml-2">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Mobile stats (visible below sm) */}
      {!isExpanded && (
        <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2 sm:hidden">
          <span className="text-xs text-gray-500">{user._count.reviews} reviews</span>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">{user._count.submissions} submissions</span>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      )}

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-400">Loading details...</div>
            </div>
          ) : detail ? (
            <ExpandedUserDetail detail={detail} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ExpandedUserDetail({ detail }: { detail: UserDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Reviews */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">
            Reviews
          </h4>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 tabular-nums">
            {detail.reviews.length}
          </span>
        </div>
        {detail.reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
            <p className="text-xs text-gray-400">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {detail.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/companies/${review.supplier.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {review.supplier.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-amber-500 text-xs tracking-tight">
                        {'★'.repeat(review.ratingOverall)}
                        <span className="text-gray-300">{'★'.repeat(5 - review.ratingOverall)}</span>
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {review.isApproved ? (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      Pending
                    </span>
                  )}
                </div>
                {review.body && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-600 line-clamp-2">{review.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submissions */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">
            Business Submissions
          </h4>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 tabular-nums">
            {detail.submissions.length}
          </span>
        </div>
        {detail.submissions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
            <p className="text-xs text-gray-400">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {detail.submissions.map((submission) => (
              <div key={submission.id} className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-gray-900">{submission.companyName}</span>
                  <StatusBadge status={submission.status} />
                </div>
                <div className="mt-1.5 text-[11px] text-gray-400">
                  Submitted {new Date(submission.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; ring: string }> = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/20' },
  };
  const style = config[status] || { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-500/10' };
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}>
      {status}
    </span>
  );
}
