'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function NewCompanyPage() {
  const router = useRouter();
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    heroImage: '',
    logoImage: '',
    minimumOrder: '',
    leadTime: '',
    specialties: [] as string[],
    certifications: [] as string[],
    badges: [] as string[],
    logisticsNotes: '',
    pricingNotes: '',
    trustScore: 0,
    isVerified: false,
    isScam: false,
    homeRank: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    setLoading(true);
    try {
      await api.suppliers.create(formData, authToken);
      router.push('/admin/companies');
    } catch (error: any) {
      alert(error.message || 'Failed to create company');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add Company</h1>
        <p className="mt-2 text-slate-600">Create a new company listing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Basic Information</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setFormData({ ...formData, name, slug });
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug (URL) *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="company-name"
              />
              <p className="mt-1 text-xs text-slate-500">Used in URL: /suppliers/{formData.slug || 'slug'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Short Description</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="One-line summary of the company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Full description of the company and its services"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Contact Information</h3>
          
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
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Images</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Logo Image URL</label>
              <input
                type="url"
                value={formData.logoImage}
                onChange={(e) => setFormData({ ...formData, logoImage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Hero Image URL</label>
              <input
                type="url"
                value={formData.heroImage}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Business Details</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Minimum Order</label>
              <input
                type="text"
                value={formData.minimumOrder}
                onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 1 pallet, $500, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Lead Time</label>
              <input
                type="text"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 2-3 days, 1 week, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Logistics Notes</label>
            <textarea
              value={formData.logisticsNotes}
              onChange={(e) => setFormData({ ...formData, logisticsNotes: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Shipping methods, delivery areas, freight details, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Pricing Notes</label>
            <textarea
              value={formData.pricingNotes}
              onChange={(e) => setFormData({ ...formData, pricingNotes: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Pricing structure, payment terms, volume discounts, etc."
            />
          </div>
        </div>

        {/* Tags & Classifications */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Tags & Classifications</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Specialties</label>
            <input
              type="text"
              value={formData.specialties.join(', ')}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Electronics, Apparel, Home Goods (comma-separated)"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple items with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Certifications</label>
            <input
              type="text"
              value={formData.certifications.join(', ')}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="ISO 9001, BBB Accredited, etc. (comma-separated)"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple items with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Badges</label>
            <input
              type="text"
              value={formData.badges.join(', ')}
              onChange={(e) => setFormData({ ...formData, badges: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Top Rated, Fast Shipping, etc. (comma-separated)"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple items with commas</p>
          </div>
        </div>

        {/* Status & Ranking */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Status & Ranking</h3>
          
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Trust Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.trustScore}
                onChange={(e) => setFormData({ ...formData, trustScore: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">0-100 score</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Home Page Rank</label>
              <input
                type="number"
                min="0"
                value={formData.homeRank}
                onChange={(e) => setFormData({ ...formData, homeRank: parseInt(e.target.value) || 0 })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">Higher = more prominent</p>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">✓ Verified Supplier</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isScam}
                onChange={(e) => setFormData({ ...formData, isScam: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-red-700">⚠️ Mark as Scam</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Company'}
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
