'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Patrick_Hand } from 'next/font/google';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const newErrors: Record<string, string> = {};

    // Validate email
    if (!email || email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password || password.length === 0) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await login(email, password);
        
        // Redirect to home page
        router.push('/');
      } catch (error: any) {
        console.error('Login failed:', error);
        setErrors({ general: error.message || 'Failed to login. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 pt-12 pb-8">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[6px_7px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-10 animate-in fade-in duration-500">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <h1 className={`${hand.className} text-4xl sm:text-5xl text-slate-900 mb-1`}>
              Welcome Back
            </h1>
            <p className={`${hand.className} text-base text-slate-600`}>
              Sign in to access your account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email field */}
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

            {/* Password field */}
            <div>
              <label htmlFor="password" className={`${hand.className} block text-base text-slate-900 mb-1.5 font-semibold`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 pr-12 rounded-2xl border-2 ${errors.password ? 'border-red-500' : 'border-slate-300'} bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors p-1"
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
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
                />
                <span className={`${hand.className} text-sm text-slate-700 group-hover:text-slate-900 transition-colors`}>
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className={`${hand.className} text-sm text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors`}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`${hand.className} w-full h-14 rounded-2xl bg-[#2f6feb] text-white text-lg font-semibold shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-2px] hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] hover:bg-[#2563eb] active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* General error message */}
            {errors.general && (
              <p className="mt-3 text-sm text-red-600 text-center">{errors.general}</p>
            )}
          </form>

          {/* Sign up link */}
          <div className={`${hand.className} text-center mt-5 text-base text-slate-600`}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline underline-offset-2 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className={`${hand.className} inline-flex items-center gap-2 text-base text-slate-700 hover:text-slate-900 transition-colors`}
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
