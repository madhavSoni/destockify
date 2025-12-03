const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://destockify-api-78602435411.us-central1.run.app/api';

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

export type SupplierAddress = {
  id: number;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
};

export type SupplierSummary = {
  slug: string;
  name: string;
  shortDescription?: string | null;
  heroImage?: string | null;
  logoImage?: string | null;
  isVerified?: boolean;
  isScam?: boolean;
  flags?: Array<{
    text: string;
    variant: 'verified' | 'scam';
  }>;
  homeRank?: number;
  addresses?: SupplierAddress[];
  city?: string | null;
  state?: string | null;
  country?: string | null;
  region?: {
    slug: string;
    name: string;
  } | null;
  categories: Array<{
    slug: string;
    name: string;
  }>;
  ratingAverage?: number | null;
  ratingCount?: number;
};

export type ReviewHighlight = {
  author: string;
  ratingOverall: number;
  body: string;
  images?: string[];
  publishedAt?: string;
  supplier: {
    slug: string;
    name: string;
    heroImage?: string | null;
    logoImage?: string | null;
  };
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
    isVerified?: boolean;
    isScam?: boolean;
    isContractHolder?: boolean;
    isBroker?: boolean;
    flags?: Array<{
      text: string;
      variant: 'verified' | 'scam';
    }>;
    socialLink?: string | null;
    addresses?: SupplierAddress[];
    region?: {
      slug: string;
      name: string;
      headline?: string | null;
    } | null;
    categories: Array<{
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
  };
  recentReviews: Array<{
    author: string;
    ratingOverall: number;
    body: string;
    images?: string[];
    publishedAt?: string;
  }>;
  relatedSuppliers: SupplierSummary[];
};

export type SupplierListResponse = {
  items: SupplierSummary[];
  nextCursor: number | null;
  total: number;
  availableFilters?: {
    states: Array<{ code: string; name: string; count: number }>;
    countries: Array<{ code: string; name: string; count: number }>;
    categories: Array<{ id: number; name: string; slug: string; count: number }>;
  };
};

export type HomepagePayload = {
  stats: {
    suppliers: number;
    reviews: number;
    categories: number;
  };
  featuredSuppliers: SupplierSummary[];
  spotlightReviews: ReviewHighlight[];
  categories: CategorySummary[];
  regions: RegionSummary[];
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
  ratingOverall: number; // Single 1-5 integer rating
  body: string;
  images?: string[];
  isAnonymous?: boolean;
};

export type UpdateReviewPayload = {
  ratingOverall?: number; // Single 1-5 integer rating
  body?: string;
  images?: string[];
};

