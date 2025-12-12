'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { US_STATES } from '@/lib/constants/states';

type StateOption = {
  code: string;
  name: string;
  count: number;
};

// Generate a gradient image URL based on state name
function getStateImageUrl(stateName: string): string {
  // Use a hash of the state name to generate consistent colors
  let hash = 0;
  for (let i = 0; i < stateName.length; i++) {
    hash = stateName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate two colors based on hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  
  // Create a gradient using CSS or a placeholder service
  // Using a simple gradient approach with colors
  const color1 = `hsl(${hue1}, 70%, 50%)`;
  const color2 = `hsl(${hue2}, 70%, 50%)`;
  
  // Return a data URL for a gradient image
  // In a real implementation, you might want to use an actual image service
  // For now, we'll use a CSS gradient approach
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

export function StateCards() {
  const [availableStates, setAvailableStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.suppliers.list({ limit: 1 });
        if (response.availableFilters?.states) {
          const states = response.availableFilters.states
            .map((state: any) => ({
              code: state.code || '',
              name: state.name || US_STATES.find(s => s.code === state.code)?.name || state.code,
              count: state.count || 0,
            }))
            .filter((state: StateOption) => state.code && state.name)
            .sort((a: StateOption, b: StateOption) => a.name.localeCompare(b.name));
          
          setAvailableStates(states);
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
        // Fallback to all US states if API fails
        setAvailableStates(
          US_STATES.map(state => ({ code: state.code, name: state.name, count: 0 }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Loading states...</p>
      </div>
    );
  }

  if (availableStates.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.6em] text-slate-500 mb-2">SHOP BY STATE</p>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
          Find Liquidation Pallets by State
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {availableStates.map((state) => {
          const gradient = getStateImageUrl(state.name);
          return (
            <Link
              key={state.code}
              href={`/suppliers?state=${state.code}`}
              className="group relative overflow-hidden rounded-lg aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              aria-label={`Buy liquidation pallets in ${state.name}`}
            >
              {/* Background with gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: gradient,
                }}
                role="img"
                aria-label={`Buy liquidation pallets in ${state.name}`}
              />
              
              {/* Black overlay for text readability */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              
              {/* State name */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl text-center leading-tight">
                  {state.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
