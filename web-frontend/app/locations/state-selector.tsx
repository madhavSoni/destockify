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

export function StateSelector() {
  const router = useRouter();
  const [stateToRegionMap, setStateToRegionMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch regions and create a map of stateCode -> region slug
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';
    fetch(`${API_URL}/catalog/regions`)
      .then((res) => res.json())
      .then((regionsList: RegionSummary[]) => {
        const map: Record<string, string> = {};
        regionsList.forEach((region) => {
          if (region.stateCode) {
            map[region.stateCode] = region.slug;
          }
        });
        setStateToRegionMap(map);
      })
      .catch((err) => {
        console.error('Failed to fetch regions:', err);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    if (stateCode && stateToRegionMap[stateCode]) {
      // Use the region slug instead of state code
      router.push(`/suppliers?region=${stateToRegionMap[stateCode]}`);
    } else if (stateCode) {
      // Fallback: if no region found, still navigate with state code
      // The suppliers page can handle this or we can search by state code
      router.push(`/suppliers?search=${stateCode}`);
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

