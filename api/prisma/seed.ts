import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'General Merchandise Pallets',
    slug: 'general-liquidation',
    headline: 'Mixed retail loads from leading U.S. retailers',
    description:
      'Shelf pulls and customer returns across housewares, small appliances, toys, and seasonal general merchandise.',
    icon: 'boxes-stacked',
  },
  {
    name: 'Electronics & Tech',
    slug: 'electronics-returns',
    headline: 'Manifested loads with smart devices, gaming, and accessories',
    description:
      'Consumer electronics, smart home, and computing loads with detailed manifests and optional warranty add-ons.',
    icon: 'bolt',
  },
  {
    name: 'Apparel & Footwear',
    slug: 'apparel-footwear',
    headline: 'Premium fashion, footwear, and accessories at liquidation pricing',
    description:
      'Closeout case packs and assorted pallets from premium apparel brands, including seasonal overstocks.',
    icon: 'shirt',
  },
  {
    name: 'Home Improvement & Tools',
    slug: 'home-improvement',
    headline: 'Hardware, tools, and DIY inventory for contractors and resellers',
    description:
      'Hardware store returns, power tools, and building materials ideal for independent hardware shops.',
    icon: 'wrench',
  },
  {
    name: 'Health, Beauty & Wellness',
    slug: 'health-beauty',
    headline: 'Cosmetics, skincare, vitamins, and personal care case packs',
    description:
      'Expiration-checked loads from national drug chains and beauty retailers with consistent replenishment.',
    icon: 'sparkles',
  },
  {
    name: 'Furniture & Home Goods',
    slug: 'home-furnishings',
    headline: 'Ready-to-ship furniture, decor, and bedding truckloads',
    description:
      'Manifested loads featuring sofas, dining sets, mattresses, and decor sourced from national retailers.',
    icon: 'couch',
  },
  {
    name: 'Grocery & Convenience',
    slug: 'grocery-cpg',
    headline: 'Dry grocery, beverages, and convenience channel staples',
    description:
      'Turnkey assortments for dollar stores and convenience chains, with expiration visibility and temp controls.',
    icon: 'cart-shopping',
  },
  {
    name: 'Automotive & Powersports',
    slug: 'automotive',
    headline: 'Aftermarket parts, tools, and accessories',
    description:
      'Return-to-vendor and closeout loads of automotive accessories, tools, and seasonal powersports gear.',
    icon: 'truck-monster',
  },
  {
    name: 'Specialty & Boutique Lots',
    slug: 'boutique-lots',
    headline: 'Curated micro-lots for boutique resellers and online shops',
    description:
      'Hand-inspected boxes and micro-lots ideal for personalization boutiques, auctioneers, and live sellers.',
    icon: 'gem',
  },
  {
    name: 'Industrial & B2B',
    slug: 'industrial-b2b',
    headline: 'Industrial supplies, MRO inventory, and surplus equipment',
    description:
      'Mixed pallets of industrial supplies, safety gear, and MRO consumables sourced from national distributors.',
    icon: 'gear',
  },
];

const lotSizes = [
  {
    name: 'Case Packs',
    slug: 'case-pack',
    headline: 'Pre-labeled cartons ready for immediate resale',
    description: 'Ideal for e-commerce sellers and boutiques testing new categories without committing to full pallets.',
    minUnits: 24,
    maxUnits: 200,
  },
  {
    name: 'Gaylord Pallets',
    slug: 'pallet',
    headline: 'Standard gaylords sorted by category and condition',
    description:
      'Most popular format for bin stores and flea market resellers balancing variety with manageable freight costs.',
    minUnits: 200,
    maxUnits: 1200,
  },
  {
    name: 'Half Truckload',
    slug: 'half-truckload',
    headline: '12-14 partials optimized for regional freight lanes',
    description:
      'Consolidated half-loads built to ship quickly on major lanes with verified manifests and shrink-wrapped pallets.',
    minUnits: 6000,
    maxUnits: 14000,
  },
  {
    name: 'Full Truckload',
    slug: 'full-truckload',
    headline: '53’ truckloads with recurring availability and consistent manifests',
    description:
      'Best landed cost per unit for experienced buyers with warehouse space and dock access. Options for drop trailers.',
    minUnits: 14000,
    maxUnits: 28000,
  },
  {
    name: 'Mixed Micro-Lots',
    slug: 'mixed-lots',
    headline: 'Assorted micro-lots curated for online mystery boxes and live sales',
    description:
      'Curated 25-75 unit boxes with photo verification and manifest summary, ideal for social commerce sellers.',
    minUnits: 25,
    maxUnits: 150,
  },
];

