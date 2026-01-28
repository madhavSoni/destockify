import { KeywordBank } from '../types';

/**
 * Comprehensive Keyword Bank for Liquidation Industry
 * These terms are used by the LLM to generate authentic industry content
 */
export const KEYWORD_BANK: KeywordBank = {
  // General liquidation terms
  general: [
    'liquidation merchandise',
    'wholesale inventory',
    'bulk purchasing',
    'overstock deals',
    'clearance inventory',
    'reseller opportunity',
    'secondary market',
    'closeout merchandise',
    'surplus goods',
    'discount inventory',
    'wholesale liquidation',
    'pallet loads',
    'truckload deals',
    'verified suppliers',
    'direct sourcing',
  ],

  // Inventory condition types
  inventoryTypes: [
    'customer returns',
    'overstock',
    'surplus',
    'shelf pulls',
    'closeouts',
    'salvage',
    'open box',
    'as-is',
    'uninspected',
    'tested working',
    'refurbished',
    'like-new',
    'grade-A',
    'grade-B',
    'grade-C',
    'mixed condition',
    'retail ready',
    'new in box',
    'damaged packaging',
    'cosmetic imperfections',
  ],

  // Lot formats and sizes
  lotFormats: [
    'manifested',
    'unmanifested',
    'blind loads',
    'high piece count',
    'HPC',
    'case pack',
    'case lot',
    'master carton',
    'pallet lot',
    'gaylord',
    'truckload',
    'FTL',
    'LTL',
    'half truckload',
    'full truckload',
    'mixed pallet',
    'category-specific pallet',
    'sorted loads',
    'unsorted loads',
    'raw loads',
  ],

  // Logistics and shipping terms
  logistics: [
    'dock-high',
    'liftgate delivery',
    'appointment delivery',
    'freight',
    'BOL',
    'bill of lading',
    'pallet count',
    'floor-loaded',
    'palletized',
    'warehouse pickup',
    'will-call',
    'FOB origin',
    'FOB destination',
    'prepaid freight',
    'collect freight',
    'shrink-wrapped',
    'stretch-wrapped',
    'stacked pallets',
    '4-way pallets',
    'standard pallet',
    '48x40 pallet',
  ],

  // Buyer intent terms
  buyerIntents: [
    'bin store inventory',
    'discount store inventory',
    'Whatnot sellers',
    'eBay resellers',
    'Amazon FBA sellers',
    'export buyers',
    'container buyers',
    'storefront resellers',
    'online resellers',
    'flea market vendors',
    'swap meet vendors',
    'thrift store buyers',
    'pawn shop inventory',
    'auction house buyers',
    'wholesale dealers',
  ],

  // Quality and grading terms
  qualityTerms: [
    'condition grading',
    'functionality testing',
    'power-on verified',
    'cosmetic inspection',
    'accessory verification',
    'packaging condition',
    'manifest accuracy',
    'item-level detail',
    'SKU-level manifest',
    'recovery rate',
    'yield percentage',
    'sell-through rate',
    'defect rate',
    'return rate',
    'authentication',
  ],

  // Business and profit terms
  profitTerms: [
    'profit margins',
    'ROI potential',
    'below wholesale pricing',
    'cents on the dollar',
    '50-90% off retail',
    'competitive sourcing',
    'resale value',
    'recovery potential',
    'margin optimization',
    'cost per unit',
    'landed cost',
    'all-in cost',
    'price per piece',
    'average selling price',
    'ASP',
  ],

  // Retailer-specific terminology
  retailerSpecific: {
    amazon: [
      'FBA liquidation',
      'FC returns',
      'fulfillment center',
      'LPN',
      'license plate number',
      'Amazon Smalls',
      'Amazon Mediums',
      'Amazon Monsters',
      'non-sortable',
      'sortable',
      'Prime returns',
      'Warehouse Deals',
      'HD loads',
      'high-density',
      'customer return pallets',
      'FBM inventory',
    ],
    walmart: [
      'GM truckloads',
      'general merchandise',
      'shelf pulls',
      'supercenter overstock',
      'dot-com returns',
      'store reset',
      'planogram changes',
      'regional DC',
      'distribution center',
      'store-level returns',
      'neighborhood market',
    ],
    target: [
      'Target returns',
      'Target overstock',
      'Target salvage',
      'unsorted loads',
      'raw loads',
      'case pack clothing',
      'Target private label',
      'Target+ marketplace',
      'seasonal bulge',
      'owned brand',
    ],
    homeDepot: [
      'HD tool liquidation',
      'contractor returns',
      'Pro Desk',
      'tool rental returns',
      'special order cancellations',
      'lighting fixtures',
      'plumbing supplies',
      'building materials',
      'seasonal outdoor',
    ],
    lowes: [
      'Kobalt tools',
      'Craftsman liquidation',
      'garden center',
      'outdoor power equipment',
      'installation returns',
      'appliance returns',
      'seasonal clearance',
    ],
    bestBuy: [
      'electronics returns',
      'Geek Squad returns',
      'open box items',
      'display models',
      'Total Tech returns',
      'discontinued SKUs',
      'gaming inventory',
      'appliance liquidation',
    ],
    costco: [
      'membership returns',
      'Kirkland Signature',
      'bulk item returns',
      'executive member',
      'Business Center',
      'warehouse club',
      'organic closeouts',
    ],
  },

  // Category-specific terminology
  categorySpecific: {
    electronics: [
      'tested working',
      'factory sealed',
      'open-box tested',
      'data wiped',
      'factory reset',
      'accessories included',
      'charger present',
      'original packaging',
      'smart home devices',
      'wearables',
      'gaming consoles',
      'peripherals',
    ],
    tools: [
      'battery included',
      'charger present',
      'cordless complete',
      'bare tool',
      'combo kit',
      'motor tested',
      'trigger verified',
      '20V MAX',
      '18V system',
      'professional-grade',
      'contractor-grade',
      'DIY tools',
    ],
    apparel: [
      'NWT',
      'new with tags',
      'NWOT',
      'new without tags',
      'size runs',
      'size curve',
      'seasonal styles',
      'brand mix',
      'case pack clothing',
      'sorted by category',
      'fashion cycles',
      'off-season',
    ],
    furniture: [
      'scratch and dent',
      'assembly required',
      'RTA furniture',
      'hardware included',
      'box condition',
      'oversized shipping',
      'white glove delivery',
      'upholstered',
      'case goods',
      'outdoor patio',
    ],
    grocery: [
      'best-by date',
      'expiration date',
      'short-dated',
      'long-dated',
      'shelf-stable',
      'ambient temperature',
      'date-coded',
      'lot codes',
      'FDA compliant',
      'salvage food',
      'closeout grocery',
    ],
    beauty: [
      'sealed products',
      'lot codes',
      'manufacturing date',
      'shelf life',
      'authentic',
      'brand verification',
      'prestige beauty',
      'mass market',
      'color cosmetics',
      'skincare',
      'haircare',
      'fragrance',
    ],
  },
};

