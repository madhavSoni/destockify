import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { RETAILERS, getAllRetailerSlugs } from './config/retailers';
import { CATEGORIES, getAllCategorySlugs } from './config/categories';
import { INVENTORY_TYPES, getAllInventoryTypeSlugs } from './config/inventory-types';
import { generatePageContent, resetPhraseTracker, getPhraseCount } from './generators/llm-generator';
import { PageDefinition, GeneratedContent, GeneratedPage, GenerationConfig, PageType } from './types';

// Load environment variables
const envProdPath = path.join(__dirname, '..', '..', '.env.prod');
const envLocalPath = path.join(__dirname, '..', '..', '.env.local');

if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath });
  console.log('📝 Loaded .env.prod');
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('📝 Loaded .env.local');
}

// Handle Cloud SQL Proxy connection
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('/cloudsql/')) {
  const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
  url.hostname = '127.0.0.1';
  url.port = '5433';
  const searchParams = new URLSearchParams(url.search);
  searchParams.delete('host');
  process.env.DATABASE_URL = `postgresql://${url.username}:${url.password}@${url.hostname}:${url.port}${url.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  console.log('📝 Using Cloud SQL Proxy (127.0.0.1:5433)');
}

const prisma = new PrismaClient();

/**
 * Parse command line arguments
 */
function parseArgs(): GenerationConfig {
  const args = process.argv.slice(2);
  const config: GenerationConfig = {
    dryRun: false,
    pageSlug: undefined,
    pageType: undefined,
    outputPath: undefined,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg.startsWith('--page=')) {
      config.pageSlug = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      config.pageType = arg.split('=')[1] as PageType;
    } else if (arg.startsWith('--output=')) {
      config.outputPath = arg.split('=')[1];
    }
  }

  return config;
}

/**
 * Get all page definitions based on config
 */
function getPageDefinitions(config: GenerationConfig): PageDefinition[] {
  let pages: PageDefinition[] = [];

  // Filter by page type if specified
  if (config.pageType) {
    switch (config.pageType) {
      case 'retailer':
        pages = [...RETAILERS];
        break;
      case 'category':
        pages = [...CATEGORIES];
        break;
      case 'inventory':
        pages = [...INVENTORY_TYPES];
        break;
      default:
        console.error(`Unknown page type: ${config.pageType}`);
        process.exit(1);
    }
  } else {
    pages = [...RETAILERS, ...CATEGORIES, ...INVENTORY_TYPES];
  }

  // Filter by specific slug if specified
  if (config.pageSlug) {
    pages = pages.filter(p => p.slug === config.pageSlug);
    if (pages.length === 0) {
      console.error(`Page not found: ${config.pageSlug}`);
      process.exit(1);
    }
  }

  return pages;
}

/**
 * Update a single page in the database
 */
async function updatePageInDb(slug: string, content: GeneratedContent): Promise<boolean> {
  try {
    // Check if page exists
    const existing = await prisma.categoryPage.findUnique({
      where: { slug },
    });

    if (!existing) {
      console.log(`  ⚠️  Page not found in DB: ${slug}`);
      return false;
    }

    // Update ONLY content fields, preserve everything else
    // Cast arrays to JSON for Prisma
    await prisma.categoryPage.update({
      where: { slug },
      data: {
        metaDescription: content.metaDescription,
        heroText: content.heroText,
        featuredSuppliersText: content.featuredSuppliersText,
        centeredValueH2: content.centeredValueH2,
        centeredValueText: content.centeredValueText,
        contentBlocks: JSON.parse(JSON.stringify(content.contentBlocks)),
        faqSectionH2: content.faqSectionH2,
        faqs: JSON.parse(JSON.stringify(content.faqs)),
      },
    });

    console.log(`  ✓ Updated ${slug} in database`);
    return true;
  } catch (error: any) {
    console.error(`  ✗ Failed to update ${slug}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🚀 SEO Content Generator for FindLiquidation');
  console.log('============================================\n');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    console.error('   Set it in .env.local or pass it when running:');
    console.error('   ANTHROPIC_API_KEY=sk-... npx ts-node ...');
    process.exit(1);
  }

  const config = parseArgs();

  console.log('Configuration:');
  console.log(`  Dry run: ${config.dryRun}`);
  console.log(`  Page filter: ${config.pageSlug || 'all'}`);
  console.log(`  Type filter: ${config.pageType || 'all'}`);
  console.log('');

  const pages = getPageDefinitions(config);
  console.log(`📋 Processing ${pages.length} pages\n`);

  const results: GeneratedPage[] = [];
  let successCount = 0;
  let failCount = 0;

  // Reset phrase tracker for fresh generation
  resetPhraseTracker();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    console.log(`[${i + 1}/${pages.length}] Processing ${page.displayName} (${page.slug})`);

    try {
      // Generate content using Claude
      const content = await generatePageContent(page);

      results.push({
        slug: page.slug,
        displayName: page.displayName,
        ...content,
      });

      // Update database if not dry run
      if (!config.dryRun) {
        const updated = await updatePageInDb(page.slug, content);
        if (updated) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        successCount++;
      }

      // Add small delay between API calls to avoid rate limiting
      if (i < pages.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }

    } catch (error: any) {
      console.error(`  ✗ Failed: ${error.message}`);
      failCount++;
    }
  }

  // Write output file
  const outputPath = config.outputPath || path.join(__dirname, 'output', `generated-${Date.now()}.json`);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Summary
  console.log('\n============================================');
  console.log('📊 Generation Complete');
  console.log(`   Total pages: ${pages.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Unique phrases tracked: ${getPhraseCount()}`);
  console.log(`   Output file: ${outputPath}`);
  if (config.dryRun) {
    console.log('\n⚠️  DRY RUN - No database changes made');
    console.log('   Review the output file, then run without --dry-run');
  }
  console.log('');

  await prisma.$disconnect();
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