const regions = [
  {
    name: 'Florida',
    slug: 'florida',
    headline: 'High-volume liquidation hub with weekly auctions and bonded storage.',
    description:
      'Miami and Orlando lanes service Caribbean exporters, Amazon FBA prep centers, and regional flea market ecosystems.',
    stateCode: 'FL',
    marketStats: {
      averageFreight: '$1.85 / mile',
      topPorts: ['Jacksonville', 'Port Everglades'],
      buyerSegments: ['Exporters', 'Bin Stores', 'Amazon Prep Centers'],
    },
    mapImage: '/maps/florida.svg',
  },
  {
    name: 'Texas',
    slug: 'texas',
    headline: 'Central distribution point connecting west coast returns to southern buyers.',
    description:
      'Dallas-Fort Worth and Houston offer steady inventory from big-box retailers with competitive freight to the southeast.',
    stateCode: 'TX',
    marketStats: {
      averageFreight: '$1.65 / mile',
      topPorts: ['Houston', 'Laredo'],
      buyerSegments: ['Discount Chains', 'Exporters', 'Wholesale Clubs'],
    },
    mapImage: '/maps/texas.svg',
  },
  {
    name: 'Georgia',
    slug: 'georgia',
    headline: 'Fast-turn Atlanta lanes supporting bin stores and apparel resellers.',
    description:
      'Profiled loads from major retailers depart within 24 hours, supported by regional inspection and prep partners.',
    stateCode: 'GA',
    marketStats: {
      averageFreight: '$1.48 / mile',
      topPorts: ['Savannah'],
      buyerSegments: ['Bin Stores', 'Apparel Resellers', 'Auction Houses'],
    },
    mapImage: '/maps/georgia.svg',
  },
  {
    name: 'California',
    slug: 'california',
    headline: 'West coast surplus with direct access to port returns and clean manifests.',
    description:
      'Los Angeles and Stockton yards move apparel and consumer electronics with bilingual support for export buyers.',
    stateCode: 'CA',
    marketStats: {
      averageFreight: '$2.05 / mile',
      topPorts: ['Los Angeles', 'Long Beach'],
      buyerSegments: ['Exporters', 'Amazon Aggregators', 'Wholesale Boutiques'],
    },
    mapImage: '/maps/california.svg',
  },
  {
    name: 'Illinois',
    slug: 'illinois',
    headline: 'Midwest consolidation for national discount chains and pallet programs.',
    description:
      'Chicago yards offer dependable general merchandise pallets with predictable grading and rapid dock scheduling.',
    stateCode: 'IL',
    marketStats: {
      averageFreight: '$1.52 / mile',
      topPorts: ['Chicago Rail'],
      buyerSegments: ['Discount Chains', 'Online Sellers', 'Regional Distributors'],
    },
    mapImage: '/maps/illinois.svg',
  },
  {
    name: 'New Jersey',
    slug: 'new-jersey',
    headline: 'Northeast last-mile hub with quick access to NY & Philly metros.',
    description:
      'Secured warehouses near Port Newark provide consistent HBA, apparel, and electronics with drop trailer options.',
    stateCode: 'NJ',
    marketStats: {
      averageFreight: '$2.12 / mile',
      topPorts: ['Port Newark', 'Elizabeth'],
      buyerSegments: ['Online Boutiques', 'Amazon Sellers', 'Dollar Stores'],
    },
    mapImage: '/maps/new-jersey.svg',
  },
];

type ReviewSeed = {
  title: string;
  author: string;
  company?: string;
  ratingOverall: number;
  ratingAccuracy?: number;
  ratingLogistics?: number;
  ratingValue?: number;
  ratingCommunication?: number;
  highlights: string[];
  body: string;
  publishedAt: Date;
};

type TestimonialSeed = {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  publishedAt: Date;
};

type ResourceSeed = {
  title: string;
  type: string;
  url?: string;
  description?: string;
  order: number;
};

type SupplierSeed = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
  heroImage?: string;
  logoImage?: string;
  homeRank?: number;
  trustScore?: number;
  minimumOrder?: string;
  leadTime?: string;
  region?: string;
  categories: string[];
  lotSizes: string[];
  specialties: string[];
  certifications: string[];
  badges: string[];
  logisticsNotes?: string;
  pricingNotes?: string;
  reviews: ReviewSeed[];
  testimonials: TestimonialSeed[];
  resources: ResourceSeed[];
};

