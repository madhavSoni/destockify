import { PageDefinition } from '../types';

/**
 * Category Page Configurations
 * 14 product category pages with industry-specific terminology
 */
export const CATEGORIES: PageDefinition[] = [
  {
    slug: 'general-merchandise-liquidation',
    displayName: 'General Merchandise',
    pageType: 'category',
    keywords: ['general merchandise liquidation', 'GM pallets', 'mixed merchandise truckloads'],
    angles: [
      { id: 'mixed-loads', name: 'Mixed Category Loads', weight: 0.9, phrases: ['mixed GM pallets', 'multi-category truckloads', 'assorted merchandise'] },
      { id: 'bin-store', name: 'Bin Store Ready', weight: 0.85, phrases: ['bin store inventory', 'high piece count', 'fast-moving items'] },
      { id: 'sorting', name: 'Sorting Workflow', weight: 0.8, phrases: ['sort and grade', 'category separation', 'product organization'] },
    ],
    relatedTerms: ['mixed pallets', 'multi-category', 'HPC', 'assorted goods', 'bin store ready', 'GM truckloads'],
    specificTerms: ['department store mix', 'retailer-direct GM', 'cross-category pallets', 'variety store inventory'],
    imageStyle: 'warehouse with diverse merchandise pallets showing multiple product categories',
  },
  {
    slug: 'electronics-pallets',
    displayName: 'Electronics',
    pageType: 'category',
    keywords: ['electronics pallets', 'electronics liquidation', 'tech liquidation', 'consumer electronics wholesale'],
    angles: [
      { id: 'testing', name: 'Functional Testing', weight: 0.95, phrases: ['tested working', 'power-on verified', 'functionality testing', 'grade-A tested'] },
      { id: 'accessories', name: 'Accessory Completeness', weight: 0.85, phrases: ['original accessories', 'cables included', 'chargers present', 'box contents'] },
      { id: 'data-security', name: 'Data Security', weight: 0.8, phrases: ['factory reset', 'data wiped', 'account removed', 'privacy cleared'] },
    ],
    relatedTerms: ['tested working', 'open box', 'factory sealed', 'accessories', 'data wipe', 'consumer electronics'],
    specificTerms: ['smart home devices', 'wearables', 'audio equipment', 'gaming peripherals', 'computer components'],
    imageStyle: 'organized electronics warehouse with TVs, laptops, tablets on shelving',
  },
  {
    slug: 'tools-liquidation',
    displayName: 'Tools',
    pageType: 'category',
    keywords: ['tools liquidation', 'power tool pallets', 'tool liquidation truckloads', 'contractor tools wholesale'],
    angles: [
      { id: 'batteries', name: 'Battery Verification', weight: 0.95, phrases: ['battery included', 'charger present', 'cordless complete', 'battery pack condition'] },
      { id: 'brands', name: 'Premium Brands', weight: 0.9, phrases: ['DeWalt', 'Milwaukee', 'Makita', 'Ryobi', 'Bosch', 'professional-grade'] },
      { id: 'testing', name: 'Tool Testing', weight: 0.85, phrases: ['motor tested', 'trigger verified', 'safety checked', 'functional inspection'] },
    ],
    relatedTerms: ['power tools', 'cordless tools', 'hand tools', 'batteries', 'chargers', 'contractor-grade', 'professional'],
    specificTerms: ['20V MAX systems', '18V cordless', 'combo kits', 'bare tools', 'tool storage', 'compressors'],
    imageStyle: 'organized tool warehouse with power tools, cordless systems, and hand tools on racks',
  },
  {
    slug: 'furniture-liquidation',
    displayName: 'Furniture',
    pageType: 'category',
    keywords: ['furniture liquidation', 'furniture pallets', 'furniture truckloads', 'wholesale furniture'],
    angles: [
      { id: 'condition', name: 'Condition Assessment', weight: 0.9, phrases: ['scratch and dent', 'slight damage', 'cosmetic imperfections', 'assembly required'] },
      { id: 'freight', name: 'Freight Considerations', weight: 0.85, phrases: ['oversized shipping', 'LTL freight', 'white glove', 'dock delivery'] },
      { id: 'assembly', name: 'Assembly Hardware', weight: 0.8, phrases: ['hardware included', 'assembly instructions', 'missing parts', 'box condition'] },
    ],
    relatedTerms: ['scratch and dent', 'assembly required', 'oversized', 'RTA furniture', 'upholstered', 'case goods'],
    specificTerms: ['living room sets', 'bedroom furniture', 'office furniture', 'outdoor patio', 'mattresses', 'accent pieces'],
    imageStyle: 'furniture warehouse with sofas, tables, bedroom sets wrapped and organized',
  },
  {
    slug: 'grocery-liquidation',
    displayName: 'Grocery',
    pageType: 'category',
    keywords: ['grocery liquidation', 'food liquidation', 'grocery closeouts', 'food pallets'],
    angles: [
      { id: 'expiration', name: 'Expiration Management', weight: 0.95, phrases: ['best-by dates', 'short-dated inventory', 'expiration compliance', 'date coding'] },
      { id: 'storage', name: 'Storage Requirements', weight: 0.9, phrases: ['temperature controlled', 'dry storage', 'shelf stable', 'ambient temperature'] },
      { id: 'compliance', name: 'Regulatory Compliance', weight: 0.85, phrases: ['FDA compliant', 'labeling requirements', 'state regulations', 'food safety'] },
    ],
    relatedTerms: ['short-dated', 'closeouts', 'dry goods', 'beverages', 'snacks', 'canned goods', 'CPG'],
    specificTerms: ['date-coded inventory', 'salvage food', 'packaging changes', 'formula updates', 'seasonal grocery'],
    imageStyle: 'food distribution warehouse with dry goods, beverages, and packaged foods on pallets',
  },
  {
    slug: 'apparel-wholesale',
    displayName: 'Apparel',
    pageType: 'category',
    keywords: ['apparel wholesale', 'clothing liquidation', 'apparel pallets', 'clothing truckloads'],
    angles: [
      { id: 'size-runs', name: 'Size Distribution', weight: 0.95, phrases: ['complete size runs', 'size curve', 'assorted sizes', 'size optimization'] },
      { id: 'seasonality', name: 'Seasonal Timing', weight: 0.9, phrases: ['seasonal inventory', 'off-season discounts', 'fashion cycles', 'trend timing'] },
      { id: 'sorting', name: 'Sorting Workflow', weight: 0.85, phrases: ['sort by category', 'brand separation', 'size organization', 'condition grading'] },
    ],
    relatedTerms: ['NWT', 'NWOT', 'size runs', 'seasonal', 'fashion', 'brand mix', 'case pack clothing'],
    specificTerms: ["men's apparel", "women's fashion", "children's clothing", 'activewear', 'outerwear', 'basics'],
    imageStyle: 'clothing warehouse with organized racks and boxes of folded apparel by category',
  },
  {
    slug: 'shoes-wholesale',
    displayName: 'Shoes',
    pageType: 'category',
    keywords: ['shoes wholesale', 'footwear liquidation', 'shoe pallets', 'footwear truckloads'],
    angles: [
      { id: 'pairs', name: 'Pair Verification', weight: 0.95, phrases: ['matched pairs', 'box condition', 'sizing labels', 'pair integrity'] },
      { id: 'brands', name: 'Brand Value', weight: 0.9, phrases: ['name-brand footwear', 'athletic brands', 'designer shoes', 'brand recognition'] },
      { id: 'categories', name: 'Footwear Categories', weight: 0.85, phrases: ['athletic shoes', 'dress shoes', 'casual footwear', 'boots', 'sandals'] },
    ],
    relatedTerms: ['matched pairs', 'athletic footwear', 'dress shoes', 'boots', 'sandals', 'sneakers', 'brand-name'],
    specificTerms: ['Nike liquidation', 'Adidas overstock', 'work boots', "children's shoes", 'seasonal footwear'],
    imageStyle: 'footwear warehouse with shoe boxes organized on shelving by category and brand',
  },
  {
    slug: 'beauty-liquidation',
    displayName: 'Beauty',
    pageType: 'category',
    keywords: ['beauty liquidation', 'cosmetics liquidation', 'beauty pallets', 'HBA wholesale'],
    angles: [
      { id: 'authenticity', name: 'Authenticity Verification', weight: 0.95, phrases: ['authentic products', 'brand verification', 'counterfeit-free', 'authorized sourcing'] },
      { id: 'expiration', name: 'Shelf Life', weight: 0.9, phrases: ['lot codes', 'manufacturing dates', 'shelf life', 'expiration awareness'] },
      { id: 'sealed', name: 'Product Integrity', weight: 0.85, phrases: ['factory sealed', 'unopened', 'tamper-evident', 'original packaging'] },
    ],
    relatedTerms: ['cosmetics', 'skincare', 'haircare', 'fragrance', 'sealed', 'lot codes', 'prestige beauty'],
    specificTerms: ['color cosmetics', 'treatment products', 'professional haircare', 'nail products', 'bath and body'],
    imageStyle: 'beauty product warehouse with organized cosmetics, skincare, and haircare displays',
  },
  {
    slug: 'toys-liquidation',
    displayName: 'Toys',
    pageType: 'category',
    keywords: ['toys liquidation', 'toy pallets', 'toy truckloads', 'wholesale toys'],
    angles: [
      { id: 'brands', name: 'Licensed Brands', weight: 0.9, phrases: ['licensed toys', 'major brands', 'character merchandise', 'brand recognition'] },
      { id: 'safety', name: 'Safety Compliance', weight: 0.85, phrases: ['CPSC compliant', 'age-appropriate', 'safety tested', 'recall verification'] },
      { id: 'seasonal', name: 'Seasonal Demand', weight: 0.8, phrases: ['holiday inventory', 'seasonal timing', 'gift-giving seasons', 'birthday demand'] },
    ],
    relatedTerms: ['licensed toys', 'action figures', 'games', 'puzzles', 'outdoor toys', 'educational', 'STEM'],
    specificTerms: ['Hasbro products', 'Mattel toys', 'LEGO liquidation', 'plush toys', 'ride-on toys', 'collectibles'],
    imageStyle: 'toy warehouse with colorful packaging and organized displays of games and toys',
  },
  {
    slug: 'sporting-goods-liquidation',
    displayName: 'Sporting Goods',
    pageType: 'category',
    keywords: ['sporting goods liquidation', 'sports equipment pallets', 'fitness liquidation'],
    angles: [
      { id: 'fitness', name: 'Fitness Equipment', weight: 0.9, phrases: ['gym equipment', 'home fitness', 'exercise machines', 'weights'] },
      { id: 'outdoor', name: 'Outdoor Recreation', weight: 0.85, phrases: ['camping gear', 'outdoor equipment', 'hiking supplies', 'fishing gear'] },
      { id: 'team-sports', name: 'Team Sports', weight: 0.8, phrases: ['team sports equipment', 'balls', 'protective gear', 'athletic apparel'] },
    ],
    relatedTerms: ['fitness equipment', 'outdoor gear', 'team sports', 'athletic apparel', 'camping', 'cycling'],
    specificTerms: ['home gym equipment', 'yoga accessories', 'golf equipment', 'water sports', 'winter sports'],
    imageStyle: 'sporting goods warehouse with fitness equipment, outdoor gear, and team sports supplies',
  },
  {
    slug: 'baby-products-liquidation',
    displayName: 'Baby Products',
    pageType: 'category',
    keywords: ['baby products liquidation', 'baby pallets', 'baby gear wholesale'],
    angles: [
      { id: 'safety', name: 'Safety Standards', weight: 0.95, phrases: ['CPSC compliant', 'safety certified', 'recall-free', 'current standards'] },
      { id: 'gear', name: 'Baby Gear', weight: 0.9, phrases: ['strollers', 'car seats', 'high chairs', 'cribs', 'nursery furniture'] },
      { id: 'essentials', name: 'Baby Essentials', weight: 0.85, phrases: ['diapers', 'formula', 'feeding supplies', 'baby care'] },
    ],
    relatedTerms: ['baby gear', 'strollers', 'car seats', 'nursery', 'feeding', 'safety certified', 'infant care'],
    specificTerms: ['travel systems', 'baby monitors', 'nursing supplies', 'baby toys', 'clothing 0-24M'],
    imageStyle: 'baby products warehouse with strollers, car seats, and nursery items organized',
  },
  {
    slug: 'automotive-liquidation',
    displayName: 'Automotive',
    pageType: 'category',
    keywords: ['automotive liquidation', 'auto parts pallets', 'car accessories wholesale'],
    angles: [
      { id: 'accessories', name: 'Car Accessories', weight: 0.9, phrases: ['car accessories', 'interior accessories', 'exterior add-ons', 'mobile electronics'] },
      { id: 'parts', name: 'Replacement Parts', weight: 0.85, phrases: ['replacement parts', 'maintenance items', 'filters', 'fluids'] },
      { id: 'detailing', name: 'Detailing Products', weight: 0.8, phrases: ['car care', 'detailing supplies', 'cleaning products', 'waxes'] },
    ],
    relatedTerms: ['car accessories', 'auto parts', 'detailing', 'car care', 'maintenance', 'mobile electronics'],
    specificTerms: ['floor mats', 'seat covers', 'phone mounts', 'dash cams', 'jump starters', 'tool kits'],
    imageStyle: 'automotive accessories warehouse with car parts, detailing products, and accessories',
  },
  {
    slug: 'housewares-liquidation',
    displayName: 'Housewares',
    pageType: 'category',
    keywords: ['housewares liquidation', 'kitchen pallets', 'home goods wholesale'],
    angles: [
      { id: 'kitchen', name: 'Kitchen Items', weight: 0.9, phrases: ['kitchenware', 'cookware', 'bakeware', 'kitchen gadgets', 'food storage'] },
      { id: 'appliances', name: 'Small Appliances', weight: 0.85, phrases: ['small appliances', 'countertop appliances', 'coffee makers', 'blenders'] },
      { id: 'storage', name: 'Home Organization', weight: 0.8, phrases: ['storage solutions', 'organization', 'containers', 'shelving'] },
    ],
    relatedTerms: ['kitchenware', 'small appliances', 'cookware', 'storage', 'organization', 'home essentials'],
    specificTerms: ['Instant Pot', 'air fryers', 'vacuum cleaners', 'bedding', 'bath accessories', 'cleaning supplies'],
    imageStyle: 'housewares warehouse with kitchen items, small appliances, and home organization products',
  },
  {
    slug: 'health-wellness-liquidation',
    displayName: 'Health & Wellness',
    pageType: 'category',
    keywords: ['health wellness liquidation', 'wellness pallets', 'health products wholesale'],
    angles: [
      { id: 'supplements', name: 'Vitamins & Supplements', weight: 0.9, phrases: ['vitamins', 'supplements', 'wellness products', 'nutritional items'] },
      { id: 'fitness', name: 'Fitness Accessories', weight: 0.85, phrases: ['fitness accessories', 'workout equipment', 'yoga supplies', 'recovery tools'] },
      { id: 'personal-care', name: 'Personal Care', weight: 0.8, phrases: ['personal care', 'grooming', 'oral care', 'skincare'] },
    ],
    relatedTerms: ['vitamins', 'supplements', 'fitness accessories', 'personal care', 'wellness', 'health devices'],
    specificTerms: ['protein supplements', 'essential oils', 'massage tools', 'first aid', 'health monitors'],
    imageStyle: 'health and wellness warehouse with vitamins, fitness gear, and personal care products',
  },
];

export function getCategoryBySlug(slug: string): PageDefinition | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return CATEGORIES.map(c => c.slug);
}
