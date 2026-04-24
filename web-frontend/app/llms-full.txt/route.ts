const BASE_URL = 'https://findliquidation.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.findliquidation.com/api';

const RESERVED_ROUTES = new Set([
  'suppliers', 'categories', 'locations', 'admin', 'about', 'contact', 'privacy',
  'terms', 'list-your-business', 'submit-listing', 'my-listings', 'profile',
  'guides', 'lot-sizes', 'liquidation-companies', 'brands', 'login', 'signup',
  'forgot-password', 'reset-password', 'verify-email', 'not-found',
]);

type CategoryPage = {
  slug: string;
  pageTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  headline?: string;
  heroH1?: string;
  heroText?: string;
  topicCategory?: string;
};
type Supplier = {
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  region?: { slug: string; name: string } | null;
  categories?: Array<{ slug: string; name: string }>;
  isVerified?: boolean;
  isContractHolder?: boolean;
  isBroker?: boolean;
};
type Region = { slug: string; name: string; headline?: string | null };

const stripHtml = (s: unknown): string => {
  if (typeof s !== 'string') return '';
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\[[^\]]*\]/g, '')
    .trim();
};

const clip = (s: string, max = 220): string => {
  const cleaned = s.trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
};

async function fetchEverything(): Promise<{
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
        .map((s: any): Supplier => ({
          slug: s.slug,
          name: s.name,
          shortDescription: s.shortDescription ?? null,
          description: s.description ?? null,
          region: s.region ?? null,
          categories: Array.isArray(s.categories) ? s.categories : [],
          isVerified: Boolean(s.isVerified),
          isContractHolder: Boolean(s.isContractHolder),
          isBroker: Boolean(s.isBroker),
        }))
        .sort((a: Supplier, b: Supplier) => a.name.localeCompare(b.name))
    : [];

  const regions: Region[] = Array.isArray(regionsJson)
    ? regionsJson
        .filter((r: any) => typeof r?.slug === 'string' && typeof r?.name === 'string')
        .map((r: any): Region => ({
          slug: r.slug,
          name: r.name,
          headline: r.headline ?? null,
        }))
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

function describePage(p: CategoryPage): string {
  const raw = p.metaDescription || p.headline || p.heroH1 || p.heroText;
  const cleaned = stripHtml(raw);
  return cleaned ? clip(cleaned) : `Liquidation guide page on Find Liquidation.`;
}

function describeSupplier(s: Supplier): string {
  const baseDesc = stripHtml(s.shortDescription || s.description || '');
  if (baseDesc) return clip(baseDesc);

  const parts: string[] = [];
  if (s.isVerified) parts.push('Verified');
  if (s.isContractHolder) parts.push('contract holder');
  if (s.isBroker) parts.push('broker');
  const categories = (s.categories || []).map((c) => c.name).filter(Boolean);
  if (categories.length > 0) {
    parts.push(`covers ${categories.slice(0, 4).join(', ')}`);
  }
  if (s.region?.name) {
    parts.push(`serves the ${s.region.name}`);
  }
  const sentence = parts.length > 0 ? parts.join(' · ') : 'Liquidation supplier listed on Find Liquidation';
  return clip(`${s.name} — ${sentence}.`);
}

function describeRegion(r: Region): string {
  const cleaned = stripHtml(r.headline || '');
  if (cleaned) return clip(cleaned);
  return `Verified liquidation suppliers serving the ${r.name} region of the United States.`;
}

export const revalidate = 3600;

export async function GET() {
  const { retailerPages, categoryGuidePages, suppliers, regions } = await fetchEverything();

  const lines: string[] = [];

  lines.push('# Find Liquidation — Full Page Index');
  lines.push('');
  lines.push(
    '> Expanded, per-URL index of every page on findliquidation.com. Each entry includes a direct URL and a one-to-two-sentence summary so AI assistants can answer specific questions about suppliers, retailers, product categories, and regions without needing to crawl the site page-by-page.'
  );
  lines.push('');
  lines.push(`Last refreshed from the live API. Total entries: ${retailerPages.length + categoryGuidePages.length + suppliers.length + regions.length + 10}.`);
  lines.push('');

  lines.push('## Hub Pages');
  lines.push('');
  lines.push(`- [Find Liquidation (home)](${BASE_URL}/): Largest US directory for wholesale liquidation suppliers. Browse verified sellers of truckloads, pallets, and merchandise from major retailers.`);
  lines.push(`- [Supplier Directory](${BASE_URL}/suppliers): Searchable and filterable directory of every verified liquidation supplier on the platform. Filter by state, region, category, or broker/contract-holder status.`);
  lines.push(`- [Categories](${BASE_URL}/categories): Index of every product category available on liquidation — electronics, apparel, tools, furniture, grocery, beauty, toys, sporting goods, and more.`);
  lines.push(`- [Brands](${BASE_URL}/brands): Index of retailer-source liquidation guides — Amazon, Walmart, Target, Costco, Home Depot, Lowe's, Best Buy, Macy's, and others.`);
  lines.push(`- [Locations](${BASE_URL}/locations): Find suppliers by US state or region. Includes interactive map, state cards, and regional directories.`);
  lines.push(`- [Lot Sizes](${BASE_URL}/lot-sizes): Compare lot formats from micro-lots and case packs to full 53-foot truckloads, with minimum-order and freight cost guidance.`);
  lines.push(`- [Buying Guides](${BASE_URL}/guides): Educational playbooks for liquidation buyers — supplier vetting, truckload modeling, freight logistics, condition grading, and risk mitigation.`);
  lines.push(`- [List Your Business](${BASE_URL}/list-your-business): Intake form for liquidation suppliers who want to be listed in the directory.`);
  lines.push(`- [About](${BASE_URL}/about): Mission, team, and verification methodology.`);
  lines.push(`- [Contact](${BASE_URL}/contact): Reach the sourcing team at findliquidationteam@gmail.com or (929) 412-0090.`);
  lines.push('');

  if (retailerPages.length > 0) {
    lines.push(`## Retailer Liquidation Guides (${retailerPages.length})`);
    lines.push('');
    for (const p of retailerPages) {
      lines.push(`### [${p.pageTitle || p.metaTitle}](${BASE_URL}/${p.slug})`);
      lines.push('');
      lines.push(describePage(p));
      lines.push('');
    }
  }

  if (categoryGuidePages.length > 0) {
    lines.push(`## Category & Lot Size Guides (${categoryGuidePages.length})`);
    lines.push('');
    for (const p of categoryGuidePages) {
      lines.push(`### [${p.pageTitle || p.metaTitle}](${BASE_URL}/${p.slug})`);
      lines.push('');
      lines.push(describePage(p));
      lines.push('');
    }
  }

  if (regions.length > 0) {
    lines.push(`## Regional Directories (${regions.length})`);
    lines.push('');
    for (const r of regions) {
      lines.push(`### [${r.name} liquidation suppliers](${BASE_URL}/locations/${r.slug})`);
      lines.push('');
      lines.push(describeRegion(r));
      lines.push('');
    }
  }

  if (suppliers.length > 0) {
    lines.push(`## Verified Suppliers (${suppliers.length})`);
    lines.push('');
    for (const s of suppliers) {
      lines.push(`### [${s.name}](${BASE_URL}/suppliers/${s.slug})`);
      lines.push('');
      lines.push(describeSupplier(s));
      lines.push('');
    }
  }

  const body = lines.join('\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