const suppliers: SupplierSeed[] = [
  {
    name: 'B-Stock Supply',
    slug: 'bstock-supply',
    shortDescription: 'Marketplace access to national retailer returns with detailed manifests.',
    description:
      'B-Stock powers private marketplace liquidation programs for the world’s largest retailers and brands. Buyers gain vetted access to mixed-category returns, closeouts, and refurb inventory with manifest visibility and online auction controls.',
    website: 'https://bstock.com/supply',
    phone: '(855) 890-7264',
    email: 'support@bstock.com',
    homeRank: 1,
    trustScore: 92,
    minimumOrder: 'Single pallet auction wins',
    leadTime: 'Ships within 3 business days of payment',
    region: 'california',
    categories: ['general-liquidation', 'electronics-returns', 'apparel-footwear', 'home-improvement'],
    lotSizes: ['pallet', 'half-truckload', 'full-truckload'],
    specialties: ['Manifested auctions', 'Retailer-direct loads', 'Global buyer network'],
    certifications: ['R2 downstream partners', 'Data wipe compliance'],
    badges: ['Verified manifests', 'Digital bidding'],
    logisticsNotes:
      'Loads depart from multiple retailer hubs; buyer selects carrier or utilizes B-Stock recommended partners.',
    pricingNotes:
      'Auction format with dynamic pricing. Winning bids require 10% buyer premium plus transport arranged by buyer.',
    reviews: [
      {
        title: 'Reliable manifests and fast loading',
        author: 'Tanya S.',
        company: 'Bin Pros Atlanta',
        ratingOverall: 4.7,
        ratingAccuracy: 4.8,
        ratingLogistics: 4.6,
        ratingValue: 4.4,
        ratingCommunication: 4.9,
        highlights: ['Loads matched manifests', 'Flexible pickup scheduling'],
        body: 'We’ve scaled our bin stores to three locations sourcing off B-Stock. The manifests are consistently accurate and the hubs release our freight same-day when our carrier checks in.',
        publishedAt: new Date('2025-01-12'),
      },
      {
        title: 'Great for consistent electronics supply',
        author: 'Miguel R.',
        company: 'Rio Grande Wholesale',
        ratingOverall: 4.5,
        ratingAccuracy: 4.4,
        ratingLogistics: 4.3,
        ratingValue: 4.6,
        ratingCommunication: 4.7,
        highlights: ['Multiple auctions weekly', 'Manifest transparency'],
        body: 'As an exporter, we favor west coast electronics loads. Auction pricing is competitive but predictable once you know the lanes. Customer service answers questions within an hour.',
        publishedAt: new Date('2024-11-02'),
      },
    ],
    testimonials: [
      {
        quote: 'Destockify buyers love B-Stock because it gives them brand-direct options with data at every step.',
        author: 'Ashley Chen',
        role: 'Marketplace Success Manager',
        company: 'Destockify',
        publishedAt: new Date('2025-01-05'),
      },
    ],
    resources: [
      {
        title: 'Marketplace Onboarding Checklist',
        type: 'pdf',
        url: 'https://bstock.com/resource/onboarding-checklist.pdf',
        description: 'Step-by-step prep guide to win your first auctions confidently.',
        order: 1,
      },
      {
        title: 'Freight Partner Directory',
        type: 'link',
        url: 'https://bstock.com/freight-partners',
        description: 'Recommended carriers familiar with B-Stock pickup SOPs.',
        order: 2,
      },
    ],
  },
  {
    name: '888 Lots',
    slug: '888-lots',
    shortDescription: 'Fixed-price manifested lots with profit analytics and ready-to-ship cartons.',
    description:
      '888 Lots offers manifest-driven lots for Amazon resellers and online merchants. Every lot includes profit estimations, condition grading, and prep services for FBA-ready shipments.',
    website: 'https://www.888lots.com',
    phone: '(888) 821-6577',
    email: 'sales@888lots.com',
    homeRank: 2,
    trustScore: 94,
    minimumOrder: '$1,200 first purchase',
    leadTime: 'Ships within 48 hours from NJ warehouse',
    region: 'new-jersey',
    categories: ['electronics-returns', 'health-beauty', 'boutique-lots'],
    lotSizes: ['case-pack', 'pallet', 'mixed-lots'],
    specialties: ['Amazon profitability data', 'Lot customization', 'FBA prep services'],
    certifications: ['ISO 9001 warehouse processes'],
    badges: ['Prep center ready', 'Live profit calculator'],
    logisticsNotes:
      'Destockify buyers can opt into pallet consolidation or direct parcel shipping for micro-lots destined for prep centers.',
    pricingNotes:
      'Fixed price lots updated daily. Negotiation available for recurring buyers purchasing 5+ lots per week.',
    reviews: [
      {
        title: 'Love the profit calculator',
        author: 'Nia P.',
        company: 'Prime Revival LLC',
        ratingOverall: 4.9,
        ratingAccuracy: 4.9,
        ratingLogistics: 4.8,
        ratingValue: 4.7,
        ratingCommunication: 5,
        highlights: ['FBA-ready cartons', 'Responsive account manager'],
        body: 'We rely on the net profit calculator before purchasing. Lots arrive sorted and poly-bagged when requested. They handle FBA labels so we can inbound same week.',
        publishedAt: new Date('2025-02-01'),
      },
      {
        title: 'Consistent cosmetic loads',
        author: 'Elena G.',
        company: 'Glow Studio NY',
        ratingOverall: 4.6,
        ratingAccuracy: 4.8,
        ratingLogistics: 4.5,
        ratingValue: 4.4,
        ratingCommunication: 4.6,
        highlights: ['Expiration checks', 'Bundled shipping'],
        body: 'Their HBA lots are clean with expiration dates clearly listed. Having pallet consolidation saves us hundreds per month.',
        publishedAt: new Date('2024-12-15'),
      },
    ],
    testimonials: [
      {
        quote: '888 Lots offers unparalleled transparency for e-commerce resellers wanting manifest visibility and prep.',
        author: 'Jordan Price',
        role: 'Destockify Sourcing Strategist',
        company: 'Destockify',
        publishedAt: new Date('2025-01-18'),
      },
    ],
    resources: [
      {
        title: 'How to Evaluate Profit Scores',
        type: 'guide',
        url: 'https://www.888lots.com/blog/profit-score-guide',
        description: 'Breakdown of the analytics methodology behind each manifested lot.',
        order: 1,
      },
      {
        title: 'Sample Manifest - Premium Cosmetics',
        type: 'sheet',
        url: 'https://www.888lots.com/sample-manifest-cosmetics.xlsx',
        description: 'Representative manifest illustrating grading, MSRP, and FBA fee estimates.',
        order: 2,
      },
    ],
  },
  {
    name: 'Quicklotz',
    slug: 'quicklotz',
    shortDescription: 'Nationwide pallet program with bin-store-friendly surprise mixes.',
    description:
      'Quicklotz curates mystery boxes, pallets, and truckloads tailored for bin stores, discount shops, and online live sellers. Buyers choose from premium, general, and treasure hunt mixes released weekly.',
    website: 'https://quicklotz.com',
    phone: '(864) 469-4500',
    email: 'hello@quicklotz.com',
    homeRank: 3,
    trustScore: 88,
    minimumOrder: '$650 pallet or 10 mystery boxes',
    leadTime: 'Outbound within 72 hours from GA or TX',
    region: 'georgia',
    categories: ['general-liquidation', 'boutique-lots', 'grocery-cpg'],
    lotSizes: ['mixed-lots', 'pallet', 'half-truckload'],
    specialties: ['Mystery pallets', 'Surprise apparel mixes', 'Live-sale ready lots'],
    certifications: [],
    badges: ['Same-day pickup', 'Truckload builder'],
    logisticsNotes:
      'Buyers can pick up at GA or TX warehouses with forklift assistance. Quicklotz can bundle multiple pallets into mixed truckloads.',
    pricingNotes:
      'Fixed pallet pricing with weekly specials. Membership discounts stack for buyers committing to monthly subscription.',
    reviews: [
      {
        title: 'Great treasure hunt pallets',
        author: 'Marcus T.',
        company: 'Treasure 24 Bin Store',
        ratingOverall: 4.3,
        ratingAccuracy: 3.9,
        ratingLogistics: 4.7,
        ratingValue: 4.6,
        ratingCommunication: 4.1,
        highlights: ['Fun product mix', 'Easy warehouse pickup'],
        body: 'The thrill-of-the-hunt pallets keep our customers digging. Freight coordination is simple and they load our trailers fast.',
        publishedAt: new Date('2024-10-06'),
      },
      {
        title: 'Subscription plan keeps inventory flowing',
        author: 'Shelby A.',
        company: 'LiveSell Marketplace',
        ratingOverall: 4.1,
        ratingAccuracy: 3.8,
        ratingLogistics: 4.3,
        ratingValue: 4.4,
        ratingCommunication: 4.0,
        highlights: ['Recurring shipments', 'Live-sale ready assortments'],
        body: 'We lean on their mystery boxes for our daily live sales. Occasionally we get damage, but support credits us quickly.',
        publishedAt: new Date('2024-08-19'),
      },
    ],
    testimonials: [
      {
        quote: 'Quicklotz excels at curated excitement that keeps bin stores and live sellers stocked with fresh finds.',
        author: 'Destiny Howell',
        role: 'Buyer Community Lead',
        company: 'Destockify',
        publishedAt: new Date('2025-01-02'),
      },
    ],
    resources: [
      {
        title: 'Warehouse Pickup Checklist',
        type: 'pdf',
        url: 'https://quicklotz.com/resources/pickup-checklist.pdf',
        description: 'Checklist covering forklift requirements, BOL printing, and appointment scheduling.',
        order: 1,
      },
    ],
  },
  {
    name: 'Via Trading',
    slug: 'via-trading',
    shortDescription: 'Los Angeles liquidation hub with bilingual support and export services.',
    description:
      'Via Trading specializes in apparel, tools, and general merchandise pallets with options for walk-through inspections and export consolidation. Their bilingual sales team supports Latin American buyers and U.S. discount chains alike.',
    website: 'https://www.viatrading.com',
    phone: '(877) 202-3616',
    email: 'sales@viatrading.com',
    homeRank: 4,
    trustScore: 86,
    minimumOrder: '$500 (in-person) / $1,200 (shipped)',
    leadTime: 'Same-day pickup or ship within 48 hours',
    region: 'california',
    categories: ['apparel-footwear', 'home-improvement', 'automotive', 'general-liquidation'],
    lotSizes: ['pallet', 'half-truckload', 'full-truckload'],
    specialties: ['Export consolidation', 'Spanish-language support', 'Inspection program'],
    certifications: ['Customs bonded facility'],
    badges: ['Export friendly', 'On-site inspection'],
    logisticsNotes:
      'Offers on-site loading, cross-docking, and optional drop-trailer for frequent buyers. Export docs prepared in-house.',
    pricingNotes:
      'Pricing tiers based on volume. Drop trailer customers receive volume discounts on consistent weekly pulls.',
    reviews: [
      {
        title: 'Perfect partner for export loads',
        author: 'Luis R.',
        company: 'Panama Liquidators',
        ratingOverall: 4.4,
        ratingAccuracy: 4.2,
        ratingLogistics: 4.6,
        ratingValue: 4.5,
        ratingCommunication: 4.7,
        highlights: ['Spanish-speaking reps', 'Export paperwork help'],
        body: 'We consolidate multi-category loads and they handle paperwork flawlessly. Pallets match the grade advertised.',
        publishedAt: new Date('2024-09-27'),
      },
    ],
    testimonials: [
      {
        quote: 'Via Trading’s walk-and-select program builds trust—buyers see pallets before they close the deal.',
        author: 'Claudia Vega',
        role: 'Senior Market Advisor',
        company: 'Destockify',
        publishedAt: new Date('2025-01-09'),
      },
    ],
    resources: [
      {
        title: 'Destination Export Guide',
        type: 'guide',
        url: 'https://www.viatrading.com/export-guide',
        description: 'Documentation and compliance steps for exporting pallets out of the Port of LA.',
        order: 1,
      },
    ],
  },
  {
    name: 'Direct Liquidation',
    slug: 'direct-liquidation',
    shortDescription: 'Big-box retailer returns with recurring truckload programs nationwide.',
    description:
      'Direct Liquidation manages contract returns for major retailers and manufacturers. Buyers secure recurring truckload programs with graded conditions and optional refurbishment services.',
    website: 'https://www.directliquidation.com',
    phone: '(800) 679-9451',
    email: 'support@directliquidation.com',
    homeRank: 5,
    trustScore: 90,
    minimumOrder: 'Full truckload commitment',
    leadTime: '3-5 business days from contract acceptance',
    region: 'florida',
    categories: ['general-liquidation', 'electronics-returns', 'home-furnishings', 'industrial-b2b'],
    lotSizes: ['half-truckload', 'full-truckload'],
    specialties: ['Contract truckload programs', 'Refurb warranties', 'Retailer-direct relationships'],
    certifications: ['ISO 14001 recycling processes'],
    badges: ['Contract ready', 'Nationwide locations'],
    logisticsNotes:
      'Offers contracted weekly truckloads from Southeast, Midwest, and Pacific Northwest facilities with routed carrier options.',
    pricingNotes:
      'Pricing negotiated per lane and commodity. Volume commitments unlock blended cost-per-unit improvements over time.',
    reviews: [
      {
        title: 'Strong partner for recurring loads',
        author: 'Ethan J.',
        company: 'ValueWave Wholesale',
        ratingOverall: 4.5,
        ratingAccuracy: 4.3,
        ratingLogistics: 4.6,
        ratingValue: 4.4,
        ratingCommunication: 4.5,
        highlights: ['Reliable scheduling', 'Retailer contracts'],
        body: 'We run three weekly trucks of general merchandise. Their grading is consistent and account managers escalate issues quickly.',
        publishedAt: new Date('2025-01-04'),
      },
    ],
    testimonials: [
      {
        quote: 'Ideal for scaled buyers that want predictability and contract-grade inventory without surprises.',
        author: 'Brad Knight',
        role: 'Program Manager',
        company: 'Destockify',
        publishedAt: new Date('2025-01-14'),
      },
    ],
    resources: [
      {
        title: 'Truckload Program Overview',
        type: 'pdf',
        url: 'https://www.directliquidation.com/truckload-program.pdf',
        description: 'Outlines weekly truckload offerings, grading, and freight expectations.',
        order: 1,
      },
    ],
  },
  {
    name: 'Wholesale Ninety',
    slug: 'wholesale-ninety',
    shortDescription: 'Boutique micro-lots curated for social sellers and subscription boxes.',
    description:
      'Wholesale Ninety sources brand-consistent micro-lots of beauty, wellness, and lifestyle goods curated for social commerce. Every box includes storytelling angles, product cards, and suggested resale pricing.',
    website: 'https://wholesaleninety.com',
    phone: '(929) 412-0090',
    email: 'hello@wholesaleninety.com',
    homeRank: 6,
    trustScore: 84,
    minimumOrder: '5 curated boxes ($750)',
    leadTime: 'Ships within 72 hours from NJ studio',
    region: 'new-jersey',
    categories: ['boutique-lots', 'health-beauty', 'grocery-cpg'],
    lotSizes: ['mixed-lots', 'case-pack'],
    specialties: ['Story-driven curation', 'Product photography add-ons', 'Subscription-ready assortments'],
    certifications: ['SQF Level 2 partner warehouse'],
    badges: ['Curated storytelling', 'Subscription-first'],
    logisticsNotes:
      'Includes optional kitting for subscription boxes and drop shipping direct to influencers or sales hosts.',
    pricingNotes:
      'Pricing includes curation fee. Volume subscribers receive seasonal previews and early access to themed drops.',
    reviews: [
      {
        title: 'Curation our customers rave about',
        author: 'Hannah L.',
        company: 'GlowCrate Subscription Box',
        ratingOverall: 4.8,
        ratingAccuracy: 4.7,
        ratingLogistics: 4.9,
        ratingValue: 4.5,
        ratingCommunication: 5.0,
        highlights: ['Story cards included', 'Photo-ready products'],
        body: 'Wholesale Ninety solves the creative heavy lifting for us. We get beautifully curated assortments ready for unboxing videos.',
        publishedAt: new Date('2025-02-05'),
      },
    ],
    testimonials: [
      {
        quote: 'Perfect for social and subscription sellers needing curated narratives with every shipment.',
        author: 'Sydney Park',
        role: 'Head of Community',
        company: 'Destockify',
        publishedAt: new Date('2025-01-07'),
      },
    ],
    resources: [
      {
        title: '2025 Trend Playbook',
        type: 'guide',
        url: 'https://wholesaleninety.com/trend-playbook-2025.pdf',
        description: 'Insights on consumer trends fueling themed micro-lots through Q3.',
        order: 1,
      },
    ],
  },
];

