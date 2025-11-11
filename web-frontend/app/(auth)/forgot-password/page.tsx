'use client';

import Link from 'next/link';
import { Patrick_Hand } from 'next/font/google';
import { useState } from 'react';
import { api } from '@/lib/api';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default function ForgotPasswordPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const newErrors: Record<string, string> = {};

    if (!email || email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await api.auth.forgotPassword(email);
        setIsSuccess(true);
      } catch (error: any) {
        console.error('Forgot password failed:', error);
        setErrors({ general: error.message || 'Failed to send reset email. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSuccess) {
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
                Check Your Email
              </h1>
              <p className={`${hand.className} text-base text-slate-600 mb-6`}>
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <Link
                href="/login"
                className={`${hand.className} inline-block px-6 py-3 rounded-2xl bg-[#2f6feb] text-white text-base font-semibold shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200`}
              >
                Back to Login
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
          <div className="text-center mb-6">
            <h1 className={`${hand.className} text-4xl sm:text-5xl text-slate-900 mb-1`}>
              Forgot Password?
            </h1>
            <p className={`${hand.className} text-base text-slate-600`}>
              No worries, we'll send you reset instructions
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={`${hand.className} block text-base text-slate-900 mb-1.5 font-semibold`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className={`w-full h-12 px-4 rounded-2xl border-2 ${errors.email ? 'border-red-500' : 'border-slate-300'} bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${hand.className} w-full h-14 rounded-2xl bg-[#2f6feb] text-white text-lg font-semibold shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {errors.general && (
              <p className="mt-3 text-sm text-red-600 text-center">{errors.general}</p>
            )}
          </form>

          <div className={`${hand.className} text-center mt-5 text-base text-slate-600`}>
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
