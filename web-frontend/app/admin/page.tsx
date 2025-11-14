'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

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

export default function AdminDashboard() {
  const { authToken } = useAuth();
  const initialData = authToken ? null : DEV_MOCK_DASHBOARD;
  const [data, setData] = useState<DashboardStats | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!!authToken);

  useEffect(() => {
    if (!authToken) return;

    setLoading(true);
    api.admin
      .dashboard(authToken)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authToken]);

  if (loading) {
    return <div className="text-slate-600">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-600">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Overview of your directory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-slate-900">{data.stats.totalSuppliers}</div>
          <div className="mt-2 text-sm text-slate-600">Total Companies</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-slate-900">{data.stats.totalReviews}</div>
          <div className="mt-2 text-sm text-slate-600">Total Reviews</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-bold text-slate-900">{data.stats.pendingReviews}</div>
          <div className="mt-2 text-sm text-slate-600">Pending Reviews</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/admin/companies/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            ➕ Add Company
          </Link>
          <Link
            href="/admin/reviews"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            🗂️ View All Reviews
          </Link>
          <Link
            href="/admin/companies"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            ⚙️ Manage Companies
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recently Added Companies</h2>
          <div className="mt-4 space-y-3">
            {data.recentActivity.suppliers.length === 0 ? (
              <p className="text-sm text-slate-500">No companies added yet</p>
            ) : (
              data.recentActivity.suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <Link
                      href={`/admin/companies/${supplier.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {supplier.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recently Submitted Reviews</h2>
          <div className="mt-4 space-y-3">
            {data.recentActivity.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews submitted yet</p>
            ) : (
              data.recentActivity.reviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="font-medium text-slate-900">{review.title || 'Untitled Review'}</div>
                    <div className="text-xs text-slate-500">
                      {review.reviewer} • {review.supplier.name} • {review.rating}⭐
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                      {!review.isApproved && (
                        <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-amber-800">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
