import { PageDefinition } from '../types';

/**
 * Inventory Type Page Configurations
 * 10 buyer-focused inventory type pages
 */
export const INVENTORY_TYPES: PageDefinition[] = [
  {
    slug: 'bin-store-inventory',
    displayName: 'Bin Store',
    pageType: 'inventory',
    keywords: ['bin store inventory', 'bin store pallets', 'high piece count inventory', 'discount bin merchandise'],
    angles: [
      { id: 'hpc', name: 'High Piece Count', weight: 0.95, phrases: ['high piece count', 'HPC loads', 'volume inventory', 'unit-heavy pallets'] },
      { id: 'turnover', name: 'Inventory Turnover', weight: 0.9, phrases: ['daily restocks', 'fast turnover', 'price drops', 'fresh inventory'] },
      { id: 'treasure-hunt', name: 'Treasure Hunt Model', weight: 0.85, phrases: ['treasure hunt shopping', 'discovery retail', 'surprise finds', 'bargain hunting'] },
    ],
    relatedTerms: ['HPC', 'gaylord bins', 'daily deals', 'rotating stock', 'discount retail', 'price tiers'],
    specificTerms: ['$1 bins', 'price drop model', 'day-of-week pricing', 'floor inventory', 'dump bins'],
    imageStyle: 'colorful retail bins filled with assorted merchandise in a discount store setting',
  },
  {
    slug: 'whatnot-inventory',
    displayName: 'Whatnot',
    pageType: 'inventory',
    keywords: ['whatnot inventory', 'live auction inventory', 'whatnot sellers', 'live selling pallets'],
    angles: [
      { id: 'live-selling', name: 'Live Selling', weight: 0.95, phrases: ['live auction format', 'real-time bidding', 'interactive selling', 'stream-friendly'] },
      { id: 'unboxing', name: 'Unboxing Appeal', weight: 0.9, phrases: ['mystery appeal', 'unboxing content', 'visual excitement', 'reveal moments'] },
      { id: 'shipping', name: 'Shipping Friendly', weight: 0.85, phrases: ['small form factor', 'easy shipping', 'package-ready', 'lightweight items'] },
    ],
    relatedTerms: ['live streaming', 'mystery lots', 'auction format', 'reseller community', 'small items', 'fast-moving'],
    specificTerms: ['break-style selling', 'lot breaks', 'category shows', 'smalls-heavy loads', 'camera-ready'],
    imageStyle: 'live streaming setup with ring light, camera, and merchandise ready for auction',
  },
  {
    slug: 'ebay-reseller-inventory',
    displayName: 'eBay Reseller',
    pageType: 'inventory',
    keywords: ['ebay reseller inventory', 'ebay seller pallets', 'online reseller inventory'],
    angles: [
      { id: 'manifested', name: 'Manifested Loads', weight: 0.95, phrases: ['manifested pallets', 'itemized inventory', 'SKU-level detail', 'pricing data'] },
      { id: 'brands', name: 'Gated Brands', weight: 0.9, phrases: ['brand gating', 'ungated items', 'brand restrictions', 'authorization required'] },
      { id: 'listing', name: 'Listing Prep', weight: 0.85, phrases: ['listing-ready', 'photo-ready', 'condition grading', 'item research'] },
    ],
    relatedTerms: ['manifested', 'brand gating', 'listing optimization', 'condition grading', 'profit margin', 'sell-through'],
    specificTerms: ['auction-style', 'Buy It Now ready', 'category restrictions', 'authentication eligible', 'VeRO compliant'],
    imageStyle: 'home reselling workspace with computer, shipping supplies, and inventory shelves',
  },
  {
    slug: 'amazon-fba-liquidation',
    displayName: 'Amazon FBA',
    pageType: 'inventory',
    keywords: ['amazon fba liquidation', 'fba inventory', 'fba-ready pallets', 'amazon seller inventory'],
    angles: [
      { id: 'prep', name: 'FBA Prep Requirements', weight: 0.95, phrases: ['FBA prep', 'labeling requirements', 'poly bagging', 'bundling rules'] },
      { id: 'restrictions', name: 'Category Restrictions', weight: 0.9, phrases: ['gated categories', 'restricted brands', 'approval required', 'ungated items'] },
      { id: 'sizing', name: 'FBA Sizing Tiers', weight: 0.85, phrases: ['standard size', 'oversize items', 'sortable inventory', 'non-sortable'] },
    ],
    relatedTerms: ['FBA prep', 'gated categories', 'sortable', 'oversize', 'FNSKU', 'inbound shipping'],
    specificTerms: ['prep center ready', 'merchant fulfilled alternative', 'commingled vs labeled', 'IPI score friendly'],
    imageStyle: 'FBA prep center with labeling station, poly bags, and organized inventory',
  },
  {
    slug: 'discount-store-inventory',
    displayName: 'Discount Store',
    pageType: 'inventory',
    keywords: ['discount store inventory', 'dollar store pallets', 'surplus store inventory'],
    angles: [
      { id: 'price-points', name: 'Price Point Strategy', weight: 0.9, phrases: ['fixed price points', 'dollar store pricing', 'margin maintenance', 'cost optimization'] },
      { id: 'variety', name: 'Category Variety', weight: 0.85, phrases: ['multi-category mix', 'household essentials', 'everyday items', 'impulse buys'] },
      { id: 'volume', name: 'Volume Purchasing', weight: 0.8, phrases: ['bulk buying', 'truckload quantities', 'consistent supply', 'repeat orders'] },
    ],
    relatedTerms: ['fixed price', 'dollar store', 'surplus', 'closeouts', 'essentials', 'impulse items'],
    specificTerms: ['$1.25 price point', 'multi-price format', 'basket builders', 'checkout impulse'],
    imageStyle: 'discount retail store interior with organized shelves of everyday merchandise',
  },
  {
    slug: 'flea-market-pallets',
    displayName: 'Flea Market',
    pageType: 'inventory',
    keywords: ['flea market pallets', 'flea market inventory', 'swap meet merchandise'],
    angles: [
      { id: 'variety', name: 'Product Variety', weight: 0.9, phrases: ['mixed merchandise', 'treasure hunt', 'diverse inventory', 'eclectic mix'] },
      { id: 'pricing', name: 'Flexible Pricing', weight: 0.85, phrases: ['negotiation ready', 'cash sales', 'deal-making', 'bundle pricing'] },
      { id: 'transport', name: 'Easy Transport', weight: 0.8, phrases: ['vehicle-friendly', 'setup ease', 'pack and go', 'display-ready'] },
    ],
    relatedTerms: ['swap meet', 'outdoor market', 'vendor inventory', 'cash business', 'weekend sales', 'booth setup'],
    specificTerms: ['canopy-friendly', 'table display items', 'haggle-proof pricing', 'weather considerations'],
    imageStyle: 'flea market booth with diverse merchandise display and vendor setup',
  },
  {
    slug: 'grocery-store-liquidation-inventory',
    displayName: 'Grocery Store',
    pageType: 'inventory',
    keywords: ['grocery store inventory', 'grocery liquidation', 'food store pallets'],
    angles: [
      { id: 'expiration', name: 'Date Management', weight: 0.95, phrases: ['date-coded', 'shelf life planning', 'rotation strategy', 'best-by tracking'] },
      { id: 'compliance', name: 'Food Safety', weight: 0.9, phrases: ['food safety', 'storage requirements', 'temperature control', 'handling protocols'] },
      { id: 'categories', name: 'Grocery Categories', weight: 0.85, phrases: ['dry goods', 'beverages', 'snacks', 'canned goods', 'pantry staples'] },
    ],
    relatedTerms: ['food liquidation', 'date-coded', 'salvage grocery', 'CPG closeouts', 'shelf-stable'],
    specificTerms: ['grocery salvage', 'damaged packaging', 'label changes', 'discontinued items', 'seasonal food'],
    imageStyle: 'grocery liquidation warehouse with food pallets organized by category',
  },
  {
    slug: 'returns-pallets',
    displayName: 'Returns',
    pageType: 'inventory',
    keywords: ['returns pallets', 'customer returns liquidation', 'retail returns wholesale'],
    angles: [
      { id: 'grading', name: 'Condition Grading', weight: 0.95, phrases: ['condition grades', 'grade-A returns', 'tested working', 'as-is lots'] },
      { id: 'manifests', name: 'Manifest Accuracy', weight: 0.9, phrases: ['manifested returns', 'item-level detail', 'manifest verification', 'SKU accuracy'] },
      { id: 'sources', name: 'Return Sources', weight: 0.85, phrases: ['online returns', 'in-store returns', 'buyer remorse', 'defective returns'] },
    ],
    relatedTerms: ['customer returns', 'graded returns', 'manifested', 'unmanifested', 'salvage', 'as-is'],
    specificTerms: ['Grade A', 'Grade B', 'Grade C', 'uninspected', 'tested functional', 'shelf pulls mix'],
    imageStyle: 'returns processing center with grading stations and organized pallets',
  },
  {
    slug: 'overstock-liquidation',
    displayName: 'Overstock',
    pageType: 'inventory',
    keywords: ['overstock liquidation', 'overstock pallets', 'excess inventory wholesale', 'closeout merchandise'],
    angles: [
      { id: 'new-condition', name: 'New Condition', weight: 0.95, phrases: ['brand new', 'never sold', 'retail ready', 'original packaging'] },
      { id: 'seasonal', name: 'Seasonal Overstock', weight: 0.9, phrases: ['seasonal excess', 'holiday overstock', 'off-season deals', 'timing opportunities'] },
      { id: 'closeouts', name: 'Closeout Deals', weight: 0.85, phrases: ['discontinued SKUs', 'packaging changes', 'brand transitions', 'store closings'] },
    ],
    relatedTerms: ['brand new', 'excess inventory', 'closeouts', 'seasonal', 'discontinued', 'packaging changes'],
    specificTerms: ['planogram changes', 'store reset overstock', 'forecast excess', 'promotional leftovers'],
    imageStyle: 'warehouse with new-in-box overstock merchandise organized on pallets',
  },
  {
    slug: 'wholesale-pallets',
    displayName: 'Wholesale',
    pageType: 'inventory',
    keywords: ['wholesale pallets', 'bulk liquidation', 'wholesale truckloads', 'bulk merchandise'],
    angles: [
      { id: 'volume', name: 'Volume Discounts', weight: 0.9, phrases: ['bulk pricing', 'volume discounts', 'truckload savings', 'scale economics'] },
      { id: 'variety', name: 'Category Variety', weight: 0.85, phrases: ['multi-category', 'assorted merchandise', 'mixed loads', 'diverse inventory'] },
      { id: 'suppliers', name: 'Supplier Network', weight: 0.8, phrases: ['verified suppliers', 'direct sourcing', 'consistent supply', 'relationship building'] },
    ],
    relatedTerms: ['bulk buying', 'truckload', 'LTL', 'volume pricing', 'wholesale suppliers', 'B2B'],
    specificTerms: ['minimum orders', 'MOQ', 'freight terms', 'payment terms', 'repeat buyer programs'],
    imageStyle: 'large wholesale warehouse with full truckload quantities and diverse merchandise',
  },
];

export function getInventoryTypeBySlug(slug: string): PageDefinition | undefined {
  return INVENTORY_TYPES.find(i => i.slug === slug);
}

export function getAllInventoryTypeSlugs(): string[] {
  return INVENTORY_TYPES.map(i => i.slug);
}
