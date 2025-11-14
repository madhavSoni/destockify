'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading, user, refreshUser, login } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isLoading) {
        setChecking(true);
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
      if (isAuthenticated && user && finalIsAdmin === false && !showLogin) {
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

      if (!isAuthenticated) {
        setShowLogin(true);
      } else if (!finalIsAdmin) {
        // User is logged in but not admin - redirect to home
        router.push('/');
      } else {
        // User is authenticated and is admin - show admin panel
        setShowLogin(false);
      }
    };

    checkAdmin();
  }, [isAuthenticated, isAdmin, isLoading, user, router, refreshUser, showLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      
      // Wait a bit for the login function to update state
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force refresh user to get latest admin status
      await refreshUser();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check if user is admin from localStorage (most reliable)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.isAdmin) {
          // Admin login successful - reload page to ensure all state is fresh
          window.location.reload();
        } else {
          setLoginError('This account does not have admin access. Please use a different account.');
          setLoginLoading(false);
        }
      } else {
        setLoginError('Login failed. Please try again.');
        setLoginLoading(false);
      }
    } catch (error: any) {
      setLoginError(error.message || 'Failed to login. Please try again.');
      setLoginLoading(false);
    }
  };

  if (isLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showLogin || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Login</h1>
              <p className="text-sm text-slate-600">Sign in to access the admin panel</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="admin-email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42L21 21M12 12l.01.01" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
