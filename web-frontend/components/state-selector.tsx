'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type Region = {
  slug: string;
  name: string;
};

type StateOption = {
  code: string;
  name: string;
  count: number;
};

export function StateSelector({ regions }: { regions: Region[] }) {
  const [selectedState, setSelectedState] = useState('');
  const [availableStates, setAvailableStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch available states from the API
    const fetchStates = async () => {
      try {
        const response = await api.suppliers.list({ limit: 1 });
        if (response.availableFilters?.states) {
          // Sort states by name for better UX
          const sortedStates = [...response.availableFilters.states].sort((a, b) => 
            a.name.trim().localeCompare(b.name.trim())
          );
          setAvailableStates(sortedStates);
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  const handleGo = () => {
    if (!selectedState) {
      router.push('/suppliers');
      return;
    }

    // Navigate to suppliers page filtered by the selected state
    // The state value matches what's in the database
    router.push(`/suppliers?state=${encodeURIComponent(selectedState)}`);
  };

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={loading}
            className="h-14 w-full appearance-none rounded-md border-2 border-black/10 bg-white px-5 pr-12 text-base text-black shadow-sm hover:border-blue-600/50 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading ? 'Loading states...' : 'Shop by State'}
            </option>
            {availableStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name.trim()} ({state.count})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-5 w-5 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleGo}
          disabled={loading || !selectedState}
          className="group h-14 rounded-md bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Go
          <svg 
            className="w-5 h-5 transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
