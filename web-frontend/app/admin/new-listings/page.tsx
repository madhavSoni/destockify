'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, SubmissionResponse, UpdateSubmissionPayload } from '@/lib/api';

export default function NewListingsPage() {
  const { authToken } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState<UpdateSubmissionPayload>({});

  useEffect(() => {
    if (authToken) {
      fetchSubmissions();
    }
  }, [authToken]);

  const fetchSubmissions = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      // Fetch only pending submissions for "New Listings"
      const result = await api.submissions.getAllAdmin(authToken, 'pending');
      setSubmissions(result.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      alert('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (submission: SubmissionResponse) => {
    setEditingId(submission.id);
    setEditForm({
      companyName: submission.companyName,
      companyAddress: submission.companyAddress,
      contactEmail: submission.contactEmail,
      contactPhone: submission.contactPhone || undefined,
      website: submission.website || undefined,
      description: submission.description,
      notes: submission.notes || undefined,
    });
  };

  const handleSave = async (id: number) => {
    if (!authToken) return;
    setSaving(true);
    try {
      // Use admin update endpoint which allows updating any submission
      await api.submissions.updateAdmin(id, editForm, authToken);
      await fetchSubmissions();
      setEditingId(null);
      setEditForm({});
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update submission';
      alert(errorMessage);
      console.error('Update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!authToken) return;
    if (!confirm('Are you sure you want to approve this listing? It will go live on the website.')) {
      return;
    }
    setApproving(id);
    try {
      await api.submissions.approve(id, authToken);
      await fetchSubmissions();
      alert('Listing approved and is now live!');
    } catch (error: any) {
      alert(error.message || 'Failed to approve submission');
    } finally {
      setApproving(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Listings</h1>
          <p className="mt-2 text-slate-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Listings</h1>
        <p className="mt-2 text-slate-600">Review and approve incoming listing submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">No pending submissions at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              {editingId === submission.id ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        value={editForm.companyName || ''}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email *</label>
                      <input
                        type="email"
                        value={editForm.contactEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Address *</label>
                    <input
                      type="text"
                      value={editForm.companyAddress || ''}
                      onChange={(e) => setEditForm({ ...editForm, companyAddress: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={editForm.contactPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={editForm.website || ''}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSave(submission.id)}
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{submission.companyName}</h3>
                      <p className="text-sm text-slate-600 mt-1">{submission.contactEmail}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      Pending
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Address:</span>
                      <p className="text-slate-600">{submission.companyAddress}</p>
                    </div>
                    {submission.contactPhone && (
                      <div>
                        <span className="font-medium text-slate-700">Phone:</span>
                        <p className="text-slate-600">{submission.contactPhone}</p>
                      </div>
                    )}
                    {submission.website && (
                      <div>
                        <span className="font-medium text-slate-700">Website:</span>
                        <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {submission.website}
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-slate-700">Submitted:</span>
                      <p className="text-slate-600">{new Date(submission.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-slate-700 text-sm">Description:</span>
                    <p className="text-slate-600 text-sm mt-1">{submission.description}</p>
                  </div>

                  {submission.notes && (
                    <div>
                      <span className="font-medium text-slate-700 text-sm">Notes:</span>
                      <p className="text-slate-600 text-sm mt-1">{submission.notes}</p>
                    </div>
                  )}

                  {submission.customer && (
                    <div className="text-xs text-slate-500">
                      Submitted by: {submission.customer.firstName} {submission.customer.lastName} ({submission.customer.email})
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleEdit(submission)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleApprove(submission.id)}
                      disabled={approving === submission.id}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {approving === submission.id ? 'Approving...' : 'Approve Listing'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
