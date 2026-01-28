import { PageDefinition } from '../types';

/**
 * Retailer Page Configurations
 * 16 major retailer liquidation pages with industry-specific terminology
 */
export const RETAILERS: PageDefinition[] = [
  {
    slug: 'amazon-liquidation',
    displayName: 'Amazon',
    pageType: 'retailer',
    keywords: ['amazon liquidation pallets', 'amazon returns', 'FBA liquidation', 'amazon overstock'],
    angles: [
      { id: 'fba-returns', name: 'FBA Returns', weight: 0.9, phrases: ['Fulfilled by Amazon returns', 'FBA customer returns', 'Prime member returns', 'warehouse deals'] },
      { id: 'condition-codes', name: 'Condition Grading', weight: 0.8, phrases: ['LPN tracking', 'condition codes', 'sortable vs non-sortable', 'FC grading'] },
      { id: 'lot-types', name: 'Amazon Lot Types', weight: 0.85, phrases: ['Amazon Smalls', 'Amazon Mediums', 'Amazon Monsters', 'high piece count', 'HD loads'] },
    ],
    relatedTerms: ['FC', 'LPN', 'Smalls', 'Mediums', 'Monsters', 'HPC', 'FBA', 'FBM', 'warehouse deals', 'customer returns'],
    specificTerms: ['Amazon FC returns', 'LPN manifested loads', 'sortable truckloads', 'non-sortable pallets', 'Amazon HD', 'mystery boxes'],
    imageStyle: 'modern fulfillment center with Amazon-branded boxes on conveyor belts and pallets',
  },
  {
    slug: 'walmart-liquidation',
    displayName: 'Walmart',
    pageType: 'retailer',
    keywords: ['walmart liquidation', 'walmart overstock pallets', 'walmart returns', 'walmart GM truckloads'],
    angles: [
      { id: 'gm-truckloads', name: 'GM Truckloads', weight: 0.9, phrases: ['general merchandise truckloads', 'mixed GM pallets', 'department store returns'] },
      { id: 'shelf-pulls', name: 'Shelf Pulls', weight: 0.8, phrases: ['retail shelf pulls', 'store reset merchandise', 'planogram changes'] },
      { id: 'regional-dcs', name: 'Regional Distribution', weight: 0.7, phrases: ['regional DC loads', '4-way pallets', 'store-level returns'] },
    ],
    relatedTerms: ['GM truckloads', 'shelf pulls', '4-way pallets', 'store resets', 'dot-com returns', 'supercenter overstock'],
    specificTerms: ['Walmart.com returns', 'supercenter liquidation', 'neighborhood market overstock', 'regional DC surplus'],
    imageStyle: 'large retail distribution center with blue and yellow accents, organized pallet racks',
  },
  {
    slug: 'target-liquidation',
    displayName: 'Target',
    pageType: 'retailer',
    keywords: ['target liquidation', 'target returns pallets', 'target overstock', 'target truckloads'],
    angles: [
      { id: 'raw-loads', name: 'Raw/Unsorted Loads', weight: 0.85, phrases: ['raw unsorted returns', 'unmanifested loads', 'blind pallets'] },
      { id: 'case-pack', name: 'Case Pack Clothing', weight: 0.8, phrases: ['case pack apparel', 'new with tags', 'seasonal clothing loads'] },
      { id: 'private-label', name: 'Private Label Mix', weight: 0.7, phrases: ['Target private label', 'exclusive brands', 'owned brand inventory'] },
    ],
    relatedTerms: ['raw loads', 'unsorted returns', 'case pack', 'Target Circle returns', 'seasonal bulge', 'private label'],
    specificTerms: ['Target+ marketplace returns', 'in-store returns', 'Target exclusive brands', 'seasonal clearance loads'],
    imageStyle: 'bright retail warehouse with red accents and organized merchandise bins',
  },
  {
    slug: 'costco-liquidation',
    displayName: 'Costco',
    pageType: 'retailer',
    keywords: ['costco liquidation', 'costco returns pallets', 'costco overstock', 'bulk liquidation'],
    angles: [
      { id: 'bulk-returns', name: 'Bulk Returns', weight: 0.9, phrases: ['membership returns', 'bulk item returns', 'oversized merchandise'] },
      { id: 'appliances', name: 'Appliances & Furniture', weight: 0.85, phrases: ['large appliances', 'furniture returns', 'patio sets', 'mattresses'] },
      { id: 'kirkland', name: 'Kirkland Brand', weight: 0.7, phrases: ['Kirkland Signature', 'private label', 'exclusive products'] },
    ],
    relatedTerms: ['bulk returns', 'membership items', 'Kirkland brand', 'oversized pallets', 'appliance liquidation'],
    specificTerms: ['Costco Business Center returns', 'warehouse club overstock', 'executive member returns', 'organic closeouts'],
    imageStyle: 'warehouse club interior with large bulk items and industrial shelving',
  },
  {
    slug: 'sams-club-liquidation',
    displayName: "Sam's Club",
    pageType: 'retailer',
    keywords: ["sam's club liquidation", "sam's club returns", "sam's club pallets", 'wholesale club liquidation'],
    angles: [
      { id: 'business-returns', name: 'Business Member Returns', weight: 0.85, phrases: ['business member returns', 'commercial overstock', 'bulk office supplies'] },
      { id: 'mixed-gm', name: 'Mixed GM Loads', weight: 0.8, phrases: ['mixed general merchandise', 'club store inventory', 'multi-category pallets'] },
    ],
    relatedTerms: ['club store returns', 'business member', 'bulk merchandise', 'commercial inventory', 'multi-pack items'],
    specificTerms: ["Sam's Club Plus returns", 'Scan & Go returns', 'club store exclusives', 'business center liquidation'],
    imageStyle: 'wholesale warehouse with bulk merchandise displays and wide aisles',
  },
  {
    slug: 'home-depot-liquidation',
    displayName: 'Home Depot',
    pageType: 'retailer',
    keywords: ['home depot liquidation', 'home depot tools pallets', 'home depot returns', 'HD liquidation'],
    angles: [
      { id: 'tools', name: 'Power Tools', weight: 0.95, phrases: ['power tools', 'cordless tools', 'contractor-grade', 'professional tools'] },
      { id: 'testing', name: 'Testing Requirements', weight: 0.85, phrases: ['tool testing', 'battery verification', 'charger presence', 'functional inspection'] },
      { id: 'home-improvement', name: 'Home Improvement', weight: 0.8, phrases: ['lighting fixtures', 'faucets', 'plumbing supplies', 'building materials'] },
    ],
    relatedTerms: ['power tools', 'cordless', 'DeWalt', 'Milwaukee', 'Ryobi', 'lighting', 'faucets', 'plumbing', 'contractor returns'],
    specificTerms: ['Pro Desk returns', 'contractor-grade tools', 'HD tool rental returns', 'special order cancellations'],
    imageStyle: 'home improvement warehouse with orange accents, organized tool displays and building materials',
  },
  {
    slug: 'lowes-liquidation',
    displayName: "Lowe's",
    pageType: 'retailer',
    keywords: ["lowe's liquidation", "lowe's tools pallets", "lowe's returns", "lowe's overstock"],
    angles: [
      { id: 'power-tools', name: 'Power Tools', weight: 0.9, phrases: ['Kobalt tools', 'Craftsman', 'power tool sets', 'cordless systems'] },
      { id: 'garden', name: 'Garden & Outdoor', weight: 0.85, phrases: ['lawn and garden', 'outdoor power equipment', 'patio furniture', 'seasonal plants'] },
      { id: 'hardware', name: 'Hardware & Plumbing', weight: 0.8, phrases: ['plumbing fixtures', 'hardware assortments', 'fasteners', 'electrical supplies'] },
    ],
    relatedTerms: ['Kobalt', 'Craftsman', 'garden center', 'outdoor living', 'plumbing', 'hardware', 'seasonal'],
    specificTerms: ["Lowe's Pro returns", 'Kobalt tool liquidation', 'garden center clearance', 'installation returns'],
    imageStyle: 'blue-themed home improvement store with tools, garden supplies, and hardware sections',
  },
  {
    slug: 'ace-hardware-liquidation',
    displayName: 'Ace Hardware',
    pageType: 'retailer',
    keywords: ['ace hardware liquidation', 'ace hardware pallets', 'hardware store liquidation'],
    angles: [
      { id: 'hardware', name: 'Hardware Assortments', weight: 0.9, phrases: ['hardware assortments', 'fastener lots', 'hand tools', 'paint supplies'] },
      { id: 'seasonal', name: 'Seasonal Merchandise', weight: 0.85, phrases: ['seasonal outdoor', 'holiday decorations', 'lawn care', 'winter supplies'] },
    ],
    relatedTerms: ['hardware store', 'paint supplies', 'hand tools', 'seasonal', 'lawn care', 'outdoor living'],
    specificTerms: ['Ace-branded products', 'cooperative store returns', 'neighborhood hardware overstock'],
    imageStyle: 'neighborhood hardware store with red signage and organized tool displays',
  },
  {
    slug: 'macys-liquidation',
    displayName: "Macy's",
    pageType: 'retailer',
    keywords: ["macy's liquidation", "macy's returns pallets", "macy's clothing liquidation", 'department store liquidation'],
    angles: [
      { id: 'designer-apparel', name: 'Designer Apparel', weight: 0.9, phrases: ['designer clothing', 'brand-name fashion', 'department store apparel'] },
      { id: 'shoes-accessories', name: 'Shoes & Accessories', weight: 0.85, phrases: ['designer shoes', 'handbags', 'jewelry', 'accessories'] },
      { id: 'beauty', name: 'Beauty & Cosmetics', weight: 0.8, phrases: ['prestige beauty', 'cosmetics', 'fragrances', 'skincare'] },
    ],
    relatedTerms: ['designer brands', 'department store', 'fashion apparel', 'cosmetics', 'shoes', 'handbags'],
    specificTerms: ["Macy's Backstage returns", 'store closing inventory', 'seasonal fashion clearance', 'prestige brand liquidation'],
    imageStyle: 'upscale department store interior with fashion displays and beauty counters',
  },
  {
    slug: 'kohls-liquidation',
    displayName: "Kohl's",
    pageType: 'retailer',
    keywords: ["kohl's liquidation", "kohl's returns pallets", "kohl's clothing liquidation"],
    angles: [
      { id: 'apparel', name: 'Family Apparel', weight: 0.9, phrases: ['family clothing', "men's apparel", "women's fashion", "children's clothing"] },
      { id: 'home-goods', name: 'Home Goods', weight: 0.8, phrases: ['home décor', 'bedding', 'kitchen items', 'small appliances'] },
      { id: 'amazon-returns', name: 'Amazon Returns', weight: 0.75, phrases: ["Kohl's Amazon returns", 'return hub inventory', 'mixed retail returns'] },
    ],
    relatedTerms: ['family apparel', 'home goods', 'bedding', 'kitchen', 'Amazon returns hub', 'private label'],
    specificTerms: ["Kohl's Cash returns", 'Amazon return hub overflow', 'clearance event inventory', "Sonoma brand liquidation"],
    imageStyle: 'family department store with clothing racks and home goods displays',
  },
  {
    slug: 'jcpenney-liquidation',
    displayName: 'JCPenney',
    pageType: 'retailer',
    keywords: ['jcpenney liquidation', 'jcpenney returns pallets', 'jcpenney clothing'],
    angles: [
      { id: 'apparel', name: 'Apparel & Footwear', weight: 0.9, phrases: ['family apparel', 'footwear', 'work clothing', 'casual wear'] },
      { id: 'home', name: 'Home & Bedding', weight: 0.85, phrases: ['home goods', 'bedding sets', 'window treatments', 'bath accessories'] },
    ],
    relatedTerms: ['family clothing', 'home goods', 'bedding', 'footwear', 'work apparel', 'window treatments'],
    specificTerms: ['JCP private label', 'store consolidation inventory', 'salon equipment', 'portrait studio equipment'],
    imageStyle: 'traditional department store with clothing and home goods sections',
  },
  {
    slug: 'nordstrom-liquidation',
    displayName: 'Nordstrom',
    pageType: 'retailer',
    keywords: ['nordstrom liquidation', 'nordstrom returns pallets', 'designer liquidation', 'premium apparel liquidation'],
    angles: [
      { id: 'designer', name: 'Designer Brands', weight: 0.95, phrases: ['designer fashion', 'premium brands', 'luxury apparel', 'high-end merchandise'] },
      { id: 'shoes', name: 'Premium Footwear', weight: 0.9, phrases: ['designer shoes', 'premium footwear', 'brand-name heels', 'luxury sneakers'] },
      { id: 'beauty', name: 'Prestige Beauty', weight: 0.85, phrases: ['prestige cosmetics', 'luxury skincare', 'designer fragrances'] },
    ],
    relatedTerms: ['designer brands', 'luxury fashion', 'premium footwear', 'prestige beauty', 'high-end accessories'],
    specificTerms: ['Nordstrom Rack overflow', 'anniversary sale returns', 'designer consignment returns', 'alterations returns'],
    imageStyle: 'upscale retail environment with designer fashion displays and premium merchandise',
  },
  {
    slug: 'best-buy-liquidation',
    displayName: 'Best Buy',
    pageType: 'retailer',
    keywords: ['best buy liquidation', 'best buy returns pallets', 'electronics liquidation', 'tech liquidation'],
    angles: [
      { id: 'electronics', name: 'Consumer Electronics', weight: 0.95, phrases: ['TVs', 'laptops', 'tablets', 'smartphones', 'gaming consoles'] },
      { id: 'open-box', name: 'Open Box Items', weight: 0.9, phrases: ['open box', 'display models', 'customer returns', 'certified refurbished'] },
      { id: 'appliances', name: 'Appliances', weight: 0.8, phrases: ['major appliances', 'small appliances', 'kitchen electronics'] },
    ],
    relatedTerms: ['consumer electronics', 'TVs', 'laptops', 'gaming', 'open box', 'Geek Squad', 'appliances'],
    specificTerms: ['Geek Squad returns', 'Total Tech returns', 'display model clearance', 'discontinued SKUs'],
    imageStyle: 'electronics retail store with TV walls, laptop displays, and appliance sections',
  },
  {
    slug: 'tjmaxx-liquidation',
    displayName: 'TJ Maxx',
    pageType: 'retailer',
    keywords: ['tj maxx liquidation', 'tj maxx pallets', 'off-price retail liquidation'],
    angles: [
      { id: 'apparel', name: 'Off-Price Apparel', weight: 0.9, phrases: ['off-price fashion', 'brand-name clothing', 'designer discounts'] },
      { id: 'home', name: 'Home Décor', weight: 0.85, phrases: ['home décor', 'accent furniture', 'decorative items', 'seasonal décor'] },
      { id: 'beauty', name: 'Beauty & Fragrance', weight: 0.8, phrases: ['prestige beauty', 'fragrances', 'bath products'] },
    ],
    relatedTerms: ['off-price retail', 'designer discounts', 'home décor', 'brand-name fashion', 'Runway finds'],
    specificTerms: ['TJX returns', 'Marshalls crossover', 'HomeGoods overflow', 'designer closeouts'],
    imageStyle: 'treasure hunt retail environment with clothing racks and home décor displays',
  },
  {
    slug: 'cvs-liquidation',
    displayName: 'CVS',
    pageType: 'retailer',
    keywords: ['cvs liquidation', 'cvs pallets', 'drugstore liquidation', 'health beauty liquidation'],
    angles: [
      { id: 'hba', name: 'Health & Beauty', weight: 0.95, phrases: ['health and beauty', 'personal care', 'skincare', 'haircare'] },
      { id: 'otc', name: 'OTC Medicine', weight: 0.9, phrases: ['over-the-counter', 'vitamins', 'supplements', 'first aid'] },
      { id: 'seasonal', name: 'Seasonal & GM', weight: 0.8, phrases: ['seasonal merchandise', 'holiday items', 'general merchandise'] },
    ],
    relatedTerms: ['HBA', 'health beauty', 'OTC', 'personal care', 'vitamins', 'seasonal', 'pharmacy retail'],
    specificTerms: ['ExtraCare returns', 'pharmacy overstock', 'seasonal reset merchandise', 'planogram clearance'],
    imageStyle: 'drugstore retail environment with health and beauty aisles and pharmacy section',
  },
  {
    slug: 'walgreens-liquidation',
    displayName: 'Walgreens',
    pageType: 'retailer',
    keywords: ['walgreens liquidation', 'walgreens pallets', 'drugstore liquidation'],
    angles: [
      { id: 'hba', name: 'Health & Beauty', weight: 0.95, phrases: ['beauty products', 'personal care', 'skincare', 'cosmetics'] },
      { id: 'health', name: 'Health Products', weight: 0.9, phrases: ['vitamins', 'wellness products', 'first aid', 'health devices'] },
      { id: 'gm', name: 'General Merchandise', weight: 0.8, phrases: ['convenience items', 'snacks', 'household goods', 'seasonal'] },
    ],
    relatedTerms: ['health beauty', 'wellness', 'personal care', 'vitamins', 'pharmacy retail', 'convenience'],
    specificTerms: ['Balance Rewards returns', 'photo services overstock', 'seasonal reset inventory', 'store conversion liquidation'],
    imageStyle: 'drugstore interior with health and beauty products and pharmacy counter',
  },
];

export function getRetailerBySlug(slug: string): PageDefinition | undefined {
  return RETAILERS.find(r => r.slug === slug);
}

export function getAllRetailerSlugs(): string[] {
  return RETAILERS.map(r => r.slug);
}
