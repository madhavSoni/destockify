import 'server-only';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

type FetchOptions = {
  revalidate?: number;
  cache?: RequestCache;
};

function buildQueryString(params?: Record<string, unknown>) {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      continue;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function fetchFromApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 60, cache } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    next: { revalidate },
    cache: cache ?? 'force-cache',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API request failed (${response.status}): ${message || response.statusText}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export type CategorySummary = {
  slug: string;
  name: string;
  headline?: string | null;
  description?: string | null;
  icon?: string | null;
  supplierCount: number;
};

export type RegionSummary = {
  slug: string;
  name: string;
  headline?: string | null;
  description?: string | null;
  stateCode?: string | null;
  marketStats?: Record<string, unknown> | null;
  mapImage?: string | null;
  supplierCount: number;
};

export type LotSizeSummary = {
  slug: string;
  name: string;
  headline?: string | null;
  description?: string | null;
  minUnits?: number | null;
  maxUnits?: number | null;
  supplierCount: number;
};

export type SupplierSummary = {
  slug: string;
  name: string;
  shortDescription?: string | null;
  heroImage?: string | null;
  logoImage?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  trustScore?: number | null;
  badges?: string[];
  region?: {
    name: string;
    slug: string;
    stateCode?: string | null;
  } | null;
  categories: Array<{
    slug: string;
    name: string;
  }>;
  lotSizes?: Array<{
    slug: string;
    name: string;
  }>;
};

export type ReviewHighlight = {
  title: string;
  author: string;
  company?: string | null;
  ratingOverall: number;
  highlights?: string[];
  body: string;
  publishedAt?: string;
  supplier: {
    slug: string;
    name: string;
    heroImage?: string | null;
    logoImage?: string | null;
    badges?: string[];
  };
};

export type GuideSummary = {
  slug: string;
  title: string;
  intro?: string | null;
  heroImage?: string | null;
  excerpt?: string | null;
  sections?: unknown;
  isFeatured?: boolean;
  publishedAt?: string | null;
  categories?: Array<{
    slug: string;
    name: string;
  }>;
};

export type FaqItem = {
  question: string;
  answer: string;
  category?: string | null;
  audience?: string | null;
  order?: number;
};

export type SupplierDetailResponse = {
  supplier: {
    slug: string;
    name: string;
    shortDescription?: string | null;
    description?: string | null;
    heroImage?: string | null;
    logoImage?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    averageRating?: number | null;
    reviewCount?: number | null;
    trustScore?: number | null;
    minimumOrder?: string | null;
    leadTime?: string | null;
    badges?: string[];
    specialties?: string[];
    certifications?: string[];
    logisticsNotes?: string | null;
    pricingNotes?: string | null;
    region?: {
      name: string;
      slug: string;
      headline?: string | null;
      description?: string | null;
      stateCode?: string | null;
    } | null;
    categories: Array<{
      slug: string;
      name: string;
      headline?: string | null;
    }>;
    lotSizes: Array<{
      slug: string;
      name: string;
      headline?: string | null;
    }>;
  };
  reviewSummary: {
    average: number | null;
    count: number;
    distribution: {
      oneStar: number;
      twoStar: number;
      threeStar: number;
      fourStar: number;
      fiveStar: number;
    };
    aspects: {
      accuracy: number | null;
      logistics: number | null;
      value: number | null;
      communication: number | null;
    };
  };
  recentReviews: Array<{
    title: string;
    author: string;
    company?: string | null;
    ratingOverall: number;
    highlights?: string[];
    body: string;
    publishedAt?: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    role?: string | null;
    company?: string | null;
    publishedAt?: string;
  }>;
  resources: Array<{
    title: string;
    type: string;
    url?: string | null;
    description?: string | null;
    order: number;
  }>;
  relatedSuppliers: SupplierSummary[];
};

export type SupplierListResponse = {
  items: SupplierSummary[];
  nextCursor: number | null;
};

export type HomepagePayload = {
  stats: {
    suppliers: number;
    reviews: number;
    guides: number;
    categories: number;
  };
  featuredSuppliers: SupplierSummary[];
  spotlightReviews: ReviewHighlight[];
  featuredGuides: GuideSummary[];
  categories: CategorySummary[];
  regions: RegionSummary[];
  lotSizes: LotSizeSummary[];
  faqs: FaqItem[];
};

export const api = {
  home: {
    get: () => fetchFromApi<HomepagePayload>('/home', { revalidate: 30 }),
  },
  suppliers: {
    list: (params?: { category?: string; region?: string; lotSize?: string; search?: string; cursor?: number; limit?: number }) =>
      fetchFromApi<SupplierListResponse>(`/suppliers${buildQueryString(params)}`, { revalidate: 30 }),
    get: (slug: string) => fetchFromApi<SupplierDetailResponse>(`/suppliers/${slug}`, { revalidate: 30 }),
    featured: () => fetchFromApi<SupplierSummary[]>('/suppliers/featured', { revalidate: 30 }),
  },
  catalog: {
    categories: () => fetchFromApi<CategorySummary[]>('/catalog/categories', { revalidate: 3600 }),
    regions: () => fetchFromApi<RegionSummary[]>('/catalog/regions', { revalidate: 3600 }),
    lotSizes: () => fetchFromApi<LotSizeSummary[]>('/catalog/lot-sizes', { revalidate: 3600 }),
  },
  guides: {
    list: (params?: { featuredOnly?: boolean; limit?: number }) =>
      fetchFromApi<GuideSummary[]>(`/guides${buildQueryString(params)}`, { revalidate: 600 }),
    get: (slug: string) => fetchFromApi<GuideSummary>(`/guides/${slug}`, { revalidate: 600 }),
  },
  faq: {
    list: (audience?: string) => fetchFromApi<FaqItem[]>(`/faq${audience ? `?audience=${audience}` : ''}`, { revalidate: 600 }),
  },
};
