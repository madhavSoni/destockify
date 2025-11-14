'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type SupplierItem = {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  region: { name: string; slug: string } | null;
};

export default function CompaniesPage() {
  const { authToken } = useAuth();
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authToken) {
      api.suppliers
        .getAllAdmin(authToken, { search: search || undefined, limit: 100 })
        .then((result) => setSuppliers(result.items))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authToken, search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    if (!authToken) return;

    try {
      await api.suppliers.delete(id, authToken);
      setSuppliers(suppliers.filter((s) => s.id !== id));
    } catch (error) {
      alert('Failed to delete company');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="mt-2 text-slate-600">Manage all company listings</p>
        </div>
        <Link
          href="/admin/companies/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          ➕ Add Company
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                  Date Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-slate-900">{supplier.name}</div>
                      {supplier.region && (
                        <div className="text-xs text-slate-500">{supplier.region.name}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {supplier.email || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {supplier.averageRating ? `${supplier.averageRating.toFixed(1)}⭐` : '-'} (
                      {supplier.reviewCount})
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {new Date(supplier.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/admin/companies/${supplier.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

