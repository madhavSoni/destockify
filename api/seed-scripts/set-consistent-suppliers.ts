import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
const envProdPath = path.join(__dirname, '..', '.env.prod');
const envLocalPath = path.join(__dirname, '..', '.env.local');

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

// The 4 recommended suppliers to use across all category pages
const RECOMMENDED_SUPPLIER_NAMES = ['B-Stock', 'Liquidation.com', 'Select Liquidation', 'Direct Liquidation'];

async function main() {
  console.log('\n🚀 Set Consistent Featured Suppliers');
  console.log('=====================================\n');

  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // First, find the supplier IDs for the recommended suppliers
  const allSuppliers = await prisma.supplier.findMany({
    select: { id: true, name: true },
  });

  console.log(`📋 Found ${allSuppliers.length} total suppliers\n`);

  const recommendedIds: number[] = [];
  for (const name of RECOMMENDED_SUPPLIER_NAMES) {
    const supplier = allSuppliers.find((s) =>
      s.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (supplier) {
      console.log(`  ✓ Found "${name}" → ID: ${supplier.id} (${supplier.name})`);
      recommendedIds.push(supplier.id);
    } else {
      console.log(`  ✗ Could not find supplier matching "${name}"`);
    }
  }

  if (recommendedIds.length !== 4) {
    console.error('\n❌ Could not find all 4 recommended suppliers. Aborting.');
    process.exit(1);
  }

  console.log(`\n✓ Recommended supplier IDs: [${recommendedIds.join(', ')}]\n`);

  // Get all category pages
  const categoryPages = await prisma.categoryPage.findMany({
    select: { id: true, slug: true, supplierIds: true, featuredSuppliersH2: true },
  });

  console.log(`📋 Found ${categoryPages.length} category pages\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const page of categoryPages) {
    const currentIds = page.supplierIds || [];
    const currentIdsString = JSON.stringify(currentIds);
    const targetIdsString = JSON.stringify(recommendedIds);

    if (currentIdsString === targetIdsString) {
      console.log(`  ⏭ ${page.slug} - already has correct suppliers`);
      skippedCount++;
      continue;
    }

    if (dryRun) {
      console.log(`  📝 ${page.slug} - would update: ${currentIdsString} → ${targetIdsString}`);
    } else {
      await prisma.categoryPage.update({
        where: { id: page.id },
        data: { supplierIds: recommendedIds },
      });
      console.log(`  ✓ ${page.slug} - updated suppliers`);
    }
    updatedCount++;
  }

  console.log('\n=====================================');
  console.log('📊 Complete');
  console.log(`   Total pages: ${categoryPages.length}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Skipped (already correct): ${skippedCount}`);
  if (dryRun) {
    console.log('\n⚠️  DRY RUN - No database changes made');
    console.log('   Run without --dry-run to apply changes');
  }
  console.log('');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
