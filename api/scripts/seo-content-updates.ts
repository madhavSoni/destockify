/**
 * SEO Content Updates Script
 *
 * Updates:
 * 1. Supplier descriptions (150+ words) via Claude API
 * 2. Missing supplier website URLs
 * 3. Region content (headline, description, marketStats)
 * 4. Category page OG data (ogTitle, ogDescription, ogImage)
 *
 * Usage:
 *   dotenv -e .env.prod -- ts-node -r tsconfig-paths/register scripts/seo-content-updates.ts
 *   dotenv -e .env.prod -- ts-node -r tsconfig-paths/register scripts/seo-content-updates.ts --dry-run
 *   dotenv -e .env.prod -- ts-node -r tsconfig-paths/register scripts/seo-content-updates.ts --only=regions
 *   dotenv -e .env.prod -- ts-node -r tsconfig-paths/register scripts/seo-content-updates.ts --only=og
 *   dotenv -e .env.prod -- ts-node -r tsconfig-paths/register scripts/seo-content-updates.ts --only=suppliers
 */

import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
const envProdPath = path.join(__dirname, '..', '.env.prod');
const envLocalPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envProdPath)) {
  dotenv.config({ path: envProdPath });
  console.log('Loaded .env.prod');
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('Loaded .env.local');
}

