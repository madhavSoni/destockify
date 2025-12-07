'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const terms = formData.get('terms');

    const newErrors: Record<string, string> = {};

    // Validate first name
    if (!firstName || firstName.trim().length === 0) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!lastName || lastName.trim().length === 0) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate email
    if (!email || email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password || password.length === 0) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Validate confirm password
    if (!confirmPassword || confirmPassword.length === 0) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate terms acceptance
    if (!terms) {
      newErrors.terms = 'You must agree to the terms and privacy policy';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const result = await api.auth.signup({
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          password,
        });

        console.log('Signup successful!', result);
        setIsSuccess(true);
      } catch (error: any) {
        console.error('Signup failed:', error);
        setErrors({ general: error.message || 'Failed to sign up. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-center px-4 pt-12 pb-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-8 sm:p-10 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-md bg-blue-600/10 border-2 border-slate-200">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-heading font-black text-3xl sm:text-4xl text-primary-900 mb-3">
                Check Your Email
              </h1>
              <p className="font-medium text-base text-black/70 mb-6">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
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
    <div className="min-h-screen bg-white flex items-start justify-center px-4 pt-12 pb-8">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="rounded-md border-2 border-black/10 bg-white shadow-md p-8 sm:p-10 animate-in fade-in duration-500">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <h1 className="font-heading font-black text-4xl sm:text-5xl text-primary-900 mb-1">
              Create Account
            </h1>
            <p className="font-medium text-base text-black/70">
              Join our liquidation marketplace
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* First Name and Last Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-black mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className={`w-full h-14 px-4 rounded-lg border ${errors.firstName ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-300'} bg-white text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                />
                {errors.firstName && (
                  <div className="mt-2 rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm font-medium text-black">{errors.firstName}</p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-black mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  className={`w-full h-14 px-4 rounded-lg border ${errors.lastName ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-300'} bg-white text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                />
                {errors.lastName && (
                  <div className="mt-2 rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm font-medium text-black">{errors.lastName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className={`w-full h-14 px-4 rounded-lg border ${errors.email ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-300'} bg-white text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200 shadow-sm`}
              />
              {errors.email && (
                <div className="mt-2 rounded-md bg-black/5 border-2 border-black/10 p-3">
                  <p className="text-sm font-medium text-black">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-black mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className={`w-full h-14 px-4 pr-12 rounded-lg border ${errors.password ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-300'} bg-white text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black focus:outline-none focus:text-black transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="mt-2 rounded-md bg-black/5 border-2 border-black/10 p-3">
                  <p className="text-sm font-medium text-black">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-black mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className={`w-full h-14 px-4 pr-12 rounded-lg border ${errors.confirmPassword ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-300'} bg-white text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black focus:outline-none focus:text-black transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-2 rounded-md bg-black/5 border-2 border-black/10 p-3">
                  <p className="text-sm font-medium text-black">{errors.confirmPassword}</p>
                </div>
              )}
            </div>

            {/* Terms agreement */}
            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="terms"
                  className="w-5 h-5 mt-0.5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer flex-shrink-0"
                />
                <span className="font-medium text-sm text-black/70 group-hover:text-black transition-colors">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <div className="mt-2 rounded-md bg-black/5 border-2 border-black/10 p-3">
                  <p className="text-sm font-medium text-black">{errors.terms}</p>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="font-bold w-full h-14 rounded-md bg-blue-600 text-white text-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* General error message */}
            {errors.general && (
              <div className="mt-3 rounded-md bg-black/5 border-2 border-black/10 p-3">
                <p className="text-sm font-medium text-black text-center">{errors.general}</p>
              </div>
            )}
          </form>

          {/* Login link */}
          <div className="font-medium text-center mt-5 text-base text-black/70">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className="font-medium inline-flex items-center gap-2 text-base text-black/50 hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