export type ReviewResponse = {
  id: number;
  supplierId: number;
  customerId: number;
  author: string; // reviewer_name
  ratingOverall: number; // Single 1-5 integer rating
  body: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
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

export type SupplierImage = {
  id: number;
  url: string;
  caption?: string | null;
  isPrimary: boolean;
  order: number;
};

export type SupplierAdminResponse = {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  heroImage?: string | null;
  logoImage?: string | null;
  isVerified: boolean;
  isScam: boolean;
  homeRank: number;
  socialLink?: string | null;
  regionId?: number | null;
  categoryIds: number[];
  addresses?: SupplierAddress[];
  images: SupplierImage[];
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
    list: (params?: { category?: string; region?: string; state?: string; country?: string; search?: string; cursor?: number; limit?: number; verified?: boolean; sort?: string; isContractHolder?: boolean; isBroker?: boolean }) =>
      fetchFromApi<SupplierListResponse>(`/suppliers${buildQueryString(params)}`, { cache: 'no-store' }),
    get: (slug: string) => fetchFromApi<SupplierDetailResponse>(`/suppliers/${slug}`, { revalidate: 30 }),
    featured: () => fetchFromApi<SupplierSummary[]>('/suppliers/featured', { revalidate: 30 }),
    // Admin: Get supplier by ID
    getByIdAdmin: (id: number, token: string) =>
      fetchFromApi<any>(`/suppliers/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
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
    categoryPages: {
      list: () => fetchFromApi<any[]>('/catalog/category-pages', { revalidate: 60 }),
      get: (slug: string) => fetchFromApi<any>(`/catalog/category-pages/${slug}`, { revalidate: 60 }),
    },
    // Admin: Get category by ID
    getCategoryById: (id: number, token: string) =>
      fetchFromApi<any>(`/catalog/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Create category
    createCategory: (payload: any, token: string) =>
      fetchFromApi<any>('/catalog/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Update category
    updateCategory: (id: number, payload: any, token: string) =>
      fetchFromApi<any>(`/catalog/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Delete category
    deleteCategory: (id: number, token: string) =>
      fetchFromApi<{ message: string }>(`/catalog/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Get region by ID
    getRegionById: (id: number, token: string) =>
      fetchFromApi<any>(`/catalog/regions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Create region
    createRegion: (payload: any, token: string) =>
      fetchFromApi<any>('/catalog/regions', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Update region
    updateRegion: (id: number, payload: any, token: string) =>
      fetchFromApi<any>(`/catalog/regions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Delete region
    deleteRegion: (id: number, token: string) =>
      fetchFromApi<{ message: string }>(`/catalog/regions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
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
    // Admin: Get reviews by supplier ID
    getBySupplierAdmin: (supplierId: number, token: string) =>
      fetchFromApi<any[]>(`/reviews/admin/supplier/${supplierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Update any review
    adminUpdate: (reviewId: number, payload: any, token: string) =>
      fetchFromApi<ReviewActionResponse>(`/reviews/admin/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }),
    // Admin: Create review
    adminCreate: (payload: any, token: string) =>
      fetchFromApi<ReviewActionResponse>('/reviews/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
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
    // Upload image - converts File to base64 and sends as JSON
    uploadImage: async (file: File, token: string): Promise<string> => {
      // Convert file to base64 data URL
      const base64Promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      
      return fetchFromApi<{ url: string }>('/admin/upload-image', {
        method: 'POST',
        body: JSON.stringify({
          image: base64Data,
          filename: file.name,
          mimeType: file.type,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }).then(data => data.url);
    },
    // Categories management
    categories: {
      list: (token: string) =>
        fetchFromApi<any[]>('/catalog/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      get: (id: number, token: string) =>
        fetchFromApi<any>(`/catalog/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      create: (payload: any, token: string) =>
        fetchFromApi<any>('/catalog/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      update: (id: number, payload: any, token: string) =>
        fetchFromApi<any>(`/catalog/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      delete: (id: number, token: string) =>
        fetchFromApi<{ message: string }>(`/catalog/categories/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
    },
    // Regions management
    regions: {
      list: (token: string) =>
        fetchFromApi<any[]>('/catalog/regions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      get: (id: number, token: string) =>
        fetchFromApi<any>(`/catalog/regions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      create: (payload: any, token: string) =>
        fetchFromApi<any>('/catalog/regions', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      update: (id: number, payload: any, token: string) =>
        fetchFromApi<any>(`/catalog/regions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      delete: (id: number, token: string) =>
        fetchFromApi<{ message: string }>(`/catalog/regions/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
    },
    // Suppliers management (already exists, but ensure it's comprehensive)
    suppliers: {
      list: (token: string, params?: { search?: string; page?: number; limit?: number }) =>
        fetchFromApi<{ items: any[]; pagination: any }>(`/suppliers/admin/all${buildQueryString(params)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      get: (id: number, token: string) =>
        fetchFromApi<any>(`/suppliers/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      create: (payload: any, token: string) =>
        fetchFromApi<any>('/suppliers', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      update: (id: number, payload: any, token: string) =>
        fetchFromApi<any>(`/suppliers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      delete: (id: number, token: string) =>
        fetchFromApi<{ message: string }>(`/suppliers/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      // Address management
      createAddress: (supplierId: number, payload: { streetAddress?: string; city?: string; state?: string; country?: string; zipCode?: string }, token: string) =>
        fetchFromApi<SupplierAddress>(`/suppliers/${supplierId}/addresses`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      updateAddress: (addressId: number, payload: { streetAddress?: string; city?: string; state?: string; country?: string; zipCode?: string }, token: string) =>
        fetchFromApi<SupplierAddress>(`/suppliers/addresses/${addressId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      deleteAddress: (addressId: number, token: string) =>
        fetchFromApi<{ message: string }>(`/suppliers/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
    },
    // Reviews management (already exists, but ensure it's comprehensive)
    reviews: {
      list: (token: string, params?: { status?: 'approved' | 'pending' | 'rejected'; page?: number; limit?: number }) =>
        fetchFromApi<{ items: any[]; pagination: any }>(`/reviews/admin/all${buildQueryString(params)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      get: (id: number, token: string) =>
        fetchFromApi<any>(`/reviews/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      create: (payload: any, token: string) =>
        fetchFromApi<any>('/reviews/admin', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      update: (id: number, payload: any, token: string) =>
        fetchFromApi<any>(`/reviews/admin/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      delete: (id: number, token: string) =>
        fetchFromApi<{ message: string }>(`/reviews/${id}/admin`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      approve: (id: number, token: string) =>
        fetchFromApi<any>(`/reviews/${id}/approve`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      unapprove: (id: number, token: string) =>
        fetchFromApi<any>(`/reviews/${id}/unapprove`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
    },
    // Category Pages management
    categoryPages: {
      list: (token: string, params?: { limit?: number; offset?: number }) =>
        fetchFromApi<{ items: any[]; total: number; limit: number; offset: number }>(`/admin/category-pages${buildQueryString(params)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      get: (id: number, token: string) =>
        fetchFromApi<any>(`/admin/category-pages/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      create: (payload: any, token: string) =>
        fetchFromApi<any>('/admin/category-pages', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      update: (id: number, payload: any, token: string) =>
        fetchFromApi<any>(`/admin/category-pages/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      delete: (id: number, token: string) =>
        fetchFromApi<{ message: string }>(`/admin/category-pages/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
    },
  },
};
