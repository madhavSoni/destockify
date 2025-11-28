'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type RegionSummary = {
  slug: string;
  name: string;
  stateCode?: string | null;
};

// State code to name mapping
const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois',
  'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
  'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
  'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon',
  'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota',
  'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia',
  'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Helper function to get state name from code
const getStateName = (code: string): string | null => {
  return STATE_NAMES[code] || null;
};

export function StateSelector() {
  const router = useRouter();
  const [stateToRegionMap, setStateToRegionMap] = useState<Record<string, string>>({});
  const [regionsList, setRegionsList] = useState<RegionSummary[]>([]);
  const [availableStates, setAvailableStates] = useState<Array<{ code: string; name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch regions and create a map of stateCode -> region slug
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';
    fetch(`${API_URL}/catalog/regions`)
      .then((res) => res.json())
      .then((regions: RegionSummary[]) => {
        setRegionsList(regions);
        const map: Record<string, string> = {};
        regions.forEach((region) => {
          // Map by state code if available
          if (region.stateCode) {
            map[region.stateCode] = region.slug;
          }
          // Also try to match by region name containing state name
          const regionNameLower = region.name.toLowerCase();
          Object.entries(STATE_NAMES).forEach(([code, stateName]) => {
            if (regionNameLower.includes(stateName.toLowerCase())) {
              map[code] = region.slug;
            }
          });
        });
        setStateToRegionMap(map);
      })
      .catch((err) => {
        console.error('Failed to fetch regions:', err);
      });

    // Fetch states that have suppliers
    api.suppliers.list({ limit: 1 })
      .then((result) => {
        if (result.availableFilters?.states) {
          const states = result.availableFilters.states
            .map(s => ({
              code: s.code,
              name: s.name || STATE_NAMES[s.code] || s.code,
              count: s.count
            }))
            .sort((a, b) => {
              // Sort by name alphabetically
              return a.name.localeCompare(b.name);
            });
          setAvailableStates(states);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch state data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    if (!stateCode) return;
    
    // First try direct state filtering (most reliable)
    router.push(`/suppliers?state=${stateCode}`);
  };

  return (
    <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-sm">
      <div className="relative">
        <select
          name="state"
          defaultValue=""
          onChange={handleChange}
          disabled={loading}
          className="h-11 w-full appearance-none rounded-md border-2 border-black/10 bg-white px-4 pr-10 text-base font-medium text-slate-900 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {loading ? 'Loading states...' : 'Shop by State'}
          </option>
          {availableStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.code} - {state.name} ({state.count})
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {!loading && availableStates.length > 0 && (
        <p className="mt-2 text-xs text-slate-500 text-center">
          {availableStates.length} state{availableStates.length !== 1 ? 's' : ''} with suppliers
        </p>
      )}
    </form>
  );
}

