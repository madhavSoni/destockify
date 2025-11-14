import * as fs from 'fs';
import * as path from 'path';

// Load the wholesaler data
const wholesalersJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../WholesalerList.json'), 'utf-8')
);

// Function to create a slug from a name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Function to extract phone number
function extractPhone(contactNum: string | undefined): string | undefined {
  if (!contactNum) return undefined;
  // Clean up common phone number issues
  const cleaned = contactNum.replace(/[^0-9()-\s]/g, '').trim();
  return cleaned || undefined;
}

// Generate supplier seed data
const suppliers = wholesalersJson
  .map((item: any, index: number) => {
    const name = item.name?.trim();
    if (!name) return null; // Skip entries without a name

    const slug = createSlug(name);
    const website = item.website?.trim() || null;
    const email = item.email?.trim() || null;
    const phone = extractPhone(item['contact #']) || null;
    const description = item.description?.trim() || null;
    const address = item.address?.trim() || null;

    // Combine description and address for the full description
    let fullDescription = description || '';
    if (address && !fullDescription.includes(address)) {
      fullDescription += fullDescription ? `\n\nAddress: ${address}` : `Address: ${address}`;
    }

    // Extract short description (first sentence or 150 chars)
    let shortDescription = null;
    if (description) {
      const firstSentence = description.split(/[.!?]/)[0];
      shortDescription = firstSentence.length > 150 
        ? firstSentence.substring(0, 147) + '...'
        : firstSentence + '.';
    }

    return {
      name,
      slug,
      shortDescription,
      description: fullDescription || null,
      website,
      phone,
      email,
      // Set default values for fields not in CSV
      heroImage: null,
      logoImage: null,
      averageRating: 0,
      reviewCount: 0,
      trustScore: 50, // Default trust score
      minimumOrder: null,
      leadTime: null,
      specialties: [],
      certifications: [],
      badges: [],
      logisticsNotes: null,
      pricingNotes: null,
      homeRank: index + 1, // Use index for initial ranking
      regionId: null,
    };
  })
  .filter((item: any) => item !== null); // Remove null entries

// Generate the seed data file content
const seedDataContent = `// Auto-generated seed data from wholesaler CSV
// Generated on: ${new Date().toISOString()}

export const wholesalerSuppliers = ${JSON.stringify(suppliers, null, 2)};
`;

// Write the seed data file
const outputPath = path.join(__dirname, '../prisma/wholesaler-seed-data.ts');
fs.writeFileSync(outputPath, seedDataContent, 'utf-8');

console.log(`✅ Generated seed data for ${suppliers.length} suppliers`);
console.log(`   Output: ${outputPath}`);
console.log('\nNext steps:');
console.log('1. Review the generated file: api/prisma/wholesaler-seed-data.ts');
console.log('2. Update api/prisma/seed.ts to import and use this data');
console.log('3. Run: npm run prisma:seed (when ready)');
