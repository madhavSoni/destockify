'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Patrick_Hand } from 'next/font/google';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

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
      <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 pt-12 pb-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-10 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-slate-900/80">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className={`${hand.className} text-3xl sm:text-4xl text-slate-900 mb-3`}>
                Verifying Email...
              </h1>
              <p className={`${hand.className} text-base text-slate-600`}>
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
      <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 pt-12 pb-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-10 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-slate-900/80">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className={`${hand.className} text-3xl sm:text-4xl text-slate-900 mb-3`}>
                Email Verified!
              </h1>
              <p className={`${hand.className} text-base text-slate-600 mb-6`}>
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                href="/login"
                className={`${hand.className} inline-block px-6 py-3 rounded-2xl bg-[#2f6feb] text-white text-base font-semibold shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200`}
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
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 pt-12 pb-8">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-10 animate-in fade-in duration-500">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 border-2 border-slate-900/80">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className={`${hand.className} text-3xl sm:text-4xl text-slate-900 mb-3`}>
              Verification Failed
            </h1>
            <p className={`${hand.className} text-base text-slate-600 mb-6`}>
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className={`${hand.className} inline-block px-6 py-3 rounded-2xl bg-[#2f6feb] text-white text-base font-semibold shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200`}
              >
                Sign Up Again
              </Link>
              <div className={`${hand.className} text-sm text-slate-600`}>
                or{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
