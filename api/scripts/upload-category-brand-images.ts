import * as fs from 'fs';
import * as path from 'path';
import prisma from '../src/lib/prismaClient';
import { uploadBuffer, generatePath } from '../src/lib/gcsService';

/**
 * Brand logo mapping from image-maps.ts
 * Structure: slug -> image path
 * We'll reverse this to: filename -> slugs[]
 */
const brandLogoMap: Record<string, string> = {
  'amazon': '/images/brands/amazon.png',
  'walmart': '/images/brands/walmart.png',
  'target': '/images/brands/target.png',
  'costco': '/images/brands/costco.png',
  'sams-club': '/images/brands/samsclub.png',
  'home-depot': '/images/brands/homedepot.png',
  'lowes': '/images/brands/lowes.png',
  'ace-hardware': '/images/brands/acehardware.png',
  'macys': '/images/brands/macys.png',
  'kohls': '/images/brands/kohls.png',
  'jcpenney': '/images/brands/jcpenney.png',
  'nordstrom': '/images/brands/nordstrom.png',
  'best-buy': '/images/brands/bestbuy.png',
  'tjmaxx': '/images/brands/tjmaxx.png',
  'cvs': '/images/brands/cvs.png',
  'walgreens': '/images/brands/walgreens.png',
  'wayfair': '/images/brands/wayfair.png',
  'select-liquidation': '/images/brands/selectliquidation.png',
  'costway': '/images/brands/costway.png',
  'dollar-general': '/images/brands/dollargeneral.png',
};

/**
 * Category icon mapping from image-maps.ts
 * Structure: slug -> image path
 * We'll reverse this to: filename -> slugs[]
 */
const categoryIconMap: Record<string, string> = {
  'appliances': '/images/categories/appliances.png',
  'baby': '/images/categories/baby.png',
  'baby-products': '/images/categories/baby.png',
  'bin-store': '/images/categories/bin-stores.png',
  'clothing': '/images/categories/clothing.png',
  'apparel': '/images/categories/clothing.png',
  'electronics': '/images/categories/consumer-electronics.png',
  'furniture': '/images/categories/furniture.png',
  'general-merchandise': '/images/categories/general-merchandise.png',
  'grocery': '/images/categories/grocery.png',
  'tools': '/images/categories/tools.png',
  'beauty': '/images/categories/beauty.png',
  'health': '/images/categories/beauty.png',
  'shoes': '/images/categories/clothing.png',
  'sporting-goods': '/images/categories/general-merchandise.png',
  'toys': '/images/categories/general-merchandise.png',
  'automotive': '/images/categories/tools.png',
  'housewares': '/images/categories/furniture.png',
};

/**
 * Reverse lookup: filename -> array of slugs that map to it
 */
function buildReverseMap(forwardMap: Record<string, string>): Map<string, string[]> {
  const reverseMap = new Map<string, string[]>();
  
  for (const [slug, imagePath] of Object.entries(forwardMap)) {
    // Extract filename from path (e.g., '/images/brands/amazon.png' -> 'amazon.png')
    const filename = path.basename(imagePath);
    // Remove extension for matching (e.g., 'amazon.png' -> 'amazon')
    const filenameWithoutExt = path.basename(filename, path.extname(filename));
    
    if (!reverseMap.has(filenameWithoutExt)) {
      reverseMap.set(filenameWithoutExt, []);
    }
    reverseMap.get(filenameWithoutExt)!.push(slug);
  }
  
  return reverseMap;
}

/**
 * Get content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return contentTypes[ext] || 'image/png';
}

/**
 * Upload a single image to GCS and return the public URL
 */
async function uploadImageToGcs(
  imagePath: string,
  category: 'brands' | 'categories'
): Promise<string> {
  const filename = path.basename(imagePath);
  const imageBuffer = fs.readFileSync(imagePath);
  const contentType = getContentType(filename);
  
  // Generate GCS path: admin/uploads/category-images/ or admin/uploads/brand-images/
  const subfolder = category === 'brands' ? 'brand-images' : 'category-images';
  const gcsPath = generatePath(['admin', 'uploads', subfolder], filename);
  
  // Upload to GCS
  const publicUrl = await uploadBuffer(imageBuffer, gcsPath, {
    metadata: {
      contentType,
    },
  });
  
  return publicUrl;
}

