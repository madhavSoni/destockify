/**
 * Schema.org structured data generators for SEO
 * https://schema.org/
 */

import { WithContext, WebSite, Organization, LocalBusiness, Review, BreadcrumbList, FAQPage, Article } from 'schema-dts';

/**
 * HOMEPAGE SCHEMA
 * Implements: WebSite (with search), Organization
 */
export function generateWebsiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Find Liquidation',
    alternateName: 'Find Liquidation - Wholesale Liquidation Supplier Directory',
    url: 'https://findliquidation.com',
    description: 'Find trusted wholesale liquidation suppliers offering truckloads and pallets. Browse verified suppliers, read reviews, and discover guides to scale your sourcing.',
    potentialAction: ({
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://findliquidation.com/suppliers?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    } as unknown) as any
  };
}

export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Find Liquidation',
    url: 'https://findliquidation.com',
    logo: 'https://findliquidation.com/logo.png', // TODO: Update with actual logo URL
    description: 'Find Liquidation is a wholesale liquidation supplier directory helping buyers find vetted suppliers with transparent reviews and guides.',
    sameAs: [
      // TODO: Add social media URLs when available
      // 'https://twitter.com/destockify',
      // 'https://facebook.com/destockify',
      // 'https://linkedin.com/company/destockify'
    ]
  };
}

/**
 * SUPPLIER PAGE SCHEMA
 * Implements: LocalBusiness, AggregateRating, Review array
 * 
 * Usage: /suppliers/[slug]
 * Data needed: supplier details, reviews, ratings
 * 
 * DYNAMICALLY GENERATES from database data - reviews are NOT hardcoded!
 * All review data comes from your API and updates automatically when reviews change.
 */
export function generateSupplierSchema(
  supplier: any, 
  reviewSummary: any, 
  recentReviews: any[]
): WithContext<LocalBusiness> {
  const schema: WithContext<LocalBusiness> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: supplier.name,
    url: `https://findliquidation.com/suppliers/${supplier.slug}`,
    description: supplier.description || supplier.shortDescription || '',
  };

  // Add contact info if available
  if (supplier.email) schema.email = supplier.email;
  if (supplier.phone) schema.telephone = supplier.phone;
  if (supplier.website) schema.sameAs = [supplier.website];

  // Add images if available
  if (supplier.logoImage) schema.image = supplier.logoImage;

  // Add address if available (region from your database)
  if (supplier.region) {
    schema.address = {
      '@type': 'PostalAddress',
      addressRegion: supplier.region.name,
      addressCountry: 'US'
    };
  }

  // Add aggregate rating if available (from reviewSummary)
  if (reviewSummary && reviewSummary.average && reviewSummary.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: reviewSummary.average,
      reviewCount: reviewSummary.count,
      bestRating: 5,
      worstRating: 1
    };
  }

  // DYNAMIC REVIEWS - Pulls from database via recentReviews
  // These update automatically when new reviews are added/approved
  if (recentReviews && recentReviews.length > 0) {
    schema.review = recentReviews.slice(0, 10).map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author || 'Anonymous'
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.ratingOverall,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: review.body,
      datePublished: review.publishedAt || review.createdAt
    } as Review));
  }

  return schema;
}

/**
 * GUIDE PAGE SCHEMA PLAN
 * Will implement: Article, BreadcrumbList
 * 
 * Usage: /guides/[slug]
 * Data needed: guide title, body, author, dates, images
 */
export function generateArticleSchema(guide: any): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt || guide.description,
    url: `https://findliquidation.com/guides/${guide.slug}`,
    datePublished: guide.createdAt,
    dateModified: guide.updatedAt || guide.createdAt,
    author: {
      '@type': 'Organization',
      name: 'Find Liquidation'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Find Liquidation',
      logo: {
        '@type': 'ImageObject',
        url: 'https://findliquidation.com/logo.png' // TODO: Update
      }
    },
    ...(guide.imageUrl && {
      image: guide.imageUrl
    })
  };
}

/**
 * FAQ PAGE SCHEMA PLAN
 * Will implement: FAQPage
 * 
 * Usage: Any page with FAQ section
 * Data needed: array of questions and answers
 */
export function generateFAQSchema(faqs: any[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * BREADCRUMB SCHEMA PLAN
 * Will implement: BreadcrumbList
 * 
 * Usage: All pages with navigation paths
 * Data needed: array of breadcrumb items
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://findliquidation.com${item.url}`
    }))
  };
}

/**
 * Helper to safely stringify schema for JSON-LD script tag
 */
export function schemaToJsonLd(schema: WithContext<any>): string {
  return JSON.stringify(schema);
}
