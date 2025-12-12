'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionHeading } from '@/components/section-heading';
import { useAuth } from '@/contexts/AuthContext';
import { api, CreateSubmissionPayload } from '@/lib/api';

export default function ListYourBusinessPage() {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { authToken } = useAuth();

  // Form state for Add New Listing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName || !companyAddress || !contactEmail || !description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateSubmissionPayload = {
        companyName,
        companyAddress,
        contactEmail,
        contactPhone: contactPhone || undefined,
        website: website || undefined,
        description,
        notes: notes || undefined,
      };

      if (authToken) {
        await api.submissions.create(payload, authToken);
      } else {
        // For anonymous submissions, show message to contact directly
        setError('Please contact listings@findliquidation.com to submit a listing, or log in to submit online.');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit listing');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-md bg-blue-600">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">
            Your listing has been submitted!
          </h2>
          <p className="text-black/70 mb-6">
            A sales representative will contact you within 24 hours to verify and approve your listing. Thank you!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm font-medium text-black/70 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold text-primary-900 mb-3">
              Add a New Listing
            </h1>
            <p className="text-black/70 max-w-2xl mx-auto">
              Fill out the form below with your company details. Your submission will be reviewed by our team.
            </p>
          </div>

          <form onSubmit={handleAddListingSubmit} className="space-y-8">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-black">
                {error}
              </div>
            )}

            <div className="rounded-md border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="font-heading text-xl font-semibold text-primary-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-black mb-1">
                    Company Name <span className="text-black">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="companyAddress" className="block text-sm font-medium text-black mb-1">
                    Company Address <span className="text-black">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="123 Main St, City, State, ZIP"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
                    Company Description <span className="text-black">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Describe your products, services, and what makes your business unique..."
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="font-heading text-xl font-semibold text-primary-900 mb-4">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-black mb-1">
                    Contact Email <span className="text-black">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-black mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-black mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="font-heading text-xl font-semibold text-primary-900 mb-4">Additional Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-black/10 px-4 py-2 text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Any additional information you'd like to share with our review team..."
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-sm font-medium text-black/70 hover:text-blue-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-black/20 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="For Suppliers"
          title="List Your Business on Find Liquidation"
          description="Choose how you'd like to get started"
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Claim Your Listing Button */}
          <button
            onClick={() => setShowClaimModal(true)}
            className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 text-left"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Claim Your Listing</h3>
              <p className="text-sm text-slate-600">
                Already have a listing? Claim edit rights to manage your business profile.
              </p>
            </div>
          </button>

          {/* Add a New Listing Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 text-left"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Add a New Listing</h3>
              <p className="text-sm text-slate-600">
                Submit your business to be listed on Find Liquidation. Our team will review and approve.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Claim Your Listing Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Claim Your Listing</h3>
            <p className="text-sm text-slate-600 mb-6">
              Email us to claim edit rights on your listing.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClaimModal(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
              <a
                href="mailto:listings@findliquidation.com?subject=Claim My Listing"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
