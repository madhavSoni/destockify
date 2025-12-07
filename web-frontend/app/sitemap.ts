import { MetadataRoute } from 'next';

// Reserved routes that should not be included in sitemap as category pages
const RESERVED_ROUTES = new Set([
  'suppliers', 'categories', 'locations', 'admin', 'about', 'contact', 'privacy', 
  'terms', 'list-your-business', 'submit-listing', 'my-listings', 'profile',
  'guides', 'lot-sizes', 'liquidation-companies', 'brands', 'login', 'signup',
  'forgot-password', 'reset-password', 'verify-email', 'not-found'
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  try {
    // Fetch dynamic data from your API
    const [suppliersResponse, regionsResponse, categoryPagesResponse] = await Promise.all([
      fetch(`${apiUrl}/suppliers?limit=1000`, { cache: 'no-store' }),
      fetch(`${apiUrl}/catalog/regions`, { cache: 'no-store' }),
      fetch(`${apiUrl}/catalog/category-pages`, { cache: 'no-store' }),
    ]);

    const suppliers = await suppliersResponse.json();
    const regions = await regionsResponse.json();
    const categoryPages = await categoryPagesResponse.json();
    
    console.log(`Sitemap: Found ${suppliers.items?.length || 0} suppliers, ${regions.length || 0} regions, and ${categoryPages.length || 0} category pages`);

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/suppliers`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/brands`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/locations`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/list-your-business`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ];

    // Dynamic supplier pages
    const supplierPages: MetadataRoute.Sitemap = suppliers.items?.map((supplier: any) => ({
      url: `${baseUrl}/suppliers/${supplier.slug}`,
      lastModified: supplier.updatedAt ? new Date(supplier.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || [];

    // Location pages (using /locations/[slug] structure)
    const locationPages: MetadataRoute.Sitemap = regions.map((region: any) => ({
      url: `${baseUrl}/locations/${region.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Category pages (using root slug structure /[slug] - NOT /categories/[slug])
    // Filter out reserved routes to avoid conflicts
    const categoryPagesList: MetadataRoute.Sitemap = (Array.isArray(categoryPages) ? categoryPages : [])
      .filter((page: any) => page.slug && !RESERVED_ROUTES.has(page.slug))
      .map((page: any) => ({
        url: `${baseUrl}/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [
      ...staticPages,
      ...supplierPages,
      ...locationPages,
      ...categoryPagesList,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback to static pages only if API fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/suppliers`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
}
