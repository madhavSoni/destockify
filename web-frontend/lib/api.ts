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
  isAdmin?: boolean;
  createdAt?: string;
  authToken?: string;
  verificationToken?: string;
};

export type ProfileResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
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

// Submission types
export type CreateSubmissionPayload = {
  companyName: string;
  companyAddress: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  hoursOfOperation?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
    other?: string;
  };
  ownershipDocuments?: string[];
  notes?: string;
};

export type UpdateSubmissionPayload = Partial<CreateSubmissionPayload>;

export type SubmissionResponse = {
  id: number;
  customerId: number;
  companyName: string;
  companyAddress: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  description: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  hoursOfOperation?: any;
  socialMedia?: any;
  ownershipDocuments: string[];
  notes?: string | null;
  status: string;
  adminNotes?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type MySubmissionsResponse = SubmissionResponse[];

export type AllSubmissionsResponse = {
  submissions: SubmissionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApproveSubmissionResponse = {
  submission: SubmissionResponse;
  supplier: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    logoImage?: string | null;
    heroImage?: string | null;
  };
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
    // Admin: Get all suppliers
    getAllAdmin: (token: string, params?: { search?: string; page?: number; limit?: number }) =>
      fetchFromApi<{ items: any[]; pagination: any }>(`/suppliers/admin/all${buildQueryString(params)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Create supplier
    create: (payload: any, token: string) =>
      fetchFromApi<any>('/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Update supplier
    update: (id: number, payload: any, token: string) =>
      fetchFromApi<any>(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Delete supplier
    delete: (id: number, token: string) =>
      fetchFromApi<{ message: string }>(`/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
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
    // Admin: Get all reviews
    getAllAdmin: (token: string, params?: { status?: 'approved' | 'pending' | 'rejected'; page?: number; limit?: number }) =>
      fetchFromApi<{ items: any[]; pagination: any }>(`/reviews/admin/all${buildQueryString(params)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Approve a review
    approve: (reviewId: number, token: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Unapprove a review
    unapprove: (reviewId: number, token: string, moderationNotes?: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}/unapprove`, {
        method: 'POST',
        body: JSON.stringify({ moderationNotes }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Delete any review permanently
    adminDelete: (reviewId: number, token: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/${reviewId}/admin`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
  },
  submissions: {
    // Customer: Create a new submission
    create: (payload: CreateSubmissionPayload, token: string) =>
      fetchFromApi<SubmissionResponse>('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Get all my submissions
    getMySubmissions: (token: string) =>
      fetchFromApi<MySubmissionsResponse>('/submissions/my-submissions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Get single submission by ID
    getById: (id: number, token: string) =>
      fetchFromApi<SubmissionResponse>(`/submissions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Update my submission
    update: (id: number, payload: UpdateSubmissionPayload, token: string) =>
      fetchFromApi<SubmissionResponse>(`/submissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Customer: Delete my submission
    delete: (id: number, token: string) =>
      fetchFromApi<{ message: string }>(`/submissions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Get all submissions with filters
    getAllAdmin: (token: string, status?: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      
      return fetchFromApi<AllSubmissionsResponse>(
        `/submissions/admin/all?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }
      );
    },
    // Admin: Approve submission
    approve: (id: number, token: string, adminNotes?: string) =>
      fetchFromApi<ApproveSubmissionResponse>(`/submissions/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ adminNotes }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Reject submission
    reject: (id: number, token: string, adminNotes: string) =>
      fetchFromApi<SubmissionResponse>(`/submissions/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ adminNotes }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Delete any submission
    adminDelete: (id: number, token: string) =>
      fetchFromApi<{ message: string }>(`/submissions/${id}/admin`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
  },
  admin: {
    // Get dashboard stats
    dashboard: (token: string) =>
      fetchFromApi<{
        stats: { totalSuppliers: number; totalReviews: number; pendingReviews: number };
        recentActivity: { suppliers: any[]; reviews: any[] };
      }>('/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
  },
};
