'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileProfile = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black/10 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tight text-black hover:opacity-80 transition-opacity"
          onClick={closeMobileMenu}
        >
          <span className="sr-only">Trust Pallet</span>
          <span aria-hidden className="select-none">
            <span className="font-black">Trust</span>
            <span className="font-black text-blue-600"> Pallet</span>
          </span>
        </Link>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-md border-2 border-black/10 bg-white hover:bg-black/5 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-8 text-base font-bold"
          aria-label="Primary"
        >
          <Link 
            href="/about" 
            className="text-black hover:text-blue-600 transition-colors duration-200"
          >
            About Us
          </Link>
          <Link 
            href="/suppliers" 
            className="text-black hover:text-blue-600 transition-colors duration-200"
          >
            Directory
          </Link>

          {!isAuthenticated && (
            <Link 
              href="/login" 
              className="text-black hover:text-blue-600 transition-colors duration-200"
            >
              Login
            </Link>
          )}

          <Link
            href="/list-your-business"
            className="group relative inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>List your Business</span>
            <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          {isAuthenticated && user && (
            <div className="relative ml-2 pl-6 border-l-2 border-black/10" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-md border-2 border-black/10 bg-white px-3 py-2 hover:bg-black/5 transition-all duration-200"
              >
                {/* Profile Icon - Large Blue Circle with Initial */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-base font-black text-white border-2 border-white">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                
                {/* First Name */}
                <span className="text-base font-bold text-black">
                  {user.firstName}
                </span>
                
                {/* Down Arrow */}
                <svg
                  className={`h-5 w-5 text-black/50 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
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
                <div className="absolute right-0 top-full mt-3 w-64 rounded-md border-2 border-black/10 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b-2 border-black/5">
                    <p className="text-base font-bold text-black">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-black/50 truncate mt-1">
                      {user.email}
                    </p>
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1.5 mt-3 rounded-md bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-600/20">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 transition-colors duration-150 border-2 border-transparent hover:border-blue-600/20"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      href="/my-listings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 transition-colors duration-150 border-2 border-transparent hover:border-blue-600/20"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My Listings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-black hover:bg-black/5 transition-colors duration-150 border-2 border-transparent hover:border-black/10"
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />
          
          {/* Side Menu */}
          <div className="md:hidden fixed right-0 top-0 h-full w-72 bg-white border-l-2 border-black/10 shadow-lg z-50 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b-2 border-black/10">
                <span className="text-lg font-black text-black">Menu</span>
                <button
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-black/5 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Content */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <Link 
                  href="/about" 
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-base font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                >
                  About Us
                </Link>
                <Link 
                  href="/suppliers" 
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-base font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                >
                  Directory
                </Link>

                {!isAuthenticated && (
                  <Link 
                    href="/login" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                  >
                    Login
                  </Link>
                )}

                {/* Profile Section - Collapsible */}
                {isAuthenticated && user && (
                  <div className="pt-2 mt-2 border-t-2 border-black/5">
                    <button
                      onClick={toggleMobileProfile}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-base font-bold text-black hover:bg-black/5 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white border-2 border-white shadow-sm">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.firstName}</span>
                      </div>
                      <svg
                        className={`h-5 w-5 text-black/50 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Collapsible Profile Menu */}
                    {isDropdownOpen && (
                      <div className="mt-1 ml-4 pl-4 border-l-2 border-black/5 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        <Link
                          href="/profile"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        
                        <Link
                          href="/my-listings"
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          My Listings
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-black hover:bg-black/5 rounded-md transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </nav>

              {/* Menu Footer */}
              {!isAuthenticated && (
                <div className="px-4 py-4 border-t-2 border-black/5">
                  <Link
                    href="/list-your-business"
                    onClick={closeMobileMenu}
                    className="group flex items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3.5 text-sm font-bold text-white active:scale-95 transition-all duration-150"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>List your Business</span>
                    <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