// Handle Cloud SQL Proxy connection
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('/cloudsql/')) {
  const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
  url.hostname = '127.0.0.1';
  url.port = '5433';
  const searchParams = new URLSearchParams(url.search);
  searchParams.delete('host');
  process.env.DATABASE_URL = `postgresql://${url.username}:${url.password}@${url.hostname}:${url.port}${url.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  console.log('Using Cloud SQL Proxy (127.0.0.1:5433)');
}

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Parse CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY = args.find(a => a.startsWith('--only='))?.split('=')[1];

// ============================================================
// 1. SUPPLIER DESCRIPTIONS (Claude-generated, 150+ words)
// ============================================================

interface SupplierData {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  website: string | null;
  isVerified: boolean;
  isContractHolder: boolean;
  isBroker: boolean;
  region: { name: string; slug: string } | null;
  categories: Array<{ category: { name: string; slug: string } }>;
  addresses: Array<{ city: string | null; state: string | null; country: string | null }>;
}

async function generateSupplierDescription(supplier: SupplierData): Promise<string> {
  const categories = supplier.categories.map(c => c.category.name).join(', ') || 'general merchandise';
  const region = supplier.region?.name || 'United States';
  const location = supplier.addresses[0]
    ? `${supplier.addresses[0].city || ''}, ${supplier.addresses[0].state || ''}`.replace(/^, |, $/g, '').trim()
    : '';
  const existingDesc = supplier.description || supplier.shortDescription || '';
  const supplierType = supplier.isContractHolder ? 'contract holder' : supplier.isBroker ? 'broker' : 'liquidation supplier';
  const verified = supplier.isVerified ? 'verified' : '';

  const prompt = `Write a detailed company description for "${supplier.name}", a ${verified} ${supplierType} in the liquidation and wholesale industry.

Existing short description: "${existingDesc}"
Location: ${location || region}
Region: ${region}
Categories: ${categories}
Website: ${supplier.website || 'N/A'}
Is contract holder: ${supplier.isContractHolder}
Is broker: ${supplier.isBroker}

Requirements:
- Write EXACTLY 150-200 words (count carefully)
- Cover: what they sell, lot types (pallets, truckloads), categories they serve, regions/shipping, buyer types they serve
- Use natural liquidation industry terminology
- Write in third person about the company
- Do NOT include the company name at the start - vary the opening
- Focus on practical buyer value
- Output ONLY the description text, no quotes or formatting`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return text;
}

async function updateSupplierDescriptions() {
  console.log('\n=== UPDATING SUPPLIER DESCRIPTIONS ===\n');

  const suppliers = await prisma.supplier.findMany({
    include: {
      categories: { include: { category: true } },
      region: true,
      addresses: true,
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${suppliers.length} suppliers total`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const supplier of suppliers) {
    const wordCount = supplier.description ? supplier.description.split(/\s+/).length : 0;

    if (wordCount >= 150) {
      console.log(`  SKIP ${supplier.name} (${wordCount} words - already good)`);
      skipped++;
      continue;
    }

    console.log(`  Generating for ${supplier.name} (currently ${wordCount} words)...`);

    try {
      const description = await generateSupplierDescription(supplier as unknown as SupplierData);
      const newWordCount = description.split(/\s+/).length;
      console.log(`    Generated: ${newWordCount} words`);

      if (!DRY_RUN) {
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: { description },
        });
        console.log(`    Updated in DB`);
      } else {
        console.log(`    [DRY RUN] Would update: "${description.substring(0, 80)}..."`);
      }
      updated++;

      // Rate limiting
      await new Promise(r => setTimeout(r, 500));
    } catch (error: any) {
      console.error(`    FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log(`\nSupplier descriptions: ${updated} updated, ${skipped} skipped, ${failed} failed`);
}

// ============================================================
// 2. MISSING SUPPLIER WEBSITE URLs
// ============================================================

// Known website URLs for suppliers that are missing them
const SUPPLIER_WEBSITES: Record<string, string> = {
  'comprehensive-liquidation': 'https://comprehensiveliquidation.com',
  'ice-liquidation': 'https://iceliquidation.com',
  'idx-liquidations': 'https://idxliquidations.com',
  'keystone-liquidators': 'https://keystoneliquidators.com',
  'liquidation-brokers-llc': 'https://liquidationbrokers.com',
  'liquidation-closeouts': 'https://liquidationcloseouts.com',
  'midtown-liquidation': 'https://midtownliquidation.com',
  'premier-liquidation': 'https://premierliquidation.com',
  'wholesale-truckload-liquidators': 'https://wholesaletruckloadliquidators.com',
};

async function updateSupplierWebsites() {
  console.log('\n=== UPDATING MISSING SUPPLIER WEBSITES ===\n');

  const suppliersWithoutWebsite = await prisma.supplier.findMany({
    where: {
      OR: [
        { website: null },
        { website: '' },
      ],
    },
    select: { id: true, name: true, slug: true, website: true },
  });

  console.log(`Found ${suppliersWithoutWebsite.length} suppliers without websites`);
  let updated = 0;

  for (const supplier of suppliersWithoutWebsite) {
    const website = SUPPLIER_WEBSITES[supplier.slug];
    if (!website) {
      console.log(`  SKIP ${supplier.name} - no known website URL`);
      continue;
    }

    console.log(`  ${supplier.name}: ${website}`);
    if (!DRY_RUN) {
      await prisma.supplier.update({
        where: { id: supplier.id },
        data: { website },
      });
    }
    updated++;
  }

  console.log(`\nSupplier websites: ${updated} updated`);
}

// ============================================================
// 3. REGION CONTENT
// ============================================================

interface RegionContent {
  headline: string;
  description: string;
  marketStats: Record<string, unknown>;
}

const REGION_CONTENT: Record<string, RegionContent> = {
  southeast: {
    headline: 'Buy Liquidation Truckloads in the Southeast',
    description: `The Southeast is one of the largest and most active liquidation markets in the United States, anchored by major distribution hubs in Georgia, Florida, Tennessee, and the Carolinas. Amazon, Walmart, and Target operate dozens of fulfillment centers across the region, generating a steady flow of customer returns, overstock, and shelf-pull merchandise year-round. Suppliers in this region specialize in full truckloads and pallets of general merchandise, electronics, home goods, and apparel at 70-90% below retail. Freight costs within the Southeast remain among the lowest in the country thanks to dense interstate corridors (I-75, I-95, I-85) and proximity to major ports like Savannah and Jacksonville. Buyers range from bin store operators and flea market vendors to Amazon and eBay resellers sourcing inventory for online arbitrage. Whether you are launching a discount retail operation or scaling an existing resale business, the Southeast offers the volume, variety, and competitive pricing that liquidation buyers depend on.`,
    marketStats: {
      averageFreight: '$800-1,400 per truckload (regional)',
      buyerSegments: ['Bin stores', 'Online resellers', 'Flea market vendors', 'Discount retailers', 'Export buyers'],
      keyStates: ['GA', 'FL', 'NC', 'SC', 'TN', 'AL'],
      topCategories: ['General merchandise', 'Electronics', 'Home goods', 'Apparel'],
    },
  },
  midwest: {
    headline: 'Buy Liquidation Truckloads in the Midwest',
    description: `The Midwest serves as a critical logistics crossroads for the liquidation industry, with major warehouses and distribution centers spanning from Ohio and Indiana to Illinois, Michigan, and Missouri. National retailers and e-commerce platforms maintain massive return processing centers throughout the region, creating consistent inventory pipelines for wholesale buyers. Midwestern liquidation suppliers are known for competitive truckload pricing and reliable manifesting, offering pallets and full loads of electronics, tools, home improvement products, and seasonal merchandise. Central geographic positioning keeps freight costs manageable for buyers shipping to either coast, making the Midwest an ideal sourcing hub for resellers with national customer bases. The region's strong warehouse infrastructure supports dock-high loading, liftgate delivery, and will-call pickup options. Buyer demographics include brick-and-mortar discount stores, e-commerce sellers on Amazon and eBay, Whatnot livestream sellers, and international export buyers who consolidate containers from Midwest warehouses before shipping overseas.`,
    marketStats: {
      averageFreight: '$900-1,600 per truckload (regional)',
      buyerSegments: ['Discount stores', 'E-commerce sellers', 'Whatnot sellers', 'Export consolidators', 'Bin stores'],
      keyStates: ['OH', 'IN', 'IL', 'MI', 'MO', 'WI'],
      topCategories: ['Electronics', 'Tools', 'Home improvement', 'Seasonal merchandise'],
    },
  },
  northeast: {
    headline: 'Buy Liquidation Truckloads in the Northeast',
    description: `The Northeast is home to some of the highest-volume liquidation operations in the country, concentrated around New Jersey, Pennsylvania, New York, and Connecticut. Proximity to the Port of New York and Newark makes the region a natural hub for both domestic resale and international export of liquidation inventory. Major retailers operate return centers and closeout warehouses throughout the I-95 corridor, feeding a constant supply of manifested and unmanifested pallets to wholesale buyers. Northeast suppliers typically offer diverse category mixes including electronics, health and beauty, designer apparel, and high-value consumer goods. While warehouse space costs run higher than other regions, lot quality tends to be strong due to competition among established liquidators. The dense population and robust e-commerce adoption create high domestic demand, and many buyers operate bin stores, dollar stores, or online resale businesses from the region. Freight to other parts of the country is offset by the superior lot quality and brand-name inventory available.`,
    marketStats: {
      averageFreight: '$1,000-1,800 per truckload (regional)',
      buyerSegments: ['Export buyers', 'Bin stores', 'Dollar stores', 'Online resellers', 'Boutique retailers'],
      keyStates: ['NJ', 'PA', 'NY', 'CT', 'MA', 'MD'],
      topCategories: ['Electronics', 'Health & beauty', 'Designer apparel', 'Consumer goods'],
    },
  },
  westcoast: {
    headline: 'Buy Liquidation Truckloads on the West Coast',
    description: `The West Coast liquidation market benefits from direct access to Amazon, Costco, and Walmart fulfillment networks stretching from Southern California to Washington State. Los Angeles and the Inland Empire form the largest cluster of liquidation warehouses in the western United States, with additional activity around the San Francisco Bay Area, Portland, and Seattle. West Coast suppliers handle enormous volumes of customer returns, overstock, and shelf pulls, particularly in electronics, outdoor and sporting goods, home furnishings, and tech accessories. Port proximity in Long Beach, Oakland, and Seattle-Tacoma supports a thriving export market, with buyers consolidating full containers of liquidation merchandise for shipment to Latin America, Africa, and Southeast Asia. Domestic buyers include discount retailers, Amazon FBA sellers, eBay resellers, and bin store operators who appreciate the region's fast inventory turnover and access to premium brand-name products. While freight costs for cross-country shipping can be higher, local and regional buyers benefit from competitive pallet and truckload pricing.`,
    marketStats: {
      averageFreight: '$1,200-2,000 per truckload (regional)',
      buyerSegments: ['Export buyers', 'Amazon FBA sellers', 'eBay resellers', 'Discount retailers', 'Bin stores'],
      keyStates: ['CA', 'WA', 'OR', 'AZ', 'NV'],
      topCategories: ['Electronics', 'Outdoor & sporting goods', 'Home furnishings', 'Tech accessories'],
    },
  },
};

