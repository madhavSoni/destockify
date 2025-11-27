import { PrismaClient } from '@prisma/client';

// Use DATABASE_URL from environment if provided, otherwise use default prismaClient
const prisma = process.env.DATABASE_URL
  ? new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  : require('../lib/prismaClient').default;

/**
 * Migration script to move address data from Supplier table to SupplierAddress table
 * 
 * IMPORTANT: Run this AFTER `npx prisma db push` (with old columns still in schema)
 * and BEFORE removing old columns from schema and pushing again.
 * 
 * Steps:
 * 1. Schema has old columns + SupplierAddress model
 * 2. Run: npx prisma db push (creates SupplierAddress table, keeps old columns)
 * 3. Run: npm run migrate:addresses (this script - copies data)
 * 4. Remove old columns from schema
 * 5. Run: npx prisma db push again (drops old columns)
 */
async function migrateAddresses() {
  console.log('Starting address migration...');

  try {
    // Check if SupplierAddress table exists
    try {
      await prisma.supplierAddress.count();
    } catch (error) {
      console.error('ERROR: SupplierAddress table does not exist!');
      console.error('Please run `npx prisma db push` first to create the table.');
      process.exit(1);
    }

    // Check if old address columns exist by querying a supplier
    const testSupplier = await prisma.supplier.findFirst({
      select: {
        id: true,
        streetAddress: true,
        city: true,
        state: true,
        country: true,
      },
    }).catch(() => null);

    if (!testSupplier) {
      console.log('No suppliers found in database.');
      return;
    }

    // Check if old columns exist (they will be undefined if not in schema)
    const hasOldColumns = 'streetAddress' in testSupplier || 'city' in testSupplier || 
                          'state' in testSupplier || 'country' in testSupplier;

    if (!hasOldColumns) {
      console.log('Old address columns not found in schema. Migration may have already been completed.');
      return;
    }

    // Get all suppliers with old address data
    const suppliersWithAddresses = await prisma.supplier.findMany({
      where: {
        OR: [
          { streetAddress: { not: null } },
          { city: { not: null } },
          { state: { not: null } },
          { country: { not: null } },
        ],
      },
      select: {
        id: true,
        streetAddress: true,
        city: true,
        state: true,
        country: true,
      },
    });

    if (suppliersWithAddresses.length === 0) {
      console.log('No suppliers with old address data found.');
      return;
    }

    console.log(`Found ${suppliersWithAddresses.length} suppliers with old address data. Migrating...`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const supplier of suppliersWithAddresses) {
      try {
        // Check if this supplier already has addresses
        const existingAddresses = await prisma.supplierAddress.count({
          where: { supplierId: supplier.id },
        });

        if (existingAddresses > 0) {
          skipped++;
          continue;
        }

        // Only create address if there's actual data
        if (!supplier.streetAddress && !supplier.city && !supplier.state && !supplier.country) {
          skipped++;
          continue;
        }

        // Create address record
        await prisma.supplierAddress.create({
          data: {
            supplierId: supplier.id,
            streetAddress: supplier.streetAddress || null,
            city: supplier.city || null,
            state: supplier.state || null,
            country: supplier.country || null,
            zipCode: null, // Old schema didn't have zipCode
          },
        });

        migrated++;
      } catch (error: any) {
        console.error(`Error migrating supplier ${supplier.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`  ✅ Migrated: ${migrated} addresses`);
    console.log(`  ⏭️  Skipped: ${skipped} suppliers (already had addresses or no data)`);
    if (errors > 0) {
      console.log(`  ❌ Errors: ${errors} suppliers failed to migrate`);
    }

    console.log('\n📝 Next steps:');
    console.log('  1. Remove old address columns (streetAddress, city, state, country) from Supplier model in schema.prisma');
    console.log('  2. Run: npx prisma db push');
    console.log('  3. Run: npx prisma generate');

  } catch (error: any) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateAddresses()
  .then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

