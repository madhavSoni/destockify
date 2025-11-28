'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';

type StateInfo = {
  code: string;
  name: string;
  count: number;
};

export function InteractiveMap() {
  const router = useRouter();
  const [stateData, setStateData] = useState<Record<string, StateInfo>>({});
  const [loading, setLoading] = useState(true);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ state: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const result = await api.suppliers.list({ limit: 1 });
        if (result.availableFilters?.states) {
          const stateMap: Record<string, StateInfo> = {};
          result.availableFilters.states.forEach((s) => {
            stateMap[s.code] = { code: s.code, name: s.name, count: s.count };
          });
          setStateData(stateMap);
          setTotalSuppliers(result.total);
        }
      } catch (error) {
        console.error('Failed to fetch state data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStateData();
  }, []);

  const handleStateClick = (stateCode: string) => {
    router.push(`/suppliers?state=${stateCode}`);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Show instruction tooltip
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      state: 'Click states below',
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setTooltip(null), 2000);
  };

  return (
    <div className="mt-10">
      <div className="flex justify-center">
        <div className="relative w-full max-w-5xl">
          <div 
            className="relative cursor-pointer group"
            onClick={handleMapClick}
          >
            <Image
              src="/map.jpg"
              alt="USA Map - Click states below to find suppliers"
              width={1600}
              height={900}
              priority
              className="block w-full h-auto select-none"
              useMap="#us-map"
            />
            {!loading && Object.keys(stateData).length > 0 && (
              <>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-black/10">
                    <div className="text-xs font-semibold text-slate-900 mb-1">Supplier Coverage</div>
                    <div className="text-lg font-bold text-blue-600">{totalSuppliers.toLocaleString()}</div>
                    <div className="text-xs text-slate-600">suppliers across</div>
                    <div className="text-sm font-semibold text-slate-900">{Object.keys(stateData).length} states</div>
                  </div>
                </div>
                {tooltip && (
                  <div
                    className="absolute bg-black/80 text-white px-3 py-2 rounded-md text-sm pointer-events-none z-10"
                    style={{ left: tooltip.x, top: tooltip.y - 40 }}
                  >
                    Click states below to filter
                  </div>
                )}
              </>
            )}
          </div>
          {/* HTML Image Map - Note: This requires precise coordinates for each state */}
          {/* For a production implementation, you'd want to generate these coordinates */}
          {/* or use a library like react-image-mapper or react-simple-maps */}
          <map name="us-map">
            {/* State areas would go here with coordinates */}
            {/* Example: <area shape="rect" coords="x1,y1,x2,y2" href="#" alt="State" /> */}
          </map>
        </div>
      </div>
      
      {!loading && Object.keys(stateData).length > 0 && (
        <div className="mt-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-black/10 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Click a State to Find Suppliers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.values(stateData)
                .sort((a, b) => b.count - a.count)
                .map((state) => (
                  <button
                    key={state.code}
                    onClick={() => handleStateClick(state.code)}
                    onMouseEnter={() => setHoveredState(state.code)}
                    onMouseLeave={() => setHoveredState(null)}
                    className={`text-left p-3 rounded-md border transition-all group ${
                      hoveredState === state.code
                        ? 'border-blue-600 bg-blue-50 shadow-md scale-105'
                        : 'border-black/10 hover:border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm ${
                        hoveredState === state.code ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                      }`}>
                        {state.code}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        {state.count}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{state.name}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