const guides = [
  {
    title: 'How to Vet a Legitimate Liquidation Supplier in 2025',
    slug: 'how-to-vet-liquidation-suppliers-2025',
    intro:
      'Run through this eight-point checklist before wiring funds or booking freight with a new supplier. Protect cash flow while building reliable inventory pipelines.',
    heroImage: '/images/guides/vet-supplier.jpg',
    excerpt: 'Trust indicators, manifest validation, and references to request before you commit.',
    isFeatured: true,
    sections: [
      {
        heading: 'Confirm the chain of custody',
        body: 'Ask how the supplier acquires loads and whether they are retailer-contracted, brokered, or secondary market. Request copies of return-to-vendor agreements or proof of purchase.',
        checklist: [
          'Retailer or manufacturer contract copies',
          'Warehouse address with photos',
          'DOT number for in-house transport',
        ],
      },
      {
        heading: 'Review manifests and grading standards',
        body: 'Legitimate suppliers provide manifests for manifested loads, condition grading for mystery loads, and historical snapshots of recovery rates.',
        checklist: [
          'Manifest samples with UPCs and MSRP',
          'Explanation of condition codes',
          'Dispute policy for misgraded units',
        ],
      },
      {
        heading: 'Verify business credentials and insurance',
        body: 'Request COI listings, resale certificates, and references from active customers. Cross-check with freight partners and Better Business Bureau reports.',
        checklist: [
          'Certificate of insurance (COI)',
          'Business registration and resale cert',
          'Three active buyer references',
        ],
      },
    ],
    categories: ['general-liquidation', 'electronics-returns'],
  },
  {
    title: 'Scaling Truckload Programs Without Burning Cash',
    slug: 'scaling-truckload-programs',
    intro:
      'When you move from pallets to weekly truckloads, cash flow, staffing, and freight discipline determine success. Here’s how our top buyers structure their first contract loads.',
    heroImage: '/images/guides/truckload-scaling.jpg',
    excerpt: 'Practical frameworks for warehouse prep, staffing, and freight modeling as you scale.',
    isFeatured: false,
    sections: [
      {
        heading: 'Model your all-in landed cost',
        body: 'Include bid price, buyer premiums, drayage, fuel, accessorials, and handling labor. Compare against historical sell-through to map acceptable variance.',
        checklist: [
          'Freight lane benchmarking',
          'Dock scheduling procedures',
          'Fuel surcharge triggers',
        ],
      },
      {
        heading: 'Staff the unload, not just the sale',
        body: 'Plan for pallet breakdown, sorting, and quality control staffing per truck. Top operations schedule two unload teams per week per dock door.',
        checklist: [
          'Inbound QC checklist',
          'Staffing roster for peak days',
          'Returns and salvage workflow',
        ],
      },
      {
        heading: 'Negotiate consistent grading and recourse',
        body: 'Contract programs should include dispute windows, credit application timelines, and clearly defined salvage disposal methods.',
        checklist: [
          'Service-level agreement',
          'Credit issuance policy',
          'Salvage handling plan',
        ],
      },
    ],
    categories: ['industrial-b2b', 'home-improvement', 'home-furnishings'],
  },
];

