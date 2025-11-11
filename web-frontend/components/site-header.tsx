'use client';

import Link from 'next/link';
import { Patrick_Hand } from 'next/font/google';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

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
    <header className="border-b border-slate-200 bg-white relative z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        {/* Left: logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 hover:opacity-80 transition-opacity"
        >
          <span className="sr-only">Destockify</span>
          <span aria-hidden className="select-none">
            <span className="font-black">Destock</span>
            <span className="font-black text-[#3b82f6]">ify</span>
          </span>
        </Link>

        {/* Right: handwritten nav */}
        <nav
          className={`${hand.className} flex items-center gap-6 text-lg text-slate-900`}
          aria-label="Primary"
        >
          <Link 
            href="/suppliers" 
            className="hover:text-[#3b82f6] transition-colors duration-200"
          >
            Buyers
          </Link>
          <Link 
            href="/list-your-business" 
            className="hover:text-[#3b82f6] transition-colors duration-200"
          >
            Sellers
          </Link>

          {!isAuthenticated && (
            <Link 
              href="/login" 
              className="hover:text-[#3b82f6] transition-colors duration-200"
            >
              Login
            </Link>
          )}

          <Link
            href="/list-your-business"
            className="rounded-full bg-[#2f6feb] px-4 py-2 text-white shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] ring-2 ring-slate-900/80 hover:translate-y-[-1px] hover:shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] transition-all duration-200"
          >
            List your Business
          </Link>
          
          {isAuthenticated && user && (
            <div className="relative ml-4 pl-4 border-l-2 border-slate-200" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-300 bg-white px-3 py-2 hover:border-slate-400 hover:shadow-sm transition-all duration-200"
              >
                {/* Profile Icon */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white shadow-sm">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                
                {/* First Name */}
                <span className="text-base text-slate-900 font-medium">
                  {user.firstName}
                </span>
                
                {/* Down Arrow */}
                <svg
                  className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border-2 border-slate-900/80 bg-white shadow-[4px_5px_0_0_rgba(2,6,23,0.85)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {user.email}
                    </p>
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
