'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading, user, refreshUser } = useAuth();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isLoading) {
        setChecking(true);
        return;
      }

      // Check 1: User must be authenticated
      if (!isAuthenticated) {
        // Don't auto-redirect - just show the login required message
        setChecking(false);
        return;
      }

      // Check admin status from localStorage first (no API call needed)
      const storedUser = localStorage.getItem('user');
      let finalIsAdmin = isAdmin;
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          finalIsAdmin = parsedUser.isAdmin === true;
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Only refresh user profile once if we're authenticated but admin status is unclear
      // This prevents unnecessary API calls that cause rate limiting
      if (isAuthenticated && user && finalIsAdmin === false) {
        // Only refresh if we haven't checked recently (avoid rate limits)
        const lastCheck = sessionStorage.getItem('adminCheckTime');
        const now = Date.now();
        if (!lastCheck || (now - parseInt(lastCheck)) > 5000) {
          try {
            await refreshUser();
            sessionStorage.setItem('adminCheckTime', now.toString());
            // Re-check from localStorage after refresh
            const updatedUser = localStorage.getItem('user');
            if (updatedUser) {
              const parsed = JSON.parse(updatedUser);
              finalIsAdmin = parsed.isAdmin === true;
            }
          } catch (error) {
            console.error('Failed to refresh user:', error);
          }
        }
      }

      setChecking(false);

      // Check 2: Authenticated user must be an admin
      if (!finalIsAdmin) {
        // User is logged in but not admin - they stay on this page but see access denied
        return;
      }
    };

    checkAdmin();
  }, [isAuthenticated, isAdmin, isLoading, user, refreshUser, pathname]);

  // Loading state
  if (isLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  // Check 1: Not authenticated - redirect handled in useEffect
  // This is just a fallback render while redirect is happening
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Login Required Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="font-bold text-3xl text-slate-900 mb-4">
            Admin Login Required
          </h1>
          <p className="font-normal text-lg text-slate-600 mb-8">
            You need to be logged in as an administrator to access the admin panel.
          </p>

          {/* Action Button */}
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>

          {/* Back to home link */}
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 hover:underline underline-offset-2"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check 2: Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Lock Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="font-bold text-3xl text-slate-900 mb-4">
            Access Denied
          </h1>
          <p className="font-normal text-lg text-slate-600 mb-2">
            You don't have permission to access the admin panel.
          </p>
          <p className="font-normal text-sm text-slate-500 mb-8">
            Logged in as: <span className="font-semibold text-slate-700">{user?.email}</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            <Link
              href="/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              If you believe this is an error, please contact an administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated AND is admin - show admin panel
  return <>{children}</>;
}
