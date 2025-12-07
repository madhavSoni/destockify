'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api, type SupplierSummary } from '@/lib/api';
import Link from 'next/link';

interface SearchAutocompleteProps {
  onSelect?: (query: string) => void;
  className?: string;
}

export function SearchAutocomplete({ onSelect, className = '' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SupplierSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.suppliers.list({
        search: searchQuery,
        limit: 8,
      });
      setSuggestions(result.items);
      setIsOpen(result.items.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const supplier = suggestions[selectedIndex];
          handleSuggestionClick();
          router.push(`/suppliers/${supplier.slug}`);
        } else if (query.trim()) {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onSelect) {
        onSelect(query);
      } else {
        router.push(`/suppliers?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Handle suggestion click - just close dropdown, let Link handle navigation
  const handleSuggestionClick = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInContainer = containerRef.current?.contains(target);
      const isClickInDropdown = dropdownRef.current?.contains(target);
      
      // Only close if click is outside both container and dropdown
      if (!isClickInContainer && !isClickInDropdown) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Mount portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const updatePosition = () => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (rect) {
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen]);

  const dropdownContent = isOpen && suggestions.length > 0 && (
    <div
      ref={dropdownRef}
      className="bg-white border border-slate-200 rounded-md shadow-sm max-h-64 overflow-y-auto"
      role="listbox"
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      }}
    >
          {suggestions.map((supplier, index) => (
            <Link
              key={supplier.slug}
              href={`/suppliers/${supplier.slug}`}
              onClick={handleSuggestionClick}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-600/10 transition-colors cursor-pointer ${
                index === selectedIndex ? 'bg-blue-600/20' : ''
              } ${index > 0 ? 'border-t border-slate-200' : ''}`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {supplier.logoImage && (
                <div className="flex-shrink-0 relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-white">
                  <Image
                    src={supplier.logoImage}
                    alt={`${supplier.name} logo`}
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-black truncate">
                  {supplier.name}
                </div>
                {(supplier.city || supplier.state) && (
                  <div className="text-xs text-black/50 truncate">
                    {[supplier.city, supplier.state].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              {supplier.flags?.some((f) => f.variant === 'verified') && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-600/20 text-xs font-semibold text-blue-600">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                </div>
              )}
            </Link>
          ))}
    </div>
  );

  return (
    <>
      <div ref={containerRef} className={`relative w-full ${className}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder="Search supplier or keywords"
            className="h-14 sm:h-16 w-full bg-transparent border-0 text-sm sm:text-base text-black placeholder:text-slate-400 focus:outline-none px-4 sm:px-6 pr-12 sm:pr-14 flex-1"
            aria-label="Search suppliers"
            autoComplete="off"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          <button
            type="submit"
            className="absolute right-2 sm:right-3 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-md text-black hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors flex-shrink-0"
            aria-label="Search"
          >
            {isLoading ? (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
      
      {/* Render dropdown in portal to guarantee it appears above all elements */}
      {mounted && typeof document !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}

