const BASE_URL = 'https://findliquidation.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.findliquidation.com/api';

const RESERVED_ROUTES = new Set([
  'suppliers', 'categories', 'locations', 'admin', 'about', 'contact', 'privacy',
  'terms', 'list-your-business', 'submit-listing', 'my-listings', 'profile',
  'guides', 'lot-sizes', 'liquidation-companies', 'brands', 'login', 'signup',
  'forgot-password', 'reset-password', 'verify-email', 'not-found',
]);

const CURATED_PROSE = `# Find Liquidation

> Find Liquidation is the largest directory for wholesale liquidation suppliers in the United States. Buyers use it to discover verified liquidation companies selling truckloads and pallets of returns, overstock, and wholesale merchandise — with transparent reviews, ratings, and buyer insights.

## What Find Liquidation Does

Find Liquidation connects liquidation buyers with verified wholesale suppliers. Buyers can browse the directory to find companies selling truckloads, pallets, and wholesale lots of merchandise from major retailers like Amazon, Walmart, Target, Home Depot, Best Buy, and more. Every supplier goes through a verification process including proof of sourcing rights, warehouse inspections, and insurance checks. Buyers can read real reviews from other resellers before making a purchase.

The platform serves resellers running bin stores, discount stores, flea markets, auction houses, and e-commerce businesses who source liquidation inventory.

## Key Pages

- [Supplier Directory](${BASE_URL}/suppliers): Browse hundreds of verified liquidation and wholesale suppliers across the US
- [Categories](${BASE_URL}/categories): Browse suppliers by product type — electronics, apparel, tools, furniture, grocery, beauty, toys, sporting goods, and more
- [Brands](${BASE_URL}/brands): Find liquidation inventory from specific retailers — Amazon, Walmart, Target, Costco, Home Depot, Lowe's, Macy's, Best Buy, and others
- [Locations](${BASE_URL}/locations): Find suppliers by US state or region
- [Buying Guides](${BASE_URL}/guides): Educational playbooks on supplier vetting, truckload modeling, freight logistics, and risk mitigation
- [Lot Sizes](${BASE_URL}/lot-sizes): Compare lot sizes from micro-lots and case packs to full pallets and truckloads
- [List Your Business](${BASE_URL}/list-your-business): For suppliers who want to be listed in the directory
- [About](${BASE_URL}/about): Learn about Find Liquidation's mission and team
- [Contact](${BASE_URL}/contact): Reach the sourcing team at findliquidationteam@gmail.com

## Product Categories Covered

- General Merchandise Liquidation
- Electronics Pallets and Truckloads
- Tools and Power Tools Liquidation
- Furniture Liquidation (Scratch and Dent)
- Grocery and Short-Dated Inventory
- Apparel and Clothing Wholesale
- Shoes and Footwear Wholesale
- Beauty and Cosmetics Liquidation
- Toys Liquidation
- Sporting Goods Liquidation
- Baby Products Liquidation
- Automotive Parts and Accessories
- Housewares and Small Appliances
- Health and Wellness Products

## Major Retailers

Liquidation inventory sourced from: Amazon (FBA returns, Smalls, Mediums, Monsters), Walmart (GM truckloads, shelf pulls), Target (raw/unsorted loads), Costco (bulk returns), Home Depot (power tools, lighting, plumbing), Lowe's (Kobalt, Craftsman, garden), Best Buy (consumer electronics, open box), Macy's (designer apparel, beauty), Kohl's (family apparel, home goods), Nordstrom (designer brands), TJ Maxx (off-price apparel), CVS, Walgreens, JCPenney, Sam's Club, Ace Hardware.

## Geographic Coverage

All 50 US states plus Washington DC. Suppliers also serve buyers in Canada and Mexico.

## Common Questions

**How do buyers find suppliers?**
Search the directory by location, category, or supplier name. Filter by state or region. Read verified reviews and compare suppliers.

**What types of inventory are available?**
Customer returns, overstock, closeout items, shelf pulls, and brand-new merchandise. Sold as pallets or full truckloads.

**How are suppliers verified?**
Verification includes proof of sourcing rights, warehouse inspections, insurance verification, and buyer reference checks. Verified suppliers display a badge on their profile.

**What lot sizes are available?**
Micro-lots (case packs), single pallets, partial truckloads, and full 53-foot truckloads.

## Contact

- Buyers: findliquidationteam@gmail.com
- Suppliers: findliquidationteam@gmail.com
- Phone: (929) 412-0090 (text for urgent freight questions)
- Hours: Monday-Friday, 9am-6pm EST
`;

