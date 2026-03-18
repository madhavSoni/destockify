'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

  // Debounce search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch users list
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

  // Fetch user detail on expand
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Accounts</h1>
        <p className="mt-1 text-sm text-slate-600">View all registered accounts and their activity</p>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          {debouncedSearch ? 'No users match your search.' : 'No users found.'}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Reviews</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Submissions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isExpanded={expandedUserId === user.id}
                    onToggle={() => toggleExpand(user.id)}
                    detail={expandedUserId === user.id ? userDetail : null}
                    detailLoading={expandedUserId === user.id && detailLoading}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {startItem}–{endItem} of {pagination.total} users
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center px-2 text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UserRow({
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
  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
          <div className="flex items-center gap-2">
            {user.firstName} {user.lastName}
            {user.isAdmin && (
              <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                Admin
              </span>
            )}
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{user.email}</td>
        <td className="whitespace-nowrap px-4 py-3 text-sm">
          {user.isVerified ? (
            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              Verified
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
              Unverified
            </span>
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{user._count.reviews}</td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{user._count.submissions}</td>
        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-4 py-4">
            {detailLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">Loading details...</div>
            ) : detail ? (
              <ExpandedUserDetail detail={detail} />
            ) : null}
          </td>
        </tr>
      )}
    </>
  );
}

function ExpandedUserDetail({ detail }: { detail: UserDetail }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Reviews Section */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Reviews ({detail.reviews.length})
        </h4>
        {detail.reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-2">
            {detail.reviews.map((review) => (
              <div key={review.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{review.supplier.name}</span>
                  <div className="flex items-center gap-2">
                    {review.isApproved ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{'★'.repeat(review.ratingOverall)}{'☆'.repeat(5 - review.ratingOverall)}</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.body && (
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">{review.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submissions Section */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Business Submissions ({detail.submissions.length})
        </h4>
        {detail.submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {detail.submissions.map((submission) => (
              <div key={submission.id} className="rounded-md border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{submission.companyName}</span>
                  <StatusBadge status={submission.status} />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(submission.createdAt).toLocaleDateString()}
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
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const className = styles[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
