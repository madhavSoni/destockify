import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { SupplierCard } from '@/components/supplier-card';
import { generateFAQSchema, generateBreadcrumbSchema, schemaToJsonLd } from '@/lib/schema';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await api.catalog.categoryPages.get(slug);
    
    const metadata: Metadata = {
      title: page.metaTitle || page.pageTitle,
      description: page.metaDescription,
      alternates: {
        canonical: page.canonicalUrl || `https://trustpallet.com/categories/${page.slug}`,
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
        url: `https://trustpallet.com/categories/${page.slug}`,
        siteName: 'TrustPallet',
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
  
  let page;
  try {
    page = await api.catalog.categoryPages.get(slug);
  } catch (error: any) {
    console.error(`[CategoryPage] Error loading page with slug "${slug}":`, error);
    notFound();
  }

  // Fetch featured suppliers if supplierIds are provided
  // Note: This requires supplier slugs to be stored or a public API endpoint to fetch by ID
  // For now, we'll skip featured suppliers display if IDs are provided
  // TODO: Enhance to support supplier fetching by ID or store supplier slugs
  let featuredSuppliers: any[] = [];
  // If supplierIds are provided, we would need to fetch them
  // For MVP, we'll show the section but note that supplier fetching needs to be implemented

  // Generate schemas
  const schemas: any[] = [];
  
  if (page.enableBreadcrumbSchema) {
    schemas.push(generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Categories', url: '/categories' },
      { name: page.pageTitle, url: `/categories/${page.slug}` },
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

      <div className="bg-white">
        {/* Hero Section */}
        {page.heroImage && (
          <div className="relative w-full h-64 sm:h-96 lg:h-[500px]">
            <Image
              src={page.heroImage}
              alt={page.heroImageAlt || page.pageTitle}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                {page.heroH1 && (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                    {page.heroH1}
                  </h1>
                )}
                {page.heroText && (
                  <p className="text-lg sm:text-xl text-white/90">
                    {page.heroText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!page.heroImage && (
          <div className="bg-slate-900 text-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              {page.heroH1 && (
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  {page.heroH1}
                </h1>
              )}
              {page.heroText && (
                <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                  {page.heroText}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Suppliers Section */}
          {page.featuredSuppliersH2 && (
            <section className="mb-16">
              {page.enableDivider && <div className="border-t border-gray-200 mb-12"></div>}
              <div className="text-center mb-8">
                {page.featuredSuppliersH2 && (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                    {page.featuredSuppliersH2}
                  </h2>
                )}
                {page.featuredSuppliersText && (
                  <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                    {page.featuredSuppliersText}
                  </p>
                )}
              </div>
              {featuredSuppliers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {featuredSuppliers.map((supplier: any) => (
                    <SupplierCard key={supplier.slug || supplier.id} supplier={supplier} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-600 py-8">
                  No featured suppliers selected.
                </div>
              )}
            </section>
          )}

          {/* Centered Value Proposition */}
          {page.centeredValueH2 && (
            <section className="mb-16">
              {page.enableDivider && <div className="border-t border-gray-200 mb-12"></div>}
              <div className="text-center max-w-4xl mx-auto">
                {page.centeredValueH2 && (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                    {page.centeredValueH2}
                  </h2>
                )}
                {page.centeredValueText && (
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {page.centeredValueText}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Content Blocks */}
          {contentBlocks.length > 0 && (
            <section className="mb-16 space-y-12">
              {contentBlocks.map((block: any, index: number) => {
                const isImageLeft = block.layout_type === 'image_left';
                return (
                  <div key={index} className={page.enableDivider && index > 0 ? 'border-t border-gray-200 pt-12' : ''}>
                    <article className={`grid gap-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-md md:grid-cols-2 ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
                      {block.image && (
                        <div className={`relative h-64 sm:h-80 w-full md:h-full ${isImageLeft ? '' : 'md:order-2'}`}>
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
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4">
                            {block.h2}
                          </h2>
                        )}
                        {block.text && (
                          <p className="text-base sm:text-lg leading-relaxed text-slate-600 whitespace-pre-line">
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
            <section className="mb-16">
              {page.enableDivider && <div className="border-t border-gray-200 mb-12"></div>}
              <div className="text-center mb-8">
                {page.faqSectionH2 && (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight mb-8">
                    {page.faqSectionH2}
                  </h2>
                )}
              </div>
              <div className="mx-auto max-w-3xl space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <details
                    key={index}
                    className="group rounded-lg border border-black/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                      <div className="flex-1">
                        <div className="text-base sm:text-lg font-semibold text-slate-900">
                          {faq.question}
                        </div>
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
            <section className="mb-16">
              {page.enableDivider && <div className="border-t border-gray-200 mb-12"></div>}
              <div dangerouslySetInnerHTML={{ __html: page.customHtml }} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
