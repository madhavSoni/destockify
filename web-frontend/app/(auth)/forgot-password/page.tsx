'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-10 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-slate-900/80">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-black text-3xl sm:text-4xl text-slate-900 mb-3">
                Check Your Email
              </h1>
              <p className="font-medium text-base text-slate-600 mb-6">
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <Link
                href="/login"
                className="font-bold inline-block px-6 py-3 rounded-2xl bg-[#2f6feb] text-white text-base shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-10 animate-in fade-in duration-500">
          <div className="text-center mb-6">
            <h1 className="font-black text-4xl sm:text-5xl text-slate-900 mb-1">
              Forgot Password?
            </h1>
            <p className="font-medium text-base text-slate-600">
              No worries, we'll send you reset instructions
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className={`w-full h-14 px-4 rounded-2xl border-2 ${errors.email ? 'border-red-500' : 'border-slate-900/80'} bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all duration-200 shadow-sm`}
              />
              {errors.email && (
                <div className="mt-2 rounded-xl bg-red-50 border-2 border-red-200 p-3">
                  <p className="text-sm font-medium text-red-600">{errors.email}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="font-bold w-full h-14 rounded-2xl bg-[#2f6feb] text-white text-lg shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            {errors.general && (
              <div className="mt-3 rounded-xl bg-red-50 border-2 border-red-200 p-3">
                <p className="text-sm font-medium text-red-600 text-center">{errors.general}</p>
              </div>
            )}
          </form>

          <div className="font-medium text-center mt-5 text-base text-slate-600">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-2 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
