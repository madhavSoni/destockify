'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const { authToken } = useAuth();
  const id = parseInt(params.id as string);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    heroImage: '',
    logoImage: '',
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!authToken || isNaN(id)) {
        setFetching(false);
        return;
      }

      try {
        const supplier = await api.suppliers.getByIdAdmin(id, authToken);
        setFormData({
          name: supplier.name || '',
          shortDescription: supplier.shortDescription || '',
          description: supplier.description || '',
          website: supplier.website || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          heroImage: supplier.heroImage || '',
          logoImage: supplier.logoImage || '',
        });
      } catch (error) {
        console.error('Failed to fetch supplier:', error);
        alert('Failed to load company data');
        router.push('/admin/companies');
      } finally {
        setFetching(false);
      }
    };

    fetchSupplier();
  }, [id, authToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setLoading(true);
    try {
      await api.suppliers.update(id, formData, authToken);
      router.push('/admin/companies');
    } catch (error: any) {
      alert(error.message || 'Failed to update company');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Company</h1>
          <p className="mt-2 text-slate-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Company</h1>
        <p className="mt-2 text-slate-600">Update company information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700">Company Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Short Description</label>
          <input
            type="text"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Company'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-slate-100 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

