'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type Supplier = {
  id: number;
  name: string;
  slug?: string;
};

interface SupplierSelectorProps {
  suppliers: Supplier[];
  value?: number | string;
  onSelect: (supplierId: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SupplierSelector({
  suppliers,
  value,
  onSelect,
  placeholder = 'Search and select a supplier...',
  className = '',
  disabled = false,
}: SupplierSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSupplier = suppliers.find((s) => s.id === Number(value));

  // Filter suppliers based on query
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(query.toLowerCase())
  );

  // Display value: show query if typing, otherwise show selected supplier name
  const displayValue = query || (selectedSupplier ? selectedSupplier.name : '');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Only clear query if no supplier is selected
        if (!selectedSupplier) {
          setQuery('');
        } else {
          // Reset query to show selected supplier name
          setQuery('');
        }
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedSupplier]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuppliers.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuppliers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuppliers.length) {
          handleSelect(filteredSuppliers[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (supplier: Supplier) => {
    onSelect(supplier.id);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
      {isOpen && filteredSuppliers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {filteredSuppliers.map((supplier, index) => (
            <button
              key={supplier.id}
              type="button"
              onClick={() => handleSelect(supplier)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                index === selectedIndex ? 'bg-blue-50' : ''
              } ${index > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="font-medium text-slate-900">{supplier.name}</div>
            </button>
          ))}
        </div>
      )}
      {isOpen && query && filteredSuppliers.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-lg">
          No suppliers found matching "{query}"
        </div>
      )}
    </div>
  );
}

