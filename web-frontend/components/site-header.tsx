'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Categories and Brands state
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isBrandsLoading, setIsBrandsLoading] = useState(true);
  
  // Desktop dropdown states
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const brandsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Mobile dropdown states
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isMobileBrandsOpen, setIsMobileBrandsOpen] = useState(false);

  // Ensure we're mounted before using portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories and brands
  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          api.catalog.categoryPages.list('category'),
          api.catalog.categoryPages.list('retailer'),
        ]);
        setCategories(categoriesData || []);
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Failed to fetch categories/brands:', error);
        setCategories([]);
        setBrands([]);
      } finally {
        setIsCategoriesLoading(false);
        setIsBrandsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user profile dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close categories dropdown
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
      }
      // Close brands dropdown
      if (brandsDropdownRef.current && !brandsDropdownRef.current.contains(event.target as Node)) {
        setIsBrandsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Close all dropdowns when route changes
  useEffect(() => {
    setIsCategoriesDropdownOpen(false);
    setIsBrandsDropdownOpen(false);
    setIsMobileCategoriesOpen(false);
    setIsMobileBrandsOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openCategoriesDropdown = () => {
    setIsCategoriesDropdownOpen(true);
    setIsBrandsDropdownOpen(false); // Close brands if open
  };

  const closeCategoriesDropdown = () => {
    setIsCategoriesDropdownOpen(false);
  };

  const openBrandsDropdown = () => {
    setIsBrandsDropdownOpen(true);
    setIsCategoriesDropdownOpen(false); // Close categories if open
  };

  const closeBrandsDropdown = () => {
    setIsBrandsDropdownOpen(false);
  };

  const toggleMobileCategories = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMobileCategoriesOpen(!isMobileCategoriesOpen);
    setIsMobileBrandsOpen(false); // Close brands if open
  };

  const toggleMobileBrands = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsMobileBrandsOpen(!isMobileBrandsOpen);
    setIsMobileCategoriesOpen(false); // Close categories if open
  };

  const handleCategoryClick = () => {
    setIsCategoriesDropdownOpen(false);
    closeMobileMenu();
  };

  const handleBrandClick = () => {
    setIsBrandsDropdownOpen(false);
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading inline-flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight text-black hover:opacity-80 transition-opacity"
          onClick={closeMobileMenu}
        >
          <span className="sr-only">Find Liquidation</span>
          <span aria-hidden className="select-none">
            <span className="font-black">Find</span>
            <span className="font-black text-blue-600"> Liquidation</span>
          </span>
        </Link>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md border-2 border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
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
          className="hidden lg:flex items-center gap-8 text-base font-bold"
          aria-label="Primary"
        >
          {/* Categories Dropdown */}
          <div 
            className="relative" 
            ref={categoriesDropdownRef}
            onMouseEnter={openCategoriesDropdown}
            onMouseLeave={closeCategoriesDropdown}
          >
            <Link
              href="/categories"
              className="text-black hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full flex items-center gap-1"
              aria-expanded={isCategoriesDropdownOpen}
              aria-haspopup="true"
            >
              Categories
              <svg
                className={`h-4 w-4 text-black/50 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Categories Dropdown Menu */}
            {isCategoriesDropdownOpen && (
              <div className="absolute left-0 top-full mt-3 w-64 rounded-lg border border-slate-200 bg-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {isCategoriesLoading ? (
                    <div className="px-4 py-3 text-sm text-black/50">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-black/50">No categories available</div>
                  ) : (
                    categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/${category.slug}`}
                        onClick={handleCategoryClick}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-4 py-2.5 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 transition-colors duration-150"
                      >
                        <span className="flex-1">{category.pageTitle}</span>
                        {category.heroImage && (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                              src={category.heroImage}
                              alt={category.heroImageAlt || category.pageTitle}
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Brands Dropdown */}
          <div 
            className="relative" 
            ref={brandsDropdownRef}
            onMouseEnter={openBrandsDropdown}
            onMouseLeave={closeBrandsDropdown}
          >
            <Link
              href="/brands"
              className="text-black hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full flex items-center gap-1"
              aria-expanded={isBrandsDropdownOpen}
              aria-haspopup="true"
            >
              Brands
              <svg
                className={`h-4 w-4 text-black/50 transition-transform duration-200 ${isBrandsDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Brands Dropdown Menu */}
            {isBrandsDropdownOpen && (
              <div className="absolute left-0 top-full mt-3 w-64 rounded-lg border border-slate-200 bg-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {isBrandsLoading ? (
                    <div className="px-4 py-3 text-sm text-black/50">Loading...</div>
                  ) : brands.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-black/50">No brands available</div>
                  ) : (
                    [...brands].reverse().map((brand) => (
                      <Link
                        key={brand.slug}
                        href={`/${brand.slug}`}
                        onClick={handleBrandClick}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-4 py-2.5 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 transition-colors duration-150"
                      >
                        <span className="flex-1">{brand.pageTitle}</span>
                        {brand.heroImage && (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                              src={brand.heroImage}
                              alt={brand.heroImageAlt || brand.pageTitle}
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <Link 
              href="/login" 
              className="text-black hover:text-blue-600 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all hover:after:w-full"
            >
              Login
            </Link>
          )}

          <Link
            href="/list-your-business"
            className="group relative inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <span>List your Business</span>
          </Link>
          
          {isAuthenticated && user && (
            <div className="relative ml-2 pl-6 border-l-2 border-slate-200" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-md border-2 border-slate-200 bg-white shadow-sm px-3 py-2 hover:bg-slate-50 hover:shadow-lift transition-all duration-200"
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
                  <div className="p-4 border-b-2 border-slate-200">
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
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-bold text-black hover:bg-slate-50 transition-colors duration-150 border-2 border-transparent hover:border-slate-200"
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

      {/* Mobile Menu Overlay - Rendered via Portal to escape header stacking context */}
      {mounted && isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/30 z-[60] animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />
          
          {/* Side Menu */}
          <div 
            className="lg:hidden fixed right-0 top-0 h-full w-72 bg-white border-l-2 border-slate-200 shadow-sm z-[70] animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b-2 border-slate-200">
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
                {/* Categories Section - Collapsible */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/categories"
                      onClick={closeMobileMenu}
                      className="flex-1 px-4 py-2.5 text-base font-bold text-black hover:bg-black/5 rounded-md transition-colors"
                    >
                      Categories
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileCategories(e);
                      }}
                      className="flex items-center justify-center w-10 h-10 text-black hover:bg-black/5 rounded-md transition-colors"
                      aria-label="Toggle categories menu"
                    >
                      <svg
                        className={`h-5 w-5 text-black/50 transition-transform duration-200 flex-shrink-0 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Collapsible Categories Menu */}
                  {isMobileCategoriesOpen && (
                    <div 
                      className="mt-1 ml-4 pl-4 border-l-2 border-slate-200 space-y-1 animate-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isCategoriesLoading ? (
                        <div className="px-3 py-2 text-sm text-black/50">Loading...</div>
                      ) : categories.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-black/50">No categories available</div>
                      ) : (
                        categories.map((category) => (
                          <Link
                            key={category.slug}
                            href={`/${category.slug}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick();
                            }}
                            className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                          >
                            <span className="flex-1">{category.pageTitle}</span>
                            {category.heroImage && (
                              <div className="relative w-8 h-8 flex-shrink-0">
                                <Image
                                  src={category.heroImage}
                                  alt={category.heroImageAlt || category.pageTitle}
                                  fill
                                  className="object-contain"
                                  sizes="32px"
                                />
                              </div>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Brands Section - Collapsible */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/brands"
                      onClick={closeMobileMenu}
                      className="flex-1 px-4 py-2.5 text-base font-bold text-black hover:bg-black/5 rounded-md transition-colors"
                    >
                      Brands
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileBrands(e);
                      }}
                      className="flex items-center justify-center w-10 h-10 text-black hover:bg-black/5 rounded-md transition-colors"
                      aria-label="Toggle brands menu"
                    >
                      <svg
                        className={`h-5 w-5 text-black/50 transition-transform duration-200 flex-shrink-0 ${isMobileBrandsOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Collapsible Brands Menu */}
                  {isMobileBrandsOpen && (
                    <div 
                      className="mt-1 ml-4 pl-4 border-l-2 border-slate-200 space-y-1 animate-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isBrandsLoading ? (
                        <div className="px-3 py-2 text-sm text-black/50">Loading...</div>
                      ) : brands.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-black/50">No brands available</div>
                      ) : (
                        [...brands].reverse().map((brand) => (
                          <Link
                            key={brand.slug}
                            href={`/${brand.slug}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrandClick();
                            }}
                            className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                          >
                            <span className="flex-1">{brand.pageTitle}</span>
                            {brand.heroImage && (
                              <div className="relative w-8 h-8 flex-shrink-0">
                                <Image
                                  src={brand.heroImage}
                                  alt={brand.heroImageAlt || brand.pageTitle}
                                  fill
                                  className="object-contain"
                                  sizes="32px"
                                />
                              </div>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {!isAuthenticated && (
                  <Link 
                    href="/login" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                  >
                    Login
                  </Link>
                )}

                {/* Profile Section - flat items on mobile */}
                {isAuthenticated && user && (
                  <div className="pt-2 mt-2 border-t-2 border-slate-200 space-y-1">
                    <div className="flex items-center gap-3 px-4 py-2.5 text-base font-bold text-black">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white border-2 border-white shadow-sm">
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.firstName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        router.push('/profile');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu();
                        router.push('/my-listings');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-bold text-black hover:bg-blue-600/10 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My Listings
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-bold text-black hover:bg-black/5 rounded-md transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </nav>

              {/* Menu Footer */}
              {!isAuthenticated && (
                <div className="px-4 py-4 border-t-2 border-slate-200">
                  <Link
                    href="/list-your-business"
                    onClick={closeMobileMenu}
                    className="group flex items-center justify-center rounded-md bg-blue-600 px-5 py-3.5 text-sm font-bold text-white active:scale-95 transition-all duration-150"
                  >
                    <span>List your Business</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
