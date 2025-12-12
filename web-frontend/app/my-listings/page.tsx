'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, SubmissionResponse } from '@/lib/api';

type ApprovedSupplier = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoImage?: string | null;
  createdAt: string;
};

export default function MyListingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, authToken } = useAuth();
  const router = useRouter();
  
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [approvedSuppliers, setApprovedSuppliers] = useState<ApprovedSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'submissions'>('live');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Authentication removed - show message if not logged in

  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all submissions
        const submissionsData = await api.submissions.getMySubmissions(authToken);
        setSubmissions(submissionsData);
        
        // Extract approved submissions that have been converted to suppliers
        // Note: In a full implementation, you'd want a backend endpoint that returns
        // the suppliers owned by this customer
        const approved = submissionsData
          .filter(s => s.status === 'approved')
          .map(s => ({
            id: s.id,
            name: s.companyName,
            slug: s.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: s.description,
            logoImage: s.logoUrl,
            createdAt: s.createdAt,
          }));
        
        setApprovedSuppliers(approved);
      } catch (err: any) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchData();
    }
  }, [authToken]);

  const handleDelete = async (submissionId: number, companyName: string) => {
    setSubmissionToDelete({ id: submissionId, name: companyName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!submissionToDelete || !authToken) return;
    
    setIsDeleting(true);
    try {
      await api.submissions.delete(submissionToDelete.id, authToken);
      setSubmissions(prev => prev.filter(s => s.id !== submissionToDelete.id));
      setShowDeleteModal(false);
      setSubmissionToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete submission');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-medium text-amber-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-1 text-sm font-medium text-green-700">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Approved & Live
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1 text-sm font-medium text-red-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rejected
          </span>
        );
      default:
        return <span className="text-sm text-slate-600">{status}</span>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">My Listings Not Available</h2>
          <p className="text-slate-600 mb-6">
            You need to be logged in to view your listings.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <span className="font-semibold text-slate-900">My Listings</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">My Business Listings</h1>
          <p className="text-slate-600 max-w-3xl">
            Manage your approved supplier listings and track submission status. Your approved listings appear in the public directory and can receive customer reviews.
          </p>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link
            href="/submit-listing"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit New Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-3 px-1 font-semibold text-sm transition-colors ${
              activeTab === 'live'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Listings ({approvedSuppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-1 font-semibold text-sm transition-colors ${
              activeTab === 'submissions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submissions ({pendingSubmissions.length + rejectedSubmissions.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Live Listings Tab */}
        {activeTab === 'live' && (
          <div>
            {approvedSuppliers.length === 0 ? (
              <div className="text-center py-12 rounded-lg border border-slate-200 bg-white">
                <svg className="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Live Listings Yet</h3>
                <p className="text-slate-600 mb-6">You don't have any approved listings yet. Submit a listing to get started!</p>
                <Link
                  href="/submit-listing"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Submit Your First Listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {approvedSuppliers.map((supplier) => (
                  <div key={supplier.id} className="rounded-lg border border-slate-200 bg-white p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {supplier.logoImage ? (
                        <div className="h-16 w-16 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                          <img src={supplier.logoImage} alt={supplier.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-blue-600">{supplier.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{supplier.name}</h3>
                      </div>
                    </div>
                    
                    {supplier.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {supplier.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/suppliers/${supplier.slug}`}
                        className="flex-1 text-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Public Page
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Pending Submissions */}
            {pendingSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Pending Review</h2>
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-lg border border-slate-200 bg-white p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{submission.companyName}</h3>
                          <p className="text-sm text-slate-600">{submission.contactEmail}</p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {submission.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <span>Submitted {new Date(submission.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/submit-listing?edit=${submission.id}`}
                          className="flex-1 text-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(submission.id, submission.companyName)}
                          className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Submissions */}
            {rejectedSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Rejected</h2>
                <div className="space-y-4">
                  {rejectedSubmissions.map((submission) => (
                    <div key={submission.id} className="rounded-lg border border-slate-200 bg-white p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{submission.companyName}</h3>
                          <p className="text-sm text-slate-600">{submission.contactEmail}</p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      {submission.adminNotes && (
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <p className="text-sm font-medium text-amber-900 mb-1">Admin Feedback:</p>
                          <p className="text-sm text-amber-800">{submission.adminNotes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <span>Reviewed {submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>

                      <Link
                        href="/submit-listing"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        Submit New Listing
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingSubmissions.length === 0 && rejectedSubmissions.length === 0 && (
              <div className="text-center py-12 rounded-lg border border-slate-200 bg-white">
                <svg className="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Submissions</h3>
                <p className="text-slate-600">You don't have any submissions under review at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && submissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg border border-slate-200 shadow-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Submission</h3>
                <p className="text-slate-600 mb-1">
                  Are you sure you want to delete <span className="font-semibold text-slate-900">{submissionToDelete.name}</span>?
                </p>
                <p className="text-sm text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-red-300 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
