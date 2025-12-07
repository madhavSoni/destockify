'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense} from 'react';
import Link from 'next/link';
import { api, CreateSubmissionPayload } from '@/lib/api';

function SubmitListingForm() {
  const { isAuthenticated, isLoading: authLoading, authToken } = useAuth();
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const isEditMode = !!editId;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    setEditId(sp.get('edit'));
  }, []);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // File uploads (UI only, not connected to backend yet)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  // Social media
  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
    twitter: '',
    youtube: '',
    other: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load existing submission data when in edit mode
  useEffect(() => {
    const loadSubmission = async () => {
      if (!isEditMode || !editId || !authToken) return;

      try {
        setIsLoadingData(true);
        const submission = await api.submissions.getById(parseInt(editId), authToken);
        
        // Populate form with existing data
        setCompanyName(submission.companyName);
        setCompanyAddress(submission.companyAddress);
        setContactEmail(submission.contactEmail);
        setContactPhone(submission.contactPhone || '');
        setWebsite(submission.website || '');
        setDescription(submission.description);
        setNotes(submission.notes || '');
        
        // Set social media if it exists
        if (submission.socialMedia) {
          setSocialMedia(submission.socialMedia);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load submission');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (authToken && isEditMode) {
      loadSubmission();
    }
  }, [isEditMode, editId, authToken]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authToken) {
      setError('You must be logged in to submit a listing');
      return;
    }

    // Validate required fields
    if (!companyName || !companyAddress || !contactEmail || !description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare payload (without file uploads for now)
      const payload: CreateSubmissionPayload = {
        companyName,
        companyAddress,
        contactEmail,
        contactPhone: contactPhone || undefined,
        website: website || undefined,
        description,
        notes: notes || undefined,
        // Social media (only include if at least one field is filled)
        socialMedia: Object.values(socialMedia).some(val => val) 
          ? socialMedia 
          : undefined,
      };

      if (isEditMode && editId) {
        // Update existing submission
        await api.submissions.update(parseInt(editId), payload, authToken);
      } else {
        // Create new submission
        await api.submissions.create(payload, authToken);
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit listing');
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-black/70">{isLoadingData ? 'Loading submission...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-md bg-blue-600">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">
            {isEditMode ? 'Changes Saved!' : 'Submission Successful!'}
          </h2>
          <p className="text-black/70 mb-6">
            {isEditMode 
              ? 'Your listing changes have been saved and will be reviewed by our team.'
              : 'Your listing has been submitted for review. Our team will review it within 2 business days.'
            }
          </p>
          <Link
            href="/my-listings"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            View My Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm font-medium text-black/70">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/my-listings" className="hover:text-blue-600 transition-colors">My Listings</Link>
          <span className="mx-2">›</span>
          <span className="font-semibold text-black">{isEditMode ? 'Edit' : 'Submit'} Listing</span>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-primary-900 mb-3">
            {isEditMode ? 'Edit Your Business Listing' : 'Submit Your Business Listing'}
          </h1>
          <p className="text-black/70 max-w-2xl mx-auto">
            {isEditMode
              ? 'Update your company details below. Changes will be reviewed by our team.'
              : 'Fill out the form below with your company details and proof of ownership. Your submission will be reviewed by our team before it appears publicly.'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-black">
              {error}
            </div>
          )}

          {/* Basic Information */}
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

          {/* Contact Details */}
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

          {/* Branding */}
          <div className="rounded-md border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="font-heading text-xl font-semibold text-primary-900 mb-4">Branding</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="h-24 w-24 rounded-md border border-slate-200 overflow-hidden">
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-black/70 file:mr-4 file:rounded-md file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-slate-50"
                    />
                    <p className="mt-1 text-xs text-black/50">PNG, JPG up to 5MB (Square images work best)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Banner Image
                </label>
                <div className="space-y-4">
                  {bannerPreview && (
                    <div className="w-full h-48 rounded-md border border-slate-200 overflow-hidden">
                      <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="block w-full text-sm text-black/70 file:mr-4 file:rounded-md file:border file:border-black/10 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-black/5"
                  />
                  <p className="text-xs text-black/50">PNG, JPG up to 5MB (Recommended: 1200x400px)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-md border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="font-heading text-xl font-semibold text-primary-900 mb-4">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(socialMedia).map((platform) => (
                <div key={platform}>
                  <label htmlFor={platform} className="block text-sm font-medium text-black mb-1 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    id={platform}
                    value={socialMedia[platform as keyof typeof socialMedia]}
                    onChange={(e) => setSocialMedia(prev => ({
                      ...prev,
                      [platform]: e.target.value
                    }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder={`https://...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ownership Proof */}
          <div className="rounded-md border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="font-heading text-xl font-semibold text-primary-900 mb-4">
              Proof of Ownership <span className="text-black">*</span>
            </h2>
            <p className="text-sm text-black/70 mb-4">
              Upload documents proving you own or represent this business (Tax ID, business license, 
              incorporation documents, official letterhead, etc.)
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleDocumentsChange}
              className="block w-full text-sm text-black/70 file:mr-4 file:rounded-md file:border file:border-black/10 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-black/5"
            />
            <p className="mt-2 text-xs text-black/50">Accepted: PDF, JPG, PNG (up to 10MB each)</p>
            
            {documentFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-black">Uploaded documents:</p>
                {documentFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-black">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-black hover:text-blue-600 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Notes */}
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

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/my-listings"
              className="text-sm font-medium text-black/70 hover:text-blue-600 transition-colors"
            >
              ← Back
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-black/20 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (isEditMode ? 'Saving...' : 'Submitting...') 
                : (isEditMode ? 'Save Changes' : 'Submit for Review')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubmitListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-black/70">Loading...</p>
        </div>
      </div>
    }>
      <SubmitListingForm />
    </Suspense>
  );
}