const faqs = [
  {
    question: 'How are Destockify suppliers vetted?',
    answer:
      'Every supplier completes a multi-step verification including proof of retailer contracts or sourcing rights, warehouse walkthrough, insurance and compliance review, plus buyer reference checks.',
    category: 'Getting Started',
    audience: 'buyers',
    order: 1,
  },
  {
    question: 'Can Destockify help me negotiate freight?',
    answer:
      'Yes. Our sourcing advisors maintain a roster of vetted LTL and full truckload carriers familiar with liquidation hubs. Request a freight consult and we will benchmark rates for your lane.',
    category: 'Logistics & Freight',
    audience: 'buyers',
    order: 2,
  },
  {
    question: 'What payment methods do suppliers accept?',
    answer:
      'Most suppliers accept wire transfer and ACH. Several offer credit card or escrow options for first-time buyers. See supplier detail pages for accepted methods and deposit policies.',
    category: 'Payments',
    audience: 'buyers',
    order: 3,
  },
  {
    question: 'Do you support international buyers?',
    answer:
      'Absolutely. Many suppliers offer bilingual account reps, export documentation, and container consolidation. Filter by “Export Friendly” badge to find partners experienced with overseas shipping.',
    category: 'International',
    audience: 'buyers',
    order: 4,
  },
  {
    question: 'How often is supplier data refreshed?',
    answer:
      'Supplier profiles, ratings, and lot availability are refreshed weekly by Destockify analysts. Subscribers receive alerts when new categories or truckload programs become available.',
    category: 'Account & Alerts',
    audience: 'buyers',
    order: 5,
  },
];

