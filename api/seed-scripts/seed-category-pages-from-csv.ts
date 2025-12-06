import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import csv from 'csv-parser';
import { initializeConfig } from '../src/config';

// Load production environment variables
const envProdPath = path.join(__dirname, '..', '.env.prod');
if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath });
} else {
  console.warn('⚠️  .env.prod not found, using current environment variables');
}

// For local development, use Cloud SQL Proxy connection instead of Unix socket
// Unix socket path only works on Cloud Run
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('/cloudsql/')) {
  // Replace Unix socket path with local proxy connection
  // Format: postgresql://user:pass@localhost:5432/db?host=/cloudsql/...&schema=public
  // Should be: postgresql://user:pass@127.0.0.1:5433/db?schema=public
  const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
  url.hostname = '127.0.0.1';
  url.port = '5433';
  const searchParams = new URLSearchParams(url.search);
  searchParams.delete('host'); // Remove the Unix socket host parameter
  const localDbUrl = `postgresql://${url.username}:${url.password}@${url.hostname}:${url.port}${url.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  process.env.DATABASE_URL = localDbUrl;
  console.log('📝 Using local Cloud SQL Proxy connection (127.0.0.1:5433)');
} else if (process.env.DATABASE_URL) {
  // Direct connection (not Unix socket) - use as-is
  const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
  console.log(`📝 Using direct database connection (${url.hostname}:${url.port || '5432'})`);
}

const prisma = new PrismaClient();

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse CSV row and convert to CategoryPage data structure
 */
function parseCSVRow(row: any): any {
  // Build FAQs array from faq_q1/faq_a1 through faq_q5/faq_a5
  const faqs: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const q = row[`faq_q${i}`]?.trim();
    const a = row[`faq_a${i}`]?.trim();
    if (q && a) {
      faqs.push({ question: q, answer: a });
    }
  }

  // Build content blocks from block1 and block2
  const contentBlocks: any[] = [];
  if (row.block1_h2?.trim() && row.block1_text?.trim()) {
    contentBlocks.push({
      h2: row.block1_h2.trim(),
      text: row.block1_text.trim(),
    });
  }
  if (row.block2_h2?.trim() && row.block2_text?.trim()) {
    contentBlocks.push({
      h2: row.block2_h2.trim(),
      text: row.block2_text.trim(),
    });
  }

  // Map CSV columns to database fields
  // Strip leading slash from slug if present (CSV has /slug format)
  const slug = (row.slug?.trim() || generateSlug(row.name || '')).replace(/^\//, '');
  
  return {
    pageTitle: row.name?.trim() || '',
    metaTitle: row.meta_title?.trim() || '',
    metaDescription: row.meta_description?.trim() || '',
    slug: slug,
    heroH1: row.h1?.trim() || null,
    heroText: row.supporting_text?.trim() || null,
    featuredSuppliersH2: row.featured_suppliers_h2?.trim() || null,
    featuredSuppliersText: row.featured_suppliers_text?.trim() || null,
    centeredValueH2: row.value_prop_h2?.trim() || null,
    centeredValueText: row.value_prop_text?.trim() || null,
    topicCategory: row.page_type?.trim() || null,
    contentBlocks: contentBlocks.length > 0 ? contentBlocks : [],
    faqSectionH2: row.faq_h2?.trim() || null,
    faqs: faqs.length > 0 ? faqs : [],
    enableFaqSchema: faqs.length > 0,
    enableBreadcrumbSchema: true,
    noindex: false,
    nofollow: false,
  };
}

/**
 * Create or update a category page
 */
async function upsertCategoryPage(data: any) {
  // Check if page exists by slug
  const existing = await prisma.categoryPage.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    // Update existing page
    const updated = await prisma.categoryPage.update({
      where: { id: existing.id },
      data: {
        pageTitle: data.pageTitle,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        heroH1: data.heroH1,
        heroText: data.heroText,
        featuredSuppliersH2: data.featuredSuppliersH2,
        featuredSuppliersText: data.featuredSuppliersText,
        centeredValueH2: data.centeredValueH2,
        centeredValueText: data.centeredValueText,
        topicCategory: data.topicCategory,
        contentBlocks: data.contentBlocks,
        faqSectionH2: data.faqSectionH2,
        faqs: data.faqs,
        enableFaqSchema: data.enableFaqSchema,
        enableBreadcrumbSchema: data.enableBreadcrumbSchema,
        noindex: data.noindex,
        nofollow: data.nofollow,
      },
    });
    return { action: 'updated', page: updated };
  } else {
    // Create new page
    const created = await prisma.categoryPage.create({
      data: {
        pageTitle: data.pageTitle,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        slug: data.slug,
        heroH1: data.heroH1,
        heroText: data.heroText,
        featuredSuppliersH2: data.featuredSuppliersH2,
        featuredSuppliersText: data.featuredSuppliersText,
        centeredValueH2: data.centeredValueH2,
        centeredValueText: data.centeredValueText,
        topicCategory: data.topicCategory,
        contentBlocks: data.contentBlocks,
        faqSectionH2: data.faqSectionH2,
        faqs: data.faqs,
        enableFaqSchema: data.enableFaqSchema,
        enableBreadcrumbSchema: data.enableBreadcrumbSchema,
        noindex: data.noindex,
        nofollow: data.nofollow,
      },
    });
    return { action: 'created', page: created };
  }
}

async function main() {
  console.log('🚀 Starting seed from CSV...\n');

  try {
    // Initialize config (loads secrets if needed)
    await initializeConfig();
    
    // Verify DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set. Please ensure .env.prod exists and contains DATABASE_URL, or set it in your environment.');
    }
    
    // Log connection info (masked)
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
    console.log(`📊 Database URL: ${maskedUrl}\n`);

    const csvPath = path.join(__dirname, '..', 'Data for Pallettrust - Sheet1 (1).csv');

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    // Read and parse CSV
    console.log('📄 Reading CSV file...');
    const rows: any[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    console.log(`✅ Parsed ${rows.length} rows from CSV\n`);

    // Process each row
    console.log('📝 Processing category pages...');
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Validate required fields
        if (!row.name?.trim() || !row.slug?.trim()) {
          console.warn(`⚠️  Skipping row ${i + 1}: missing name or slug`);
          errorCount++;
          continue;
        }

        // Parse row data
        const pageData = parseCSVRow(row);

        // Create or update page
        const result = await upsertCategoryPage(pageData);

        if (result.action === 'created') {
          createdCount++;
          console.log(`  ✅ Created: ${pageData.pageTitle} (${pageData.slug})`);
        } else {
          updatedCount++;
          console.log(`  🔄 Updated: ${pageData.pageTitle} (${pageData.slug})`);
        }

        // Progress indicator
        if ((createdCount + updatedCount) % 10 === 0) {
          console.log(`  📊 Progress: ${createdCount + updatedCount} pages processed...`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Failed to process row ${i + 1} (${row.name || 'unknown'}):`, error.message);
        // Continue with next row
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Created: ${createdCount} pages`);
    console.log(`   Updated: ${updatedCount} pages`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total processed: ${createdCount + updatedCount} pages`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

