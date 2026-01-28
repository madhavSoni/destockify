/**
 * SEO Content Generator Types
 * Types for generating unique liquidation industry content
 */

export type PageType = 'retailer' | 'category' | 'inventory';

export interface ContentAngle {
  id: string;
  name: string;
  weight: number;  // 0-1, how much to emphasize
  phrases: string[];
}

export interface PageDefinition {
  slug: string;
  displayName: string;
  pageType: PageType;
  keywords: string[];
  angles: ContentAngle[];
  relatedTerms: string[];
  imageStyle: string;
  // Retailer-specific terms (e.g., Amazon: FC, LPN, etc.)
  specificTerms?: string[];
}

export interface ContentBlock {
  h2: string;
  text: string;
  image_prompt: string;
  image_alt: string;
  layout_type: 'image_left' | 'image_right';
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface GeneratedContent {
  metaDescription: string;
  heroText: string;
  featuredSuppliersText: string;
  centeredValueH2: string;
  centeredValueText: string;
  contentBlocks: ContentBlock[];
  faqSectionH2: string;
  faqs: FAQ[];
}

export interface GeneratedPage extends GeneratedContent {
  slug: string;
  displayName: string;
}

export interface KeywordBank {
  general: string[];
  inventoryTypes: string[];
  lotFormats: string[];
  logistics: string[];
  buyerIntents: string[];
  qualityTerms: string[];
  profitTerms: string[];
  retailerSpecific: Record<string, string[]>;
  categorySpecific: Record<string, string[]>;
}

export interface GenerationConfig {
  dryRun: boolean;
  pageSlug?: string;
  pageType?: PageType;
  outputPath?: string;
}