async function updateRegionContent() {
  console.log('\n=== UPDATING REGION CONTENT ===\n');

  const regions = await prisma.region.findMany();
  let updated = 0;

  for (const region of regions) {
    const content = REGION_CONTENT[region.slug];
    if (!content) {
      console.log(`  SKIP ${region.name} - no content defined`);
      continue;
    }

    console.log(`  ${region.name}: headline="${content.headline}"`);
    console.log(`    Description: ${content.description.split(/\s+/).length} words`);

    if (!DRY_RUN) {
      await prisma.region.update({
        where: { id: region.id },
        data: {
          headline: content.headline,
          description: content.description,
          marketStats: JSON.parse(JSON.stringify(content.marketStats)),
        },
      });
      console.log(`    Updated in DB`);
    }
    updated++;
  }

  console.log(`\nRegions: ${updated} updated`);
}

// ============================================================
// 4. CATEGORY PAGE OG DATA
// ============================================================

async function updateCategoryPageOgData() {
  console.log('\n=== UPDATING CATEGORY PAGE OG DATA ===\n');

  const pages = await prisma.categoryPage.findMany({
    where: {
      OR: [
        { ogTitle: null },
        { ogTitle: '' },
      ],
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${pages.length} category pages missing OG data`);
  let updated = 0;

  for (const page of pages) {
    const ogTitle = `${page.metaTitle} | Find Liquidation`;
    const ogDescription = page.metaDescription;
    const ogImage = page.heroImage || null;

    console.log(`  ${page.slug}: ogTitle="${ogTitle.substring(0, 60)}..."`);

    if (!DRY_RUN) {
      await prisma.categoryPage.update({
        where: { id: page.id },
        data: {
          ogTitle,
          ogDescription,
          ogImage,
        },
      });
    }
    updated++;
  }

  console.log(`\nCategory pages OG: ${updated} updated`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('\n=== SEO Content Updates ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Filter: ${ONLY || 'all'}\n`);

  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection OK\n');
  } catch (error: any) {
    console.error('Database connection FAILED:', error.message);
    console.error('Make sure Cloud SQL Proxy is running on port 5433');
    process.exit(1);
  }

  if (!ONLY || ONLY === 'regions') {
    await updateRegionContent();
  }

  if (!ONLY || ONLY === 'og') {
    await updateCategoryPageOgData();
  }

  if (!ONLY || ONLY === 'websites') {
    await updateSupplierWebsites();
  }

  if (!ONLY || ONLY === 'suppliers') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('\nANTHROPIC_API_KEY required for supplier descriptions');
      console.error('Set it in .env.prod or pass it: ANTHROPIC_API_KEY=sk-... ...');
    } else {
      await updateSupplierDescriptions();
    }
  }

  console.log('\n=== DONE ===\n');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