type GuideSeed = (typeof guides)[number];

async function main() {
  console.log('🧹 Clearing existing data...');
  await prisma.guideCategory.deleteMany();
  await prisma.supplierCategory.deleteMany();
  await prisma.supplierLotSize.deleteMany();
  await prisma.supplierResource.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.review.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.lotSize.deleteMany();
  await prisma.region.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.faq.deleteMany();

  console.log('👥 Creating verified customers...');
  const customerRecords = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'Tanya',
        lastName: 'Smith',
        email: 'tanya.s@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash1',
        isVerified: true,
        zipCode: '30318',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Miguel',
        lastName: 'Rodriguez',
        email: 'miguel.r@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash2',
        isVerified: true,
        zipCode: '78701',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'James',
        lastName: 'Peterson',
        email: 'james.p@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash3',
        isVerified: true,
        zipCode: '60606',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Linda',
        lastName: 'Martinez',
        email: 'linda.m@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash4',
        isVerified: true,
        zipCode: '90001',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.c@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash5',
        isVerified: true,
        zipCode: '94102',
      },
    }),
  ]);
  const customerIds = customerRecords.map((c) => c.id);

  console.log('🪴 Seeding reference tables...');
  const categoryRecords = await Promise.all(
    categories.map((category) => prisma.category.create({ data: category }))
  );
  const categoryMap = new Map(categoryRecords.map((record) => [record.slug, record]));

  const lotSizeRecords = await Promise.all(lotSizes.map((lot) => prisma.lotSize.create({ data: lot })));
  const lotSizeMap = new Map(lotSizeRecords.map((record) => [record.slug, record]));

  const regionRecords = await Promise.all(regions.map((region) => prisma.region.create({ data: region })));
  const regionMap = new Map(regionRecords.map((record) => [record.slug, record]));

  console.log('🏪 Creating suppliers, reviews, and resources...');
  for (const supplierSeed of suppliers) {
    const reviewAverage =
      supplierSeed.reviews.length > 0
        ? supplierSeed.reviews.reduce((sum, review) => sum + review.ratingOverall, 0) / supplierSeed.reviews.length
        : null;

    const heroImage = supplierSeed.heroImage ?? heroPlaceholder(supplierSeed.name);
    const logoImage = supplierSeed.logoImage ?? logoPlaceholder(supplierSeed.name);

    const regionRecord = supplierSeed.region ? regionMap.get(supplierSeed.region) : undefined;
    if (supplierSeed.region && !regionRecord) {
      throw new Error(`Missing region seed for slug "${supplierSeed.region}"`);
    }

    const supplierRecord = await prisma.supplier.create({
      data: {
        name: supplierSeed.name,
        slug: supplierSeed.slug,
        shortDescription: supplierSeed.shortDescription,
        description: supplierSeed.description,
        website: supplierSeed.website,
        phone: supplierSeed.phone,
        email: supplierSeed.email,
        heroImage,
        logoImage,
        homeRank: supplierSeed.homeRank ?? 0,
        trustScore: supplierSeed.trustScore ?? 0,
        minimumOrder: supplierSeed.minimumOrder,
        leadTime: supplierSeed.leadTime,
        specialties: supplierSeed.specialties,
        certifications: supplierSeed.certifications,
        badges: supplierSeed.badges,
        logisticsNotes: supplierSeed.logisticsNotes,
        pricingNotes: supplierSeed.pricingNotes,
        averageRating: reviewAverage ?? undefined,
        reviewCount: supplierSeed.reviews.length,
        region: regionRecord ? { connect: { id: regionRecord.id } } : undefined,
      },
    });

    if (supplierSeed.categories.length > 0) {
      const categoryData = supplierSeed.categories.map((slug) => {
        const category = categoryMap.get(slug);
        if (!category) {
          throw new Error(`Missing category seed for slug "${slug}"`);
        }
        return {
          supplierId: supplierRecord.id,
          categoryId: category.id,
        };
      });
      await prisma.supplierCategory.createMany({ data: categoryData, skipDuplicates: true });
    }

    if (supplierSeed.lotSizes.length > 0) {
      const lotSizeData = supplierSeed.lotSizes.map((slug) => {
        const lot = lotSizeMap.get(slug);
        if (!lot) {
          throw new Error(`Missing lot size seed for slug "${slug}"`);
        }
        return {
          supplierId: supplierRecord.id,
          lotSizeId: lot.id,
        };
      });
      await prisma.supplierLotSize.createMany({ data: lotSizeData, skipDuplicates: true });
    }

    if (supplierSeed.reviews.length > 0) {
      await prisma.review.createMany({
        data: supplierSeed.reviews.map((review, index) => ({
          supplierId: supplierRecord.id,
          customerId: customerIds[index % customerIds.length], // Rotate through customers
          title: review.title,
          ratingOverall: review.ratingOverall,
          ratingAccuracy: review.ratingAccuracy,
          ratingLogistics: review.ratingLogistics,
          ratingValue: review.ratingValue,
          ratingCommunication: review.ratingCommunication,
          highlights: review.highlights,
          body: review.body,
          images: [], // Empty for now, can add sample images later
          isApproved: true, // Approve seed reviews by default
          createdAt: review.publishedAt,
          approvedAt: review.publishedAt,
        })),
      });
    }

    if (supplierSeed.testimonials.length > 0) {
      await prisma.testimonial.createMany({
        data: supplierSeed.testimonials.map((testimonial) => ({
          supplierId: supplierRecord.id,
          quote: testimonial.quote,
          author: testimonial.author,
          role: testimonial.role,
          company: testimonial.company,
          publishedAt: testimonial.publishedAt,
        })),
      });
    }

    if (supplierSeed.resources.length > 0) {
      await prisma.supplierResource.createMany({
        data: supplierSeed.resources.map((resource) => ({
          supplierId: supplierRecord.id,
          title: resource.title,
          type: resource.type,
          url: resource.url,
          description: resource.description,
          order: resource.order,
        })),
      });
    }
  }

  console.log('📚 Publishing guides and linking categories...');
  for (const guideSeed of guides) {
    const guideRecord = await prisma.guide.create({
        data: {
        title: guideSeed.title,
        slug: guideSeed.slug,
        intro: guideSeed.intro,
        heroImage: guideSeed.heroImage,
        excerpt: guideSeed.excerpt,
        sections: guideSeed.sections,
        isFeatured: guideSeed.isFeatured,
        },
      });

    if (guideSeed.categories?.length) {
      const guideCategoryData = guideSeed.categories.map((slug) => {
        const category = categoryMap.get(slug);
        if (!category) {
          throw new Error(`Missing category mapping for guide slug "${slug}"`);
        }
        return {
          guideId: guideRecord.id,
          categoryId: category.id,
        };
      });
      await prisma.guideCategory.createMany({ data: guideCategoryData, skipDuplicates: true });
    }
  }

  console.log('❓ Loading FAQs...');
  if (faqs.length > 0) {
    await prisma.faq.createMany({ data: faqs });
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function heroPlaceholder(name: string) {
  return `https://via.placeholder.com/1200x800.png?text=${encodeURIComponent(name)}`;
}

function logoPlaceholder(name: string) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return `https://via.placeholder.com/80x80.png?text=${encodeURIComponent(initials || 'LOGO')}`;
}
