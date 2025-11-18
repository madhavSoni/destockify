import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  try {
    // Fetch dynamic data from your API
    const [suppliersResponse, regionsResponse] = await Promise.all([
      fetch(`${apiUrl}/suppliers?limit=1000`, { cache: 'no-store' }),
      fetch(`${apiUrl}/catalog/regions`, { cache: 'no-store' }),
    ]);

    const suppliers = await suppliersResponse.json();
    const regions = await regionsResponse.json();
    
    console.log(`Sitemap: Found ${suppliers.items?.length || 0} suppliers and ${regions.length || 0} regions`);

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
    ];

    // Dynamic supplier pages
    const supplierPages: MetadataRoute.Sitemap = suppliers.items?.map((supplier: any) => ({
      url: `${baseUrl}/suppliers/${supplier.slug}`,
      lastModified: supplier.updatedAt ? new Date(supplier.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || [];

    // Region-filtered supplier pages (for SEO: "liquidation suppliers in Florida")
    const regionPages: MetadataRoute.Sitemap = regions.map((region: any) => ({
      url: `${baseUrl}/suppliers?region=${region.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...supplierPages,
      ...regionPages,
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
