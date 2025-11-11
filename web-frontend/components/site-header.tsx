'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-900/80 bg-white shadow-[0_4px_0_0_rgba(2,6,23,0.1)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
        >
          <span className="sr-only">Destockify</span>
          <span aria-hidden className="select-none">
            <span className="font-black">Destock</span>
            <span className="font-black text-blue-600">ify</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="flex items-center gap-8 text-base font-bold"
          aria-label="Primary"
        >
          <Link 
            href="/suppliers" 
            className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
          >
            Buyers
          </Link>
          <Link 
            href="/list-your-business" 
            className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
          >
            Sellers
          </Link>

          {!isAuthenticated && (
            <Link 
              href="/login" 
              className="text-slate-900 hover:text-blue-600 transition-colors duration-200"
            >
              Login
            </Link>
          )}

          <Link
            href="/list-your-business"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] border-2 border-slate-900/80 hover:translate-y-[-2px] hover:shadow-[4px_6px_0_0_rgba(2,6,23,0.85)] transition-all duration-200"
          >
            List your Business
          </Link>
          
          {isAuthenticated && user && (
            <div className="relative ml-2 pl-6 border-l-2 border-slate-200" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-2xl border-2 border-slate-900/80 bg-white px-3 py-2 hover:shadow-[2px_3px_0_0_rgba(2,6,23,0.85)] transition-all duration-200"
              >
                {/* Profile Icon - Large Blue Circle with Initial */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-base font-black text-white shadow-md border-2 border-white">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                
                {/* First Name */}
                <span className="text-base font-bold text-slate-900">
                  {user.firstName}
                </span>
                
                {/* Down Arrow */}
                <svg
                  className={`h-5 w-5 text-slate-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b-2 border-slate-200">
                    <p className="text-base font-bold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-slate-600 truncate mt-1">
                      {user.email}
                    </p>
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 border border-green-300">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 border-2 border-transparent hover:border-red-200"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
