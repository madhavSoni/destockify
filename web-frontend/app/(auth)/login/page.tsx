'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
        // Redirect to home page after successful login
        router.push('/');
      } catch (error: any) {
        console.error('Login failed:', error);
        setErrors({ general: error.message || 'Failed to login. Please try again.' });
        setIsLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="rounded-3xl border-2 border-slate-900/80 bg-white shadow-[8px_9px_0_0_rgba(2,6,23,0.85)] p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-500">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-base font-medium text-slate-600">
              Sign in to access your account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className={`w-full h-14 px-5 rounded-2xl border-2 ${errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-900/80'} bg-white text-slate-900 text-base font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all duration-200`}
              />
              {errors.email && (
                <p className="mt-2 text-sm font-semibold text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className={`w-full h-14 px-5 pr-14 rounded-2xl border-2 ${errors.password ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-900/80'} bg-white text-slate-900 text-base font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 focus:outline-none transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm font-semibold text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-5 h-5 rounded border-2 border-slate-900/80 text-blue-600 focus:ring-4 focus:ring-blue-200 transition-all cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-blue-600 text-white text-base font-bold shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] border-2 border-slate-900/80 hover:translate-y-[-3px] hover:shadow-[6px_8px_0_0_rgba(2,6,23,0.85)] hover:bg-blue-700 active:translate-y-0 active:shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[5px_6px_0_0_rgba(2,6,23,0.85)] mt-6"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* General error message */}
            {errors.general && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border-2 border-red-200">
                <p className="text-sm font-semibold text-red-600 text-center">{errors.general}</p>
              </div>
            )}
          </form>

          {/* Sign up link */}
          <div className="text-center mt-6 text-base font-medium text-slate-600">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
