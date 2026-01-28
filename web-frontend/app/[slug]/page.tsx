import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { FeaturedSuppliersCarousel } from '@/components/featured-suppliers-carousel';
import { generateFAQSchema, generateBreadcrumbSchema, schemaToJsonLd } from '@/lib/schema';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

// Reserved routes that should not be handled by this dynamic route
const RESERVED_ROUTES = new Set([
  'suppliers', 'categories', 'locations', 'admin', 'about', 'contact', 'privacy', 
  'terms', 'list-your-business', 'submit-listing', 'my-listings', 'profile',
  'guides', 'lot-sizes', 'liquidation-companies', 'brands', 'login', 'signup',
  'forgot-password', 'reset-password', 'verify-email', 'not-found'
]);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Don't generate metadata for reserved routes
  if (RESERVED_ROUTES.has(slug)) {
    return {
      title: 'Page Not Found',
    };
  }
  
  try {
    const page = await api.catalog.categoryPages.get(slug);
    
    const metadata: Metadata = {
      title: page.metaTitle || page.pageTitle,
      description: page.metaDescription,
      alternates: {
        canonical: page.canonicalUrl || `https://findliquidation.com/${page.slug}`,
      },
      robots: {
        index: !page.noindex,
        follow: !page.nofollow,
      },
    };

    if (page.ogTitle || page.ogDescription || page.ogImage) {
      metadata.openGraph = {
        title: page.ogTitle || page.metaTitle || page.pageTitle,
        description: page.ogDescription || page.metaDescription,
        ...(page.ogImage && { images: [{ url: page.ogImage }] }),
        url: `https://findliquidation.com/${page.slug}`,
        siteName: 'Find Liquidation',
        type: 'website',
      };
    }

    return metadata;
  } catch {
    return {
      title: 'Category Page',
    };
  }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params since it's a Promise in Next.js 15+
  const { slug } = await params;
  
  // Don't handle reserved routes
  if (RESERVED_ROUTES.has(slug)) {
    notFound();
  }
  
  let page;
  try {
    page = await api.catalog.categoryPages.get(slug);
  } catch (error: any) {
    console.error(`[CategoryPage] Error loading page with slug "${slug}":`, error);
    notFound();
  }

  // Fetch featured suppliers if supplierIds are provided
  let featuredSuppliers: any[] = [];
  
  // Recommended suppliers to auto-select (in order)
  const recommendedSupplierNames = ['B-Stock', 'Liquidation.com', 'Select Liquidation', 'Direct Liquidation'];
  
  let supplierIdsToFetch = page.supplierIds && Array.isArray(page.supplierIds) && page.supplierIds.length > 0
    ? page.supplierIds
    : [];
  
  // If no supplierIds are set, auto-select recommended suppliers
  if (supplierIdsToFetch.length === 0) {
    try {
      // Fetch all suppliers and find the recommended ones by name
      const allSuppliers = await api.suppliers.list({ limit: 1000 });
      const recommendedIds: number[] = [];
      
      for (const name of recommendedSupplierNames) {
        const supplier = allSuppliers.items.find((s: any) => 
          s.name.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(s.name.toLowerCase())
        );
        if (supplier) {
          recommendedIds.push(supplier.id);
        }
      }
      
      supplierIdsToFetch = recommendedIds;
    } catch (error) {
      console.error('[CategoryPage] Error finding recommended suppliers:', error);
    }
  }
  
  if (supplierIdsToFetch.length > 0) {
    try {
      // Normalize IDs to numbers
      const normalizedIds = supplierIdsToFetch.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
      
      if (normalizedIds.length > 0) {
        // Fetch suppliers by IDs using the new backend endpoint
        const fetchedSuppliers = await api.suppliers.getByIds(normalizedIds);
        
        // Preserve the order of recommended suppliers
        if (page.supplierIds && page.supplierIds.length === 0 && supplierIdsToFetch.length > 0) {
          // Auto-selected: maintain recommended order
          featuredSuppliers = recommendedSupplierNames
            .map(name => {
              return fetchedSuppliers.find((s: any) => 
                s.name.toLowerCase().includes(name.toLowerCase()) || 
                name.toLowerCase().includes(s.name.toLowerCase())
              );
            })
            .filter((s): s is any => s !== undefined);
        } else {
          // Manual selection: maintain provided order
          featuredSuppliers = normalizedIds
            .map((id: number) => fetchedSuppliers.find((s: any) => s.id === id))
            .filter((s: any): s is any => s !== undefined);
        }
      }
    } catch (error) {
      console.error('[CategoryPage] Error fetching featured suppliers:', error);
    }
  }

  // Generate schemas
  const schemas: any[] = [];
  
  if (page.enableBreadcrumbSchema) {
    schemas.push(generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: page.pageTitle, url: `/${page.slug}` },
    ]));
  }

  if (page.enableFaqSchema && page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0) {
    schemas.push(generateFAQSchema(page.faqs));
  }

  if (page.customSchema) {
    try {
      const customSchema = typeof page.customSchema === 'string' 
        ? JSON.parse(page.customSchema) 
        : page.customSchema;
      schemas.push(customSchema);
    } catch {
      // Invalid JSON, skip
    }
  }

  const contentBlocks = Array.isArray(page.contentBlocks) ? page.contentBlocks : [];
  const faqs = Array.isArray(page.faqs) ? page.faqs : [];

  return (
    <>
      {/* Schema.org JSON-LD */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaToJsonLd(schema) }}
        />
      ))}

      <div className="bg-slate-50 scroll-smooth">
        {/* Logo Section */}
        {page.logoImage && (
          <section className="w-full bg-white py-8 sm:py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center">
                <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                  <Image
                    src={page.logoImage}
                    alt={page.logoImageAlt || page.pageTitle}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        {page.heroImage && (
          <section className="relative min-h-[300px] sm:min-h-[350px]">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={page.heroImage}
                alt={page.heroImageAlt || page.pageTitle}
                fill
                className="object-cover"
                priority
                quality={90}
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12">
              <div className="max-w-xl space-y-3 sm:space-y-4">
                {page.heroH1 && (
                  <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight text-center sm:text-left antialiased m-0">
                    {page.heroH1}
                  </h1>
                )}
                {page.heroText && (
                  <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 font-normal">
                    {page.heroText}
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    href="/suppliers"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
                  >
                    Browse Supplier Directory
                    <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {!page.heroImage && (
          <section className="relative min-h-[300px] sm:min-h-[350px] bg-slate-900">
            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12">
              <div className="max-w-xl space-y-3 sm:space-y-4">
                {page.heroH1 && (
                  <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight text-center sm:text-left antialiased m-0">
                    {page.heroH1}
                  </h1>
                )}
                {page.heroText && (
                  <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 font-normal">
                    {page.heroText}
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    href="/suppliers"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
                  >
                    Browse Supplier Directory
                    <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* Featured Suppliers Section */}
          {page.featuredSuppliersH2 && (
            <FeaturedSuppliersCarousel
              suppliers={featuredSuppliers}
              title={page.featuredSuppliersH2}
              description={page.featuredSuppliersText}
              enableDivider={page.enableDivider}
              supplierIds={page.supplierIds}
            />
          )}

          {/* CTA to Directory after Featured Suppliers */}
          {page.featuredSuppliersH2 && (
            <div className="mb-16 sm:mb-20 flex justify-center">
              <Link
                href="/suppliers"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-md hover:shadow-lg"
              >
                Browse Supplier Directory
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Centered Value Proposition */}
          {page.centeredValueH2 && (
            <section className="mb-16 sm:mb-20">
              {page.enableDivider && <div className="border-t border-slate-200 mb-12"></div>}
              <div className="text-center max-w-4xl mx-auto">
                {page.centeredValueH2 && (
                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-4">
                    {page.centeredValueH2}
                  </h2>
                )}
                {page.centeredValueText && (
                  <p className="text-base sm:text-lg leading-relaxed text-slate-600">
                    {page.centeredValueText}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Content Blocks */}
          {contentBlocks.length > 0 && (
            <section className="mb-16 sm:mb-20 space-y-6 sm:space-y-8">
              {contentBlocks.map((block: any, index: number) => {
                const isImageLeft = block.layout_type === 'image_left';
                return (
                  <div key={index} className={page.enableDivider && index > 0 ? 'border-t border-slate-200 pt-12' : ''}>
                    <article className={`grid gap-0 overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lift md:grid-cols-2 ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
                      {block.image && (
                        <div className={`relative h-64 sm:h-80 md:min-h-[350px] w-full ${isImageLeft ? '' : 'md:order-2'}`}>
                          <Image
                            src={block.image}
                            alt={block.image_alt || block.h2 || 'Content image'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className={`flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-12 ${isImageLeft ? '' : 'md:order-1'}`}>
                        {block.h2 && (
                          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight mb-4">
                            {block.h2}
                          </h2>
                        )}
                        {block.text && (
                          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 whitespace-pre-line">
                            {block.text}
                          </p>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </section>
          )}

          {/* FAQ Section */}
          {faqs.length > 0 && (
            <section className="mb-16 sm:mb-20 lg:mb-24">
              {page.enableDivider && <div className="border-t border-slate-200 mb-12"></div>}
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-xs sm:text-sm uppercase tracking-widest text-slate-500 font-semibold mb-2">FAQ</div>
                {page.faqSectionH2 && (
                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-900 leading-tight">
                    {page.faqSectionH2}
                  </h2>
                )}
              </div>
              <div className="mx-auto max-w-3xl space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <details
                    key={index}
                    className="group rounded-md bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                      <div className="flex-1">
                        <div className="text-base sm:text-lg font-semibold text-primary-900">
                          {faq.question}
                        </div>
                        {faq.category && (
                          <div className="mt-1 text-xs sm:text-sm uppercase tracking-wide text-slate-400">{faq.category}</div>
                        )}
                      </div>
                      <span className="ml-4 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition group-open:rotate-45">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </span>
                    </summary>
                    <div className="mt-2 px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Custom HTML */}
          {page.customHtml && (
            <section className="mb-16 sm:mb-20">
              {page.enableDivider && <div className="border-t border-slate-200 mb-12"></div>}
              <div dangerouslySetInnerHTML={{ __html: page.customHtml }} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}

