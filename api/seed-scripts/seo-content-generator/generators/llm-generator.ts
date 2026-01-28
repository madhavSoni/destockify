import Anthropic from '@anthropic-ai/sdk';
import { PageDefinition, GeneratedContent, ContentBlock, FAQ } from '../types';
import { getKeywordsForPage } from '../data/keyword-banks';

/**
 * LLM Content Generator using Claude API
 * Generates unique, SEO-optimized content for liquidation pages
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Track used phrases across all pages to ensure uniqueness
const usedPhrases: Set<string> = new Set();

/**
 * Build the system prompt for content generation
 */
function buildSystemPrompt(): string {
  return `You are an expert SEO content writer specializing in the liquidation and wholesale industry. You have deep knowledge of:

- Liquidation terminology: manifested vs unmanifested, HPC (high piece count), shelf pulls, customer returns, overstock, salvage
- Lot formats: pallets, truckloads, FTL/LTL, gaylords, case packs, mixed loads
- Logistics: dock-high, liftgate delivery, freight terms, BOL, warehouse pickup
- Buyer segments: bin stores, eBay/Amazon resellers, Whatnot sellers, flea market vendors, discount stores
- Retailer-specific terms: Amazon (FC, LPN, Smalls, Mediums), Walmart (GM truckloads, shelf pulls), Target (raw loads, case pack)
- Quality grading: Grade A/B/C, tested working, as-is, uninspected

Your content demonstrates genuine expertise and avoids generic marketing language. You write for resellers and wholesale buyers who understand the industry.

CRITICAL RULES:
1. Never repeat the same phrases across different pages
2. Each piece of content must be genuinely unique
3. Use industry-specific terminology naturally, not stuffed
4. Focus on practical buyer value, not hype
5. Always output valid JSON only - no markdown, no explanation`;
}

/**
 * Build the user prompt for a specific page
 */
function buildUserPrompt(page: PageDefinition, usedPhrasesArray: string[]): string {
  const keywords = getKeywordsForPage(page.slug, page.pageType);

  return `Generate SEO content for the "${page.displayName}" liquidation page (${page.slug}).

## Page Context
- **Page Type:** ${page.pageType}
- **Primary Keywords:** ${page.keywords.join(', ')}
- **Angles to Emphasize:** ${page.angles.map(a => `${a.name} (${a.phrases.slice(0, 2).join(', ')})`).join('; ')}
- **Related Terms:** ${page.relatedTerms.join(', ')}
${page.specificTerms ? `- **Specific Industry Terms:** ${page.specificTerms.join(', ')}` : ''}

## AVOID These Phrases (already used on other pages)
${usedPhrasesArray.slice(0, 30).map(p => `- "${p}"`).join('\n')}

## Industry Keyword Bank (use naturally, don't stuff)
${keywords.slice(0, 60).join(', ')}

## Generate the following (output as JSON object):

{
  "metaDescription": "120-160 characters. Focus on buyer value and key differentiators.",
  "heroText": "60-120 words. What makes this liquidation source valuable to resellers. Include lot types available.",
  "featuredSuppliersText": "40-60 words. Brief intro to why these suppliers are recommended for this type of inventory.",
  "centeredValueH2": "Short, compelling H2 heading (5-10 words) about the value proposition.",
  "centeredValueText": "80-120 words. Deep industry insight about pricing factors, condition variance, or ROI drivers for this type.",
  "contentBlocks": [
    {
      "h2": "Compelling section heading about sourcing or quality",
      "text": "90-160 words with NEW industry terminology. Cover lot formats, grading, or buyer considerations.",
      "image_prompt": "Detailed prompt for AI image generation showing this type of merchandise in a warehouse setting",
      "image_alt": "SEO-optimized alt tag (8-15 words) describing the specific merchandise",
      "layout_type": "image_left"
    },
    {
      "h2": "Different angle - logistics, buyer types, or market opportunity",
      "text": "90-160 words. Different focus than block 1. Cover freight, buyer segments, or profit potential.",
      "image_prompt": "Different visual angle than block 1",
      "image_alt": "SEO-optimized alt tag with different focus than block 1",
      "layout_type": "image_right"
    }
  ],
  "faqSectionH2": "${page.displayName} Liquidation FAQ",
  "faqs": [
    {
      "question": "Industry-specific question about sourcing",
      "answer": "60-120 words with practical advice and terminology"
    },
    {
      "question": "Question about lot types or formats",
      "answer": "60-120 words"
    },
    {
      "question": "Question about condition or grading",
      "answer": "60-120 words"
    },
    {
      "question": "Question about pricing or ROI",
      "answer": "60-120 words"
    },
    {
      "question": "Question about logistics or receiving",
      "answer": "60-120 words"
    },
    {
      "question": "Question about best practices or buyer types",
      "answer": "60-120 words"
    },
    {
      "question": "Question about verification or manifests",
      "answer": "60-120 words"
    },
    {
      "question": "Advanced question for experienced buyers",
      "answer": "60-120 words with pro-level insights"
    }
  ]
}

IMPORTANT: Output ONLY the JSON object. No markdown formatting, no explanation before or after.`;
}

