const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

type FetchOptions = {
  revalidate?: number;
  cache?: RequestCache;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: string;
  headers?: HeadersInit;
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
  const { revalidate = 60, cache, method = 'GET', body, headers = {} } = options;

  const fetchHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: fetchHeaders,
    body,
    next: method === 'GET' ? { revalidate } : undefined,
    cache: method === 'GET' ? (cache ?? 'force-cache') : 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API request failed ${response.status}: ${response.statusText}`);
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
    id: number;
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

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified?: boolean;
  authToken?: string;
  verificationToken?: string;
};

export type ProfileResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
};

export type CreateReviewPayload = {
  supplierId: number;
  title?: string;
  ratingOverall: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights?: string[];
  body: string;
  images?: string[];
};

export type UpdateReviewPayload = {
  title?: string;
  ratingOverall?: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights?: string[];
  body?: string;
  images?: string[];
};

export type ReviewResponse = {
  id: number;
  supplierId: number;
  customerId: number;
  title?: string | null;
  ratingOverall: number;
  ratingAccuracy?: number | null;
  ratingLogistics?: number | null;
  ratingValue?: number | null;
  ratingCommunication?: number | null;
  highlights: string[];
  body: string;
  images: string[];
  isApproved: boolean;
  moderationNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  supplier: {
    id: number;
    name: string;
    slug: string;
    logoImage?: string | null;
  };
};

export type MyReviewsResponse = ReviewResponse[];

export type ReviewActionResponse = {
  message: string;
  review?: ReviewResponse;
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
  auth: {
    signup: (payload: SignupPayload) =>
      fetchFromApi<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
        cache: 'no-store',
      }),
    login: (payload: LoginPayload) =>
      fetchFromApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        cache: 'no-store',
      }),
    verifyEmail: (token: string) =>
      fetchFromApi<{ message: string; email: string }>(`/auth/verify-email?token=${token}`, {
        cache: 'no-store',
      }),
    forgotPassword: (email: string) =>
      fetchFromApi<{ message: string; resetToken?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        cache: 'no-store',
      }),
    resetPassword: (token: string, newPassword: string) =>
      fetchFromApi<{ message: string; email: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
        cache: 'no-store',
      }),
    profile: (token: string) =>
      fetchFromApi<ProfileResponse>('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
  },
  reviews: {
    // Customer: Create a new review
    create: (payload: CreateReviewPayload, token: string) =>
      fetchFromApi<ReviewActionResponse>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Get all my reviews
    getMyReviews: (token: string) =>
      fetchFromApi<MyReviewsResponse>('/reviews/my-reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Update my review
    update: (reviewId: number, payload: UpdateReviewPayload, token: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Delete my review
    delete: (reviewId: number, token: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Approve a review
    approve: (reviewId: number) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}/approve`, {
        method: 'POST',
        cache: 'no-store',
      }),
    // Admin: Unapprove a review
    unapprove: (reviewId: number, moderationNotes?: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}/unapprove`, {
        method: 'POST',
        body: JSON.stringify({ moderationNotes }),
        cache: 'no-store',
      }),
    // Admin: Delete any review permanently
    adminDelete: (reviewId: number) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}/admin`, {
        method: 'DELETE',
        cache: 'no-store',
      }),
  },
};
