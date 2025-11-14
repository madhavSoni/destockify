'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Patrick_Hand } from 'next/font/google';

const hand = Patrick_Hand({ subsets: ['latin'], weight: '400' });

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA',
  'MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY',
];

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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    if (!stateCode) return;
    
    // Check if we have a region mapping for this state
    if (stateToRegionMap[stateCode]) {
      // Navigate to suppliers filtered by the region
      router.push(`/suppliers?region=${stateToRegionMap[stateCode]}`);
    } else {
      // If no direct mapping, try to find a region by name match
      const stateName = getStateName(stateCode);
      if (stateName) {
        // Try to find a region whose name contains the state name
        const matchingRegion = regionsList.find((region) => 
          region.name.toLowerCase().includes(stateName.toLowerCase())
        );
        
        if (matchingRegion) {
          router.push(`/suppliers?region=${matchingRegion.slug}`);
        } else {
          // Fallback: search by state name
          router.push(`/suppliers?search=${stateName}`);
        }
      } else {
        // Final fallback: search by state code
        router.push(`/suppliers?search=${stateCode}`);
      }
    }
  };

  return (
    <form action="/suppliers" method="get" className="mx-auto mt-8 max-w-sm">
      <div className="relative">
        <select
          name="state"
          defaultValue=""
          onChange={handleChange}
          className={`${hand.className} h-11 w-full appearance-none rounded-[14px] border-2 border-slate-900/80 bg-white px-4 pr-10 text-base text-slate-900 shadow-[3px_4px_0_0_rgba(2,6,23,0.85)] focus:outline-none cursor-pointer`}
        >
          <option value="" disabled>Shop by State</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-700">▾</span>
      </div>
    </form>
  );
}

