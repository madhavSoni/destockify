import { US_STATES } from './states';

// Map US states to the 4 regions
export const REGIONS = {
  'Northeast': ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
  'Southeast': ['DE', 'MD', 'DC', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'],
  'Midwest': ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
  'Westcoast': ['WA', 'OR', 'CA', 'AK', 'HI', 'MT', 'ID', 'WY', 'CO', 'NM', 'AZ', 'UT', 'NV', 'TX', 'OK'],
} as const;

export type RegionName = keyof typeof REGIONS;

export function getRegionForState(stateCode: string): RegionName | null {
  for (const region of Object.keys(REGIONS) as RegionName[]) {
    const states = REGIONS[region];
    if ((states as readonly string[]).includes(stateCode)) {
      return region;
    }
  }
  return null;
}

export function getStatesForRegion(region: RegionName): readonly string[] {
  return REGIONS[region] || [];
}