/**
 * Parse and validate the LLM response
 */
function parseResponse(response: string): GeneratedContent {
  // Clean up potential markdown formatting
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const required = ['metaDescription', 'heroText', 'featuredSuppliersText', 'centeredValueH2', 'centeredValueText', 'contentBlocks', 'faqSectionH2', 'faqs'];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate content blocks
    if (!Array.isArray(parsed.contentBlocks) || parsed.contentBlocks.length !== 2) {
      throw new Error('contentBlocks must be an array of 2 items');
    }
    for (const block of parsed.contentBlocks) {
      if (!block.h2 || !block.text || !block.image_prompt || !block.image_alt || !block.layout_type) {
        throw new Error('Content block missing required fields');
      }
    }

    // Validate FAQs
    if (!Array.isArray(parsed.faqs) || parsed.faqs.length < 6) {
      throw new Error('faqs must be an array of at least 6 items');
    }
    for (const faq of parsed.faqs) {
      if (!faq.question || !faq.answer) {
        throw new Error('FAQ missing question or answer');
      }
    }

    return parsed as GeneratedContent;
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    console.error('Raw response:', response.slice(0, 500));
    throw error;
  }
}

/**
 * Extract key phrases from content for uniqueness tracking
 */
function extractPhrases(content: GeneratedContent): string[] {
  const phrases: string[] = [];

  // Extract sentences from text fields
  const textFields = [
    content.metaDescription,
    content.heroText,
    content.featuredSuppliersText,
    content.centeredValueH2,
    content.centeredValueText,
  ];

  for (const text of textFields) {
    // Extract 4-5 word phrases
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 4; i++) {
      phrases.push(words.slice(i, i + 4).join(' ').toLowerCase());
    }
  }

  // Extract from content blocks
  for (const block of content.contentBlocks) {
    phrases.push(block.h2.toLowerCase());
    const words = block.text.split(/\s+/);
    for (let i = 0; i < words.length - 4; i++) {
      phrases.push(words.slice(i, i + 4).join(' ').toLowerCase());
    }
  }

  // Extract FAQ questions
  for (const faq of content.faqs) {
    phrases.push(faq.question.toLowerCase());
  }

  return phrases;
}

/**
 * Generate content for a single page using Claude API
 */
export async function generatePageContent(
  page: PageDefinition,
  maxRetries: number = 3
): Promise<GeneratedContent> {
  const usedPhrasesArray = Array.from(usedPhrases);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(page, usedPhrasesArray);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Generating content for ${page.slug} (attempt ${attempt})...`);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      // Extract text content from response
      const textContent = response.content.find(c => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const content = parseResponse(textContent.text);

      // Track phrases for uniqueness
      const newPhrases = extractPhrases(content);
      newPhrases.forEach(p => usedPhrases.add(p));

      console.log(`  ✓ Generated ${page.slug}`);
      return content;

    } catch (error: any) {
      console.error(`  ✗ Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw new Error(`Failed to generate content for ${page.slug} after ${maxRetries} attempts`);
      }
      // Wait before retry
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }

  throw new Error(`Failed to generate content for ${page.slug}`);
}

/**
 * Reset the phrase tracker (useful for testing)
 */
export function resetPhraseTracker(): void {
  usedPhrases.clear();
}

/**
 * Get current phrase count
 */
export function getPhraseCount(): number {
  return usedPhrases.size;
}