/**
 * Update CategoryPage records with heroImage
 */
async function updateCategoryPages(
  slugs: string[],
  gcsUrl: string,
  imageType: 'brand' | 'category',
  forceUpdate: boolean = false
): Promise<number> {
  let updatedCount = 0;
  
  for (const slug of slugs) {
    try {
      // Find all CategoryPages with this slug
      // Try exact match first, then try with "-liquidation" suffix
      let pages = await prisma.categoryPage.findMany({
        where: { slug },
      });
      
      // If not found, try with "-liquidation" suffix (common pattern in database)
      if (pages.length === 0) {
        const slugWithSuffix = `${slug}-liquidation`;
        pages = await prisma.categoryPage.findMany({
          where: { slug: slugWithSuffix },
        });
        if (pages.length > 0) {
          console.log(`  ℹ️  Found pages with slug: ${slugWithSuffix} (instead of ${slug})`);
        }
      }
      
      // If still not found, try partial match (slug contains the base name)
      if (pages.length === 0) {
        const allPages = await prisma.categoryPage.findMany({
          where: {
            slug: {
              contains: slug,
            },
          },
        });
        if (allPages.length > 0) {
          pages = allPages;
          console.log(`  ℹ️  Found ${pages.length} page(s) with slug containing "${slug}"`);
        }
      }
      
      if (pages.length === 0) {
        console.log(`  ⚠️  No CategoryPage found for slug: ${slug}`);
        // Try to find similar slugs for debugging
        try {
          const allPages = await prisma.categoryPage.findMany({
            select: { slug: true, pageTitle: true },
            take: 50,
          });
          const similarSlugs = allPages
            .filter(p => p.slug.includes(slug.split('-')[0]) || slug.includes(p.slug.split('-')[0]))
            .slice(0, 5)
            .map(p => `"${p.slug}" (${p.pageTitle})`);
          if (similarSlugs.length > 0) {
            console.log(`     Similar slugs found: ${similarSlugs.join(', ')}`);
          }
        } catch (e) {
          // Ignore debug errors
        }
        continue;
      }
      
      for (const page of pages) {
        // Update if heroImage is null/empty, or if forceUpdate is true
        if (!page.heroImage || forceUpdate) {
          const heroImageAlt = page.heroImageAlt || `${page.pageTitle} ${imageType === 'brand' ? 'logo' : 'icon'}`;
          
          try {
            await prisma.categoryPage.update({
              where: { id: page.id },
              data: {
                heroImage: gcsUrl,
                heroImageAlt: heroImageAlt,
              },
            });
            
            updatedCount++;
            const action = page.heroImage ? 'Replaced' : 'Set';
            console.log(`  ✅ ${action} heroImage for "${page.pageTitle}" (slug: ${slug}, id: ${page.id})`);
            console.log(`     URL: ${gcsUrl}`);
          } catch (updateError) {
            console.error(`  ❌ Failed to update page "${page.pageTitle}" (id: ${page.id}):`, updateError);
          }
        } else {
          console.log(`  ⏭️  Skipped page "${page.pageTitle}" (slug: ${slug}) - already has heroImage: ${page.heroImage}`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error updating pages for slug "${slug}":`, error);
    }
  }
  
  return updatedCount;
}

/**
 * Main function to upload images and update database
 */
async function main() {
  // Check for --force flag to update even if heroImage already exists
  const forceUpdate = process.argv.includes('--force');
  
  console.log('🚀 Starting category and brand image upload...\n');
  if (forceUpdate) {
    console.log('⚠️  Force update mode: Will replace existing heroImage values\n');
  }
  
  // Test database connection
  try {
    const testCount = await prisma.categoryPage.count();
    console.log(`📊 Database connection OK. Found ${testCount} CategoryPage records.\n`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
  
  // Build reverse maps
  const brandReverseMap = buildReverseMap(brandLogoMap);
  const categoryReverseMap = buildReverseMap(categoryIconMap);
  
  // Paths to image directories
  const projectRoot = path.join(__dirname, '..', '..');
  const brandsDir = path.join(projectRoot, 'web-frontend', 'public', 'images', 'brands');
  const categoriesDir = path.join(projectRoot, 'web-frontend', 'public', 'images', 'categories');
  
  let totalUploaded = 0;
  let totalUpdated = 0;
  const unmatchedFiles: string[] = [];
  
  // Process brand images
  console.log('📦 Processing brand images...\n');
  if (fs.existsSync(brandsDir)) {
    const brandFiles = fs.readdirSync(brandsDir).filter(f => f.endsWith('.png'));
    
    for (const filename of brandFiles) {
      const filePath = path.join(brandsDir, filename);
      const filenameWithoutExt = path.basename(filename, path.extname(filename));
      
      // Find matching slugs
      const matchingSlugs = brandReverseMap.get(filenameWithoutExt);
      
      if (matchingSlugs && matchingSlugs.length > 0) {
        console.log(`\n📸 Processing: ${filename}`);
        console.log(`   Matches slugs: ${matchingSlugs.join(', ')}`);
        
        try {
          // Upload to GCS
          const gcsUrl = await uploadImageToGcs(filePath, 'brands');
          console.log(`   ✅ Uploaded to GCS: ${gcsUrl}`);
          totalUploaded++;
          
          // Update database
          const updated = await updateCategoryPages(matchingSlugs, gcsUrl, 'brand', forceUpdate);
          totalUpdated += updated;
        } catch (error) {
          console.error(`   ❌ Error processing ${filename}:`, error);
        }
      } else {
        console.log(`\n⚠️  No matching slugs found for: ${filename}`);
        unmatchedFiles.push(`brands/${filename}`);
      }
    }
  } else {
    console.log(`⚠️  Brands directory not found: ${brandsDir}`);
  }
  
  // Process category images
  console.log('\n\n📁 Processing category images...\n');
  if (fs.existsSync(categoriesDir)) {
    const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.png'));
    
    for (const filename of categoryFiles) {
      const filePath = path.join(categoriesDir, filename);
      const filenameWithoutExt = path.basename(filename, path.extname(filename));
      
      // Find matching slugs
      const matchingSlugs = categoryReverseMap.get(filenameWithoutExt);
      
      if (matchingSlugs && matchingSlugs.length > 0) {
        console.log(`\n📸 Processing: ${filename}`);
        console.log(`   Matches slugs: ${matchingSlugs.join(', ')}`);
        
        try {
          // Upload to GCS
          const gcsUrl = await uploadImageToGcs(filePath, 'categories');
          console.log(`   ✅ Uploaded to GCS: ${gcsUrl}`);
          totalUploaded++;
          
          // Update database
          const updated = await updateCategoryPages(matchingSlugs, gcsUrl, 'category', forceUpdate);
          totalUpdated += updated;
        } catch (error) {
          console.error(`   ❌ Error processing ${filename}:`, error);
        }
      } else {
        console.log(`\n⚠️  No matching slugs found for: ${filename}`);
        unmatchedFiles.push(`categories/${filename}`);
      }
    }
  } else {
    console.log(`⚠️  Categories directory not found: ${categoriesDir}`);
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Images uploaded to GCS: ${totalUploaded}`);
  console.log(`   ✅ CategoryPage records updated: ${totalUpdated}`);
  if (unmatchedFiles.length > 0) {
    console.log(`   ⚠️  Unmatched files (${unmatchedFiles.length}):`);
    unmatchedFiles.forEach(file => console.log(`      - ${file}`));
  }
  console.log('='.repeat(60) + '\n');
  
  // Disconnect Prisma
  await prisma.$disconnect();
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