/**
 * Get all keywords as a flat array for LLM context
 */
export function getAllKeywords(): string[] {
  const all: string[] = [
    ...KEYWORD_BANK.general,
    ...KEYWORD_BANK.inventoryTypes,
    ...KEYWORD_BANK.lotFormats,
    ...KEYWORD_BANK.logistics,
    ...KEYWORD_BANK.buyerIntents,
    ...KEYWORD_BANK.qualityTerms,
    ...KEYWORD_BANK.profitTerms,
  ];

  // Add retailer-specific
  Object.values(KEYWORD_BANK.retailerSpecific).forEach(terms => {
    all.push(...terms);
  });

  // Add category-specific
  Object.values(KEYWORD_BANK.categorySpecific).forEach(terms => {
    all.push(...terms);
  });

  return Array.from(new Set(all)); // Deduplicate
}

/**
 * Get relevant keywords for a specific page
 */
export function getKeywordsForPage(slug: string, pageType: string): string[] {
  const relevant: string[] = [
    ...KEYWORD_BANK.general,
    ...KEYWORD_BANK.inventoryTypes,
    ...KEYWORD_BANK.lotFormats,
    ...KEYWORD_BANK.buyerIntents,
    ...KEYWORD_BANK.qualityTerms,
    ...KEYWORD_BANK.profitTerms,
  ];

  // Add retailer-specific if applicable
  const retailerKey = slug.replace('-liquidation', '').replace(/-/g, '');
  if (KEYWORD_BANK.retailerSpecific[retailerKey]) {
    relevant.push(...KEYWORD_BANK.retailerSpecific[retailerKey]);
  }

  // Add category-specific if applicable
  const categoryKey = slug.replace('-liquidation', '').replace('-pallets', '').replace('-wholesale', '');
  if (KEYWORD_BANK.categorySpecific[categoryKey]) {
    relevant.push(...KEYWORD_BANK.categorySpecific[categoryKey]);
  }

  // Add logistics for all
  relevant.push(...KEYWORD_BANK.logistics);

  return Array.from(new Set(relevant));
}
