'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await api.auth.verifyEmail(token);
        setStatus('success');
        setMessage(result.message);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. The link may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-md border-2 border-black/10 bg-white shadow-md p-8 sm:p-10 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-md bg-blue-600/10 border-2 border-black/10">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-md animate-spin"></div>
              </div>
              <h1 className="font-black text-3xl sm:text-4xl text-black mb-3">
                Verifying Email...
              </h1>
              <p className="font-medium text-base text-black/70">
                Please wait while we verify your email address
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-md border-2 border-black/10 bg-white shadow-md p-8 sm:p-10 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-md bg-blue-600/10 border-2 border-black/10">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-black text-3xl sm:text-4xl text-black mb-3">
                Email Verified!
              </h1>
              <p className="font-medium text-base text-black/70 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                href="/login"
                className="font-bold inline-block px-6 py-3 rounded-md bg-blue-600 text-white text-base hover:bg-blue-700 transition-all duration-200"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-md border-2 border-black/10 bg-white shadow-md p-8 sm:p-10 animate-in fade-in duration-500">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-md bg-black/5 border-2 border-black/10">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-black text-3xl sm:text-4xl text-black mb-3">
              Verification Failed
            </h1>
            <p className="font-medium text-base text-black/70 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="font-bold inline-block px-6 py-3 rounded-md bg-blue-600 text-white text-base hover:bg-blue-700 transition-all duration-200"
              >
                Sign Up Again
              </Link>
              <div className="font-medium text-sm text-black/70">
                or{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-2">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="font-medium text-black/70">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
