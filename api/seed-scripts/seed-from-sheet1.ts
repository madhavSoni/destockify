import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { parseSheet1Html, ParsedSupplier } from './parse-sheet1-html';
import { uploadImagesToGcs } from './upload-images-to-gcs';
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
 * Generate a unique slug by appending a number if needed
 */
async function generateUniqueSlug(baseSlug: string, existingSlugs: Set<string>): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  existingSlugs.add(slug);
  return slug;
}

/**
 * Map parsed supplier data to Prisma Supplier model
 */
async function mapToSupplier(
  parsed: ParsedSupplier,
  imageUrlMap: Map<string, string>,
  existingSlugs: Set<string>
): Promise<any> {
  const slug = await generateUniqueSlug(generateSlug(parsed.name), existingSlugs);
  
  const shortDescription = parsed.description
    ? parsed.description.substring(0, 150).trim()
    : undefined;
  
  // Get image URL from map
  const heroImage = parsed.imagePath
    ? imageUrlMap.get(parsed.imagePath) || undefined
    : undefined;
  
  // Use heroImage as logoImage if available, otherwise use placeholder
  const logoImage = heroImage || `https://via.placeholder.com/80x80.png?text=${encodeURIComponent(parsed.name.substring(0, 3).toUpperCase())}`;
  
  // Combine address with logistics notes
  const logisticsNotes = parsed.address
    ? `Address: ${parsed.address}${parsed.description ? `\n\n${parsed.description}` : ''}`
    : parsed.description || undefined;
  
  return {
    name: parsed.name,
    slug,
    shortDescription: shortDescription || `Wholesale liquidation supplier: ${parsed.name}`,
    description: parsed.description || `Supplier of liquidation inventory and wholesale merchandise.`,
    website: parsed.website,
    phone: parsed.phone,
    email: parsed.email,
    heroImage,
    logoImage,
    homeRank: 0,
    trustScore: 0,
    isVerified: false,
    isScam: false,
    minimumOrder: undefined,
    leadTime: undefined,
    specialties: [],
    certifications: [],
    badges: [],
    logisticsNotes,
    pricingNotes: undefined,
    averageRating: undefined,
    reviewCount: 0,
    regionId: undefined,
  };
}

/**
 * Create SupplierResource entries for social media links
 */
function createResources(parsed: ParsedSupplier, supplierId: number): any[] {
  const resources: any[] = [];
  let order = 1;
  
  if (parsed.facebookUrl) {
    resources.push({
      supplierId,
      title: 'Facebook Page',
      type: 'link',
      url: parsed.facebookUrl,
      description: 'Visit our Facebook page',
      order: order++,
    });
  }
  
  if (parsed.instagramUrl) {
    resources.push({
      supplierId,
      title: 'Instagram Profile',
      type: 'link',
      url: parsed.instagramUrl,
      description: 'Follow us on Instagram',
      order: order++,
    });
  }
  
  return resources;
}

async function main() {
  console.log('🚀 Starting seed from Sheet1.html...\n');
  
  try {
    // Initialize config (loads secrets if needed)
    await initializeConfig();
    
    const sheet1Path = path.join(__dirname, '..', 'Sheet1.html');
    
    if (!fs.existsSync(sheet1Path)) {
      throw new Error(`Sheet1.html not found at ${sheet1Path}`);
    }
    
    // Parse HTML
    console.log('📄 Parsing Sheet1.html...');
    const parsedSuppliers = parseSheet1Html(sheet1Path);
    console.log(`✅ Parsed ${parsedSuppliers.length} suppliers\n`);
    
    // Collect unique image paths
    const imagePaths = parsedSuppliers
      .map(s => s.imagePath)
      .filter((path): path is string => !!path);
    
    // Upload images to GCS
    console.log('📤 Uploading images to GCS...');
    const imageUrlMap = await uploadImagesToGcs(imagePaths);
    console.log(`✅ Uploaded ${imageUrlMap.size} images\n`);
    
    // Clear existing suppliers and related data
    console.log('🧹 Clearing existing suppliers...');
    await prisma.supplierResource.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.review.deleteMany();
    await prisma.supplierCategory.deleteMany();
    await prisma.supplierLotSize.deleteMany();
    await prisma.supplier.deleteMany();
    console.log('✅ Cleared existing data\n');
    
    // Get existing slugs to avoid duplicates
    const existingSlugs = new Set<string>();
    
    // Create suppliers in batches
    console.log('🏪 Creating suppliers...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const parsed of parsedSuppliers) {
      try {
        // Map to supplier model
        const supplierData = await mapToSupplier(parsed, imageUrlMap, existingSlugs);
        
        // Create supplier
        const supplier = await prisma.supplier.create({
          data: supplierData,
        });
        
        // Create resources (social media links)
        const resources = createResources(parsed, supplier.id);
        if (resources.length > 0) {
          await prisma.supplierResource.createMany({
            data: resources,
          });
        }
        
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✅ Created ${successCount} suppliers...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to create supplier "${parsed.name}":`, error);
        // Continue with next supplier
      }
    }
    
    console.log(`\n✅ Seed complete!`);
    console.log(`   Successfully created: ${successCount} suppliers`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Images uploaded: ${imageUrlMap.size}`);
    
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

