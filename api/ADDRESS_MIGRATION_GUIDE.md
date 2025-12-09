# Address Migration Guide

This guide walks you through migrating address data from the `Supplier` table to the new `SupplierAddress` table.

## Current State

- ✅ Schema has been updated with `SupplierAddress` model
- ✅ Old address columns (`streetAddress`, `city`, `state`, `country`) are temporarily added back to `Supplier` model
- ✅ Migration script created at `src/scripts/migrate-addresses.ts`

## Migration Steps

### Step 1: Push Schema (Creates SupplierAddress table, keeps old columns)

```bash
cd destockify/api
npx prisma db push
```

This will:
- Create the new `SupplierAddress` table
- Keep the old address columns in `Supplier` table (so we can migrate data)

### Step 2: Run Data Migration

```bash
npm run migrate:addresses
```

This will:
- Copy all address data from `Supplier` table to `SupplierAddress` table
- Create one address record per supplier that has address data
- Skip suppliers that already have addresses (idempotent)

### Step 3: Remove Old Columns from Schema

Edit `prisma/schema.prisma` and remove these lines from the `Supplier` model:

```prisma
// REMOVE THESE LINES:
streetAddress    String?  @map("streetAddress")
city             String?
state            String?
country          String?
```

### Step 4: Push Schema Again (Drops old columns)

```bash
npx prisma db push
```

This will:
- Drop the old address columns from `Supplier` table
- Keep the `SupplierAddress` table and all migrated data

### Step 5: Regenerate Prisma Client

```bash
npx prisma generate
```

## Verification

After migration, verify the data:

```bash
# Check address count
npx prisma studio
# Or query directly:
# SELECT COUNT(*) FROM "SupplierAddress";
```

## Rollback (if needed)

If something goes wrong:

1. The old columns are still in the database until Step 4
2. You can re-run the migration script (it's idempotent)
3. If you've already dropped columns, you'll need to restore from a backup

## Notes

- The migration script is idempotent - safe to run multiple times
- It only migrates suppliers that have address data
- It skips suppliers that already have addresses in the new table
- The old columns will remain in the database until Step 4





