'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Region = {
  slug: string;
  name: string;
};

// All US states for the dropdown
const ALL_US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

export function StateSelector({ regions }: { regions: Region[] }) {
  const [selectedState, setSelectedState] = useState('');
  const router = useRouter();

  const handleGo = () => {
    if (!selectedState) {
      router.push('/suppliers');
      return;
    }

    // Check if we have this state in our regions (case-insensitive match)
    const matchedRegion = regions.find(
      r => r.name.toLowerCase() === selectedState.toLowerCase()
    );

    if (matchedRegion) {
      // We have suppliers in this state - filter by it
      router.push(`/suppliers?region=${matchedRegion.slug}`);
    } else {
      // We don't have suppliers in this state - go to general suppliers page
      router.push('/suppliers');
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-14 w-full appearance-none rounded-md border-2 border-black/10 bg-white px-5 pr-12 text-base text-black shadow-sm hover:border-blue-600/50 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
          >
            <option value="">Shop by State</option>
            {ALL_US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
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
          className="group h-14 rounded-md bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
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