type CategoryPage = { slug: string; pageTitle?: string; metaTitle?: string; topicCategory?: string };
type Supplier = { slug: string; name: string };
type Region = { slug: string; name: string };

async function fetchIndex(): Promise<{
  retailerPages: CategoryPage[];
  categoryGuidePages: CategoryPage[];
  suppliers: Supplier[];
  regions: Region[];
}> {
  const [suppliersRes, regionsRes, categoryPagesRes] = await Promise.all([
    fetch(`${API_URL}/suppliers?limit=1000`, { next: { revalidate: 3600 } }).catch(() => null),
    fetch(`${API_URL}/catalog/regions`, { next: { revalidate: 3600 } }).catch(() => null),
    fetch(`${API_URL}/catalog/category-pages`, { next: { revalidate: 3600 } }).catch(() => null),
  ]);

  const suppliersJson = suppliersRes && suppliersRes.ok ? await suppliersRes.json().catch(() => null) : null;
  const regionsJson = regionsRes && regionsRes.ok ? await regionsRes.json().catch(() => null) : null;
  const categoryPagesJson = categoryPagesRes && categoryPagesRes.ok ? await categoryPagesRes.json().catch(() => null) : null;

  const suppliers: Supplier[] = Array.isArray(suppliersJson?.items)
    ? suppliersJson.items
        .filter((s: any) => typeof s?.slug === 'string' && typeof s?.name === 'string')
        .map((s: any) => ({ slug: s.slug, name: s.name }))
        .sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name))
    : [];

  const regions: Region[] = Array.isArray(regionsJson)
    ? regionsJson
        .filter((r: any) => typeof r?.slug === 'string' && typeof r?.name === 'string')
        .map((r: any) => ({ slug: r.slug, name: r.name }))
    : [];

  const allCategoryPages: CategoryPage[] = Array.isArray(categoryPagesJson)
    ? categoryPagesJson.filter(
        (p: any) => typeof p?.slug === 'string' && !RESERVED_ROUTES.has(p.slug) && (p.pageTitle || p.metaTitle)
      )
    : [];

  const retailerPages = allCategoryPages
    .filter((p) => p.topicCategory === 'retailer')
    .sort((a, b) => (a.pageTitle || a.metaTitle || a.slug).localeCompare(b.pageTitle || b.metaTitle || b.slug));
  const categoryGuidePages = allCategoryPages
    .filter((p) => p.topicCategory !== 'retailer')
    .sort((a, b) => (a.pageTitle || a.metaTitle || a.slug).localeCompare(b.pageTitle || b.metaTitle || b.slug));

  return { retailerPages, categoryGuidePages, suppliers, regions };
}

export const revalidate = 3600;

export async function GET() {
  const { retailerPages, categoryGuidePages, suppliers, regions } = await fetchIndex();

  const indexSection: string[] = [];
  if (retailerPages.length > 0 || categoryGuidePages.length > 0 || suppliers.length > 0 || regions.length > 0) {
    indexSection.push('## Full URL Index');
    indexSection.push('');
    indexSection.push(
      'A complete, always-current list of the pages on findliquidation.com. For richer per-page descriptions, see /llms-full.txt.'
    );
    indexSection.push('');

    if (retailerPages.length > 0) {
      indexSection.push('### Retailer Liquidation Guides');
      indexSection.push('');
      for (const p of retailerPages) {
        indexSection.push(`- [${p.pageTitle || p.metaTitle}](${BASE_URL}/${p.slug})`);
      }
      indexSection.push('');
    }

    if (categoryGuidePages.length > 0) {
      indexSection.push('### Category & Lot Size Guides');
      indexSection.push('');
      for (const p of categoryGuidePages) {
        indexSection.push(`- [${p.pageTitle || p.metaTitle}](${BASE_URL}/${p.slug})`);
      }
      indexSection.push('');
    }

    if (regions.length > 0) {
      indexSection.push('### Regional Directories');
      indexSection.push('');
      for (const r of regions) {
        indexSection.push(`- [Liquidation suppliers in the ${r.name}](${BASE_URL}/locations/${r.slug})`);
      }
      indexSection.push('');
    }

    if (suppliers.length > 0) {
      indexSection.push(`### Verified Suppliers (${suppliers.length})`);
      indexSection.push('');
      for (const s of suppliers) {
        indexSection.push(`- [${s.name}](${BASE_URL}/suppliers/${s.slug})`);
      }
      indexSection.push('');
    }
  }

  const body = `${CURATED_PROSE}\n${indexSection.join('\n')}`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
