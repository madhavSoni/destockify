import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { GeneratedPage } from './types';

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
 * Find the most recent generated JSON file
 */
function findLatestGeneratedFile(): string {
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    throw new Error('Output directory not found. Run the generator first.');
  }

  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('generated-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error('No generated files found. Run the generator first.');
  }

  return path.join(outputDir, files[0]);
}

/**
 * Apply a single page's content to the database
 */
async function applyPageContent(page: GeneratedPage): Promise<{ success: boolean; message: string }> {
  try {
    // Check if page exists
    const existing = await prisma.categoryPage.findUnique({
      where: { slug: page.slug },
    });

    if (!existing) {
      return { success: false, message: `Page not found in DB: ${page.slug}` };
    }

    // Update ONLY content fields, preserve everything else
    await prisma.categoryPage.update({
      where: { slug: page.slug },
      data: {
        metaDescription: page.metaDescription,
        heroText: page.heroText,
        featuredSuppliersText: page.featuredSuppliersText,
        centeredValueH2: page.centeredValueH2,
        centeredValueText: page.centeredValueText,
        contentBlocks: JSON.parse(JSON.stringify(page.contentBlocks)),
        faqSectionH2: page.faqSectionH2,
        faqs: JSON.parse(JSON.stringify(page.faqs)),
      },
    });

    return { success: true, message: `Updated ${page.slug}` };
  } catch (error: any) {
    return { success: false, message: `Failed to update ${page.slug}: ${error.message}` };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Apply Generated SEO Content to Database');
  console.log('============================================\n');

  // Parse arguments
  const args = process.argv.slice(2);
  let inputFile = args.find(a => a.startsWith('--file='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  const slugFilter = args.find(a => a.startsWith('--slug='))?.split('=')[1];

  // Find input file
  if (!inputFile) {
    inputFile = findLatestGeneratedFile();
    console.log(`📄 Using latest file: ${path.basename(inputFile)}`);
  } else {
    console.log(`📄 Using specified file: ${inputFile}`);
  }

  // Load generated content
  const content = JSON.parse(fs.readFileSync(inputFile, 'utf-8')) as GeneratedPage[];
  console.log(`📋 Loaded ${content.length} pages from file\n`);

  // Filter if slug specified
  let pagesToApply = content;
  if (slugFilter) {
    pagesToApply = content.filter(p => p.slug === slugFilter);
    if (pagesToApply.length === 0) {
      console.error(`❌ No page found with slug: ${slugFilter}`);
      process.exit(1);
    }
    console.log(`🔍 Filtering to slug: ${slugFilter}\n`);
  }

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // Apply each page
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pagesToApply.length; i++) {
    const page = pagesToApply[i];
    console.log(`[${i + 1}/${pagesToApply.length}] ${page.displayName} (${page.slug})`);

    if (dryRun) {
      console.log(`  ✓ Would update ${page.slug}`);
      successCount++;
    } else {
      const result = await applyPageContent(page);
      if (result.success) {
        console.log(`  ✓ ${result.message}`);
        successCount++;
      } else {
        console.log(`  ✗ ${result.message}`);
        failCount++;
      }
    }
  }

  // Summary
  console.log('\n============================================');
  console.log('📊 Apply Complete');
  console.log(`   Total pages: ${pagesToApply.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  if (dryRun) {
    console.log('\n⚠️  DRY RUN - No database changes made');
    console.log('   Run without --dry-run to apply changes');
  }
  console.log('');

  await prisma.$disconnect();
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
