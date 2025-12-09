'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { US_STATES, getStateCode, getStateName } from '@/lib/constants/states';

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
          // Normalize and map states to consistent format
          const normalizedStates = response.availableFilters.states
            .map((state: any) => {
              // Normalize state code/name
              let stateCode = state.code || '';
              let stateName = state.name || '';
              
              // If we have a name but no code, try to find the code
              if (stateName && !stateCode) {
                const foundCode = getStateCode(stateName.trim());
                if (foundCode) {
                  stateCode = foundCode;
                }
              }
              
              // If we have a code but no name, try to find the name
              if (stateCode && !stateName) {
                const foundName = getStateName(stateCode.trim().toUpperCase());
                if (foundName) {
                  stateName = foundName;
                }
              }
              
              // Normalize code to uppercase and trim
              stateCode = stateCode.trim().toUpperCase();
              stateName = stateName.trim();
              
              // Only include if we have both code and name
              if (stateCode && stateName) {
                return {
                  code: stateCode,
                  name: stateName,
                  count: state.count || 0,
                };
              }
              return null;
            })
            .filter((state: StateOption | null): state is StateOption => state !== null);
          
          // Remove duplicates by code
          const uniqueStates = Array.from(
            new Map(normalizedStates.map(state => [state.code, state])).values()
          );
          
          // Sort states by name for better UX
          const sortedStates = uniqueStates.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          
          setAvailableStates(sortedStates);
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
        setAvailableStates([]);
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
    // Normalize the state code to uppercase for consistency
    const normalizedState = selectedState.trim().toUpperCase();
    router.push(`/suppliers?state=${encodeURIComponent(normalizedState)}`);
  };

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={loading}
            className="h-14 w-full appearance-none rounded-lg border border-slate-300 bg-white px-5 pr-12 text-base text-black shadow-sm hover:border-blue-500/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
