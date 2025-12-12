export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
] as const;

export type CountryCode = typeof COUNTRIES[number]['code'];

export function getCountryName(code: string): string | undefined {
  return COUNTRIES.find(c => c.code === code)?.name;
}

export function getCountryCode(name: string): string | undefined {
  return COUNTRIES.find(c => c.name === name)?.code;
}






