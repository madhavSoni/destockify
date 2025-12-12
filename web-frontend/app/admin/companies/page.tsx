'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

interface SupplierSummary {
  id: number;
  name: string;
  slug: string;
  email?: string | null;
  isVerified: boolean;
  isScam: boolean;
  createdAt: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  region?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export default function CompaniesPage() {
  const router = useRouter();
  const { authToken } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (authToken) {
      setLoading(true);
      api.admin.suppliers
        .list(authToken, { search: search || undefined, limit: 100 })
        .then((result) => setSuppliers(result.items || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-600">Manage suppliers and companies</p>
        </div>
        <Link
          href="/admin/companies/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Supplier
        </Link>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Region</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/companies/${supplier.id}`)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {supplier.region?.name || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {[supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {supplier.isVerified && (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          Verified
                        </span>
                      )}
                      {supplier.isScam && (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                          Scam
                        </span>
                      )}
                      {!supplier.isVerified && !supplier.isScam && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/companies/${supplier.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal({ id: supplier.id, name: supplier.name })}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Company</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <strong>{showDeleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deletingId === showDeleteModal.id}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!authToken || !showDeleteModal) return;
                  setDeletingId(showDeleteModal.id);
                  try {
                    await api.suppliers.delete(showDeleteModal.id, authToken);
                    setSuppliers(suppliers.filter(s => s.id !== showDeleteModal.id));
                    setShowDeleteModal(null);
                  } catch (error: any) {
                    alert(error.message || 'Failed to delete company');
                  } finally {
                    setDeletingId(null);
                  }
                }}
                disabled={deletingId === showDeleteModal.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === showDeleteModal.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
