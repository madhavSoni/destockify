import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/'],
        disallow: ['/admin', '/admin/', '/api/', '/*?sort=*', '/*?utm_*'],
      },
    ],
    sitemap: 'https://findliquidation.com/sitemap.xml',
  };
}
