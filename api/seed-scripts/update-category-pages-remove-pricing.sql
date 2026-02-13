-- Update Category Pages: Remove Pricing Indicators, Keep Directory Focus
-- This script updates category pages to remove specific dollar amounts while
-- maintaining rich merchandise descriptions focused on supplier discovery

-- Walmart Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Source Walmart liquidation truckloads and pallets from verified suppliers on FindLiquidation. Our directory features contract holders selling Walmart GM (general merchandise), .COM returns, Turbo loads, electronics, appliances, sporting goods, and Mediums — shipped direct from Walmart distribution centers in Indiana, South Carolina, Georgia, Ohio, and Florida. Standard Walmart truckloads carry 24-26 pallets at 5-7 feet tall. Compare suppliers, read verified buyer reviews, and find local pickup or direct-ship options for bin stores, discount retailers, pallet flippers, Whatnot sellers, and ecommerce resellers.',
  "featuredSuppliersText" = 'Find vetted Walmart liquidation suppliers near you offering GM truckloads, .COM return pallets, Turbo loads, electronics, appliances, and sporting goods. Compare local pickup and direct-ship options for pallets and full 24-pallet truckloads from Walmart distribution centers nationwide.',
  "centeredValueText" = 'Walmart generates one of the largest liquidation pipelines in the country — store returns, .COM returns, overstock, shelf pulls, and seasonal closeouts flow out of distribution centers in Indiana, South Carolina, Georgia, Ohio, and Florida every week. The challenge for resellers is cutting through brokers to find suppliers who pull direct from Walmart DCs. FindLiquidation connects you with verified Walmart liquidation suppliers offering transparent load breakdowns, manifested or unmanifested options, and reliable shipping across the US.'
WHERE "slug" = 'walmart-liquidation';

-- Amazon Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find verified Amazon liquidation suppliers offering Amazon Mediums, Smalls, HD loads, LPN returns, manifested pallets and high piece count truckloads. Our directory connects you with trusted Amazon return pallet sellers, wholesale liquidation companies, bin store inventory sources and truckload suppliers. Standard Amazon truckloads carry 24-26 pallets with mixed returns, overstock, and customer-returned merchandise across all categories.',
  "featuredSuppliersText" = 'Browse top-rated Amazon liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find Mediums, Smalls, HD loads, LPN returns, and high piece count options near you.',
  "centeredValueText" = 'Amazon liquidation inventory flows constantly from fulfillment centers nationwide — customer returns, overstock, warehouse deals, and seasonal items. FindLiquidation helps you discover verified Amazon liquidation suppliers with transparent manifests, consistent load quality, and direct-from-FC sourcing for resellers, bin stores, and online sellers.'
WHERE "slug" = 'amazon-liquidation';

-- Target Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Access top Target liquidation suppliers offering manifested returns pallets, general merchandise truckloads, home goods, apparel and wholesale overstock. Standard Target truckloads carry 24-26 pallets with mixed department store merchandise including home decor, electronics, toys, and seasonal items.',
  "featuredSuppliersText" = 'Browse top-rated Target liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory near you. Find manifested and unmanifested options for GM, home goods, and apparel.',
  "centeredValueText" = 'Target liquidation includes store returns, online returns, overstock, and seasonal closeouts from distribution centers across the country. FindLiquidation connects you with verified Target liquidation suppliers offering consistent quality, transparent load contents, and flexible shipping options for resellers and bin stores.'
WHERE "slug" = 'target-liquidation';

-- Costco Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Browse verified Costco liquidation suppliers with access to bulk returns, appliances, electronics, furniture and manifested Costco pallets. Costco liquidation features larger-format items including major appliances, furniture, outdoor equipment, and club-pack merchandise.',
  "featuredSuppliersText" = 'Browse top-rated Costco liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find bulk merchandise, appliances, and club-size items near you.',
  "centeredValueText" = 'Costco liquidation inventory includes member returns, display units, damaged packaging, and seasonal overstock. FindLiquidation helps you discover verified Costco liquidation suppliers offering large-format merchandise, major appliances, and bulk goods ideal for resellers with warehouse space.'
WHERE "slug" = 'costco-liquidation';

-- Sam's Club Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find reputable Sam''s Club liquidation suppliers offering general merchandise returns, clothing pallets, electronics and wholesale truckload deals. Sam''s Club liquidation includes club-pack merchandise, bulk items, and member returns across all categories.',
  "featuredSuppliersText" = 'Browse top-rated Sam''s Club liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find bulk merchandise and club-size items near you.',
  "centeredValueText" = 'Sam''s Club liquidation provides access to bulk merchandise, member returns, and overstock from warehouse club locations. FindLiquidation connects you with verified Sam''s Club suppliers offering consistent loads of club-pack goods for resellers and discount stores.'
WHERE "slug" = 'sams-club-liquidation';

-- Home Depot Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Connect with verified Home Depot liquidation suppliers offering tools, hardware, DIY items, lighting, faucets, home improvement returns and manifested pallets. Home Depot truckloads feature power tools, lawn equipment, plumbing, electrical, and building materials.',
  "featuredSuppliersText" = 'Browse top-rated Home Depot liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find tools, hardware, and home improvement items near you.',
  "centeredValueText" = 'Home Depot liquidation includes contractor returns, seasonal overstock, display units, and damaged packaging from stores and distribution centers. FindLiquidation helps you discover verified Home Depot suppliers with professional-grade tools, lawn care equipment, and DIY merchandise.'
WHERE "slug" = 'home-depot-liquidation';

-- Lowe's Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find trusted Lowe''s liquidation companies offering tools, garden products, hardware, plumbing, home improvement returns and mixed pallets. Lowe''s truckloads include power tools, outdoor equipment, appliances, and building materials.',
  "featuredSuppliersText" = 'Browse top-rated Lowe''s liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find tools, garden, and home improvement items near you.',
  "centeredValueText" = 'Lowe''s liquidation features contractor-grade tools, seasonal garden merchandise, appliances, and DIY supplies. FindLiquidation connects you with verified Lowe''s liquidation suppliers for hardware stores, contractors, and resellers.'
WHERE "slug" = 'lowes-liquidation';

-- Best Buy Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find verified Best Buy liquidation suppliers with electronics pallets, appliances, manifested returns, gaming products and wholesale tech truckloads. Best Buy liquidation includes TVs, laptops, phones, tablets, smart home devices, and open-box items.',
  "featuredSuppliersText" = 'Browse top-rated Best Buy liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find consumer electronics, appliances, and gaming near you.',
  "centeredValueText" = 'Best Buy liquidation features customer returns, open-box items, display units, and seasonal tech merchandise. FindLiquidation helps you discover verified Best Buy suppliers with tested electronics, gaming gear, and smart home devices for tech resellers and repair shops.'
WHERE "slug" = 'best-buy-liquidation';

-- General Merchandise Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find general merchandise liquidation pallets and truckloads from verified wholesale suppliers. Source mixed GM returns, shelf pulls, overstock and bin-store friendly inventory across categories like home goods, toys, electronics and apparel. Standard GM truckloads carry 24-26 pallets with high piece counts.',
  "featuredSuppliersText" = 'Browse top-rated general merchandise liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find mixed loads and category-specific pallets near you.',
  "centeredValueText" = 'General merchandise liquidation provides diverse inventory across multiple categories — ideal for bin stores, flea markets, and multi-category resellers. FindLiquidation connects you with verified GM suppliers offering consistent loads, transparent manifests, and flexible order sizes.'
WHERE "slug" = 'general-merchandise-liquidation';

-- Electronics Pallets
UPDATE "CategoryPage" SET
  "heroText" = 'Shop electronics pallets and liquidation truckloads with returns, shelf pulls and overstock from major retailers. Find verified suppliers offering TVs, laptops, audio, gaming, smart home devices and more. Electronics loads range from untested customer returns to fully functional open-box items.',
  "featuredSuppliersText" = 'Browse top-rated electronics liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find consumer electronics, computers, and gaming near you.',
  "centeredValueText" = 'Electronics liquidation includes customer returns, open-box units, refurbished items, and overstock from major retailers. FindLiquidation helps you discover verified electronics suppliers with tested inventory, manifest details, and consistent load quality for tech resellers.'
WHERE "slug" = 'electronics-pallets';

-- Tools Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Source tools liquidation pallets and truckloads packed with power tools, hand tools, compressors, outdoor equipment and hardware. Find verified wholesale suppliers of contractor-grade returns, shelf pulls and overstock. Tool pallets typically include name brands like DeWalt, Milwaukee, Ryobi, and Craftsman.',
  "featuredSuppliersText" = 'Browse top-rated tools liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find power tools, hand tools, and outdoor equipment near you.',
  "centeredValueText" = 'Tools liquidation features contractor returns, store overstock, and damaged packaging from home improvement retailers. FindLiquidation connects you with verified tool suppliers offering professional-grade equipment for hardware stores, contractors, and tool resellers.'
WHERE "slug" = 'tools-liquidation';

-- Furniture Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Buy furniture liquidation pallets and truckloads with living room, bedroom, dining, office and outdoor furniture from top retailers. Find verified wholesale liquidators offering returns, overstock and scratch-and-dent furniture loads. Furniture loads may include assembled and unassembled items.',
  "featuredSuppliersText" = 'Browse top-rated furniture liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find home and office furniture near you.',
  "centeredValueText" = 'Furniture liquidation includes store returns, damaged packaging, display units, and seasonal overstock. FindLiquidation helps you discover verified furniture suppliers with clear condition descriptions and shipping options for furniture resellers and discount stores.'
WHERE "slug" = 'furniture-liquidation';

-- Apparel Wholesale
UPDATE "CategoryPage" SET
  "heroText" = 'Source apparel wholesale and clothing liquidation pallets and truckloads from leading retailers and brands. Find verified suppliers offering mixed clothing, fashion returns, shelf pulls and overstock loads. Apparel pallets typically contain hundreds of pieces across men''s, women''s, and children''s categories.',
  "featuredSuppliersText" = 'Browse top-rated apparel wholesale suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find clothing, fashion, and accessories near you.',
  "centeredValueText" = 'Apparel liquidation features department store returns, brand overstock, and seasonal closeouts. FindLiquidation connects you with verified clothing suppliers offering manifested loads, brand-name merchandise, and high piece counts for boutiques and bin stores.'
WHERE "slug" = 'apparel-wholesale';

-- Shoes Wholesale
UPDATE "CategoryPage" SET
  "heroText" = 'Shop shoes wholesale pallets and footwear liquidation truckloads including sneakers, dress shoes, boots and kids'' footwear. Find trusted suppliers of returns, shelf pulls and overstock footwear loads. Shoe pallets typically contain pairs across all sizes and styles.',
  "featuredSuppliersText" = 'Browse top-rated footwear wholesale suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find sneakers, boots, and dress shoes near you.',
  "centeredValueText" = 'Footwear liquidation includes department store returns, brand overstock, and seasonal closeouts. FindLiquidation helps you discover verified shoe suppliers with manifested inventory, name brands, and consistent quality for shoe resellers and consignment stores.'
WHERE "slug" = 'shoes-wholesale';

-- Beauty Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find beauty and cosmetics liquidation pallets and truckloads with makeup, skincare, haircare, fragrance and personal care products. Compare verified suppliers of health and beauty returns, shelf pulls and overstock. Beauty loads typically feature high piece counts of branded products.',
  "featuredSuppliersText" = 'Browse top-rated beauty liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find cosmetics, skincare, and fragrance near you.',
  "centeredValueText" = 'Beauty liquidation features drugstore returns, department store overstock, and brand closeouts. FindLiquidation connects you with verified beauty suppliers offering authentic products, sealed inventory, and high piece counts for beauty resellers and discount stores.'
WHERE "slug" = 'beauty-liquidation';

-- Toys Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Source toys liquidation pallets and truckloads including branded toys, games, puzzles and seasonal items. Find trusted wholesale suppliers of toy returns, shelf pulls and overstock. Toy pallets are especially valuable around holiday seasons with major retailer overstock.',
  "featuredSuppliersText" = 'Browse top-rated toys liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find games, puzzles, and branded toys near you.',
  "centeredValueText" = 'Toys liquidation includes holiday overstock, returns, and closeouts from major retailers. FindLiquidation helps you discover verified toy suppliers with brand-name merchandise, seasonal inventory, and consistent quality for toy resellers and bin stores.'
WHERE "slug" = 'toys-liquidation';

-- Sporting Goods Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Buy sporting goods liquidation pallets and truckloads with fitness gear, outdoor equipment, apparel, footwear and accessories. Connect with verified suppliers of returns and overstock sporting goods. Loads typically include gym equipment, camping gear, and athletic apparel.',
  "featuredSuppliersText" = 'Browse top-rated sporting goods liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find fitness, outdoor, and athletic gear near you.',
  "centeredValueText" = 'Sporting goods liquidation features returns from major sporting goods retailers, seasonal overstock, and brand closeouts. FindLiquidation connects you with verified suppliers offering athletic apparel, fitness equipment, and outdoor gear for sports resellers.'
WHERE "slug" = 'sporting-goods-liquidation';

-- Baby Products Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find baby products liquidation pallets and truckloads including strollers, car seats, gear, toys, clothing and accessories. Browse verified suppliers offering baby returns, shelf pulls and overstock. Baby merchandise requires careful sourcing due to safety considerations.',
  "featuredSuppliersText" = 'Browse top-rated baby products liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find gear, toys, and essentials near you.',
  "centeredValueText" = 'Baby products liquidation includes store returns, overstock, and seasonal items. FindLiquidation helps you discover verified baby product suppliers with brand-name merchandise and clear condition descriptions for baby store owners and resellers.'
WHERE "slug" = 'baby-products-liquidation';

-- Automotive Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Source automotive liquidation pallets and truckloads with car accessories, tools, parts, detailing products and more. Compare trusted wholesale suppliers of automotive returns, shelf pulls and overstock loads. Auto pallets feature name-brand parts and accessories.',
  "featuredSuppliersText" = 'Browse top-rated automotive liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find parts, accessories, and tools near you.',
  "centeredValueText" = 'Automotive liquidation includes returns from auto parts stores, online retailers, and wholesale overstock. FindLiquidation connects you with verified auto suppliers offering quality parts and accessories for auto shops, resellers, and flea market vendors.'
WHERE "slug" = 'automotive-liquidation';

-- Housewares Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Shop housewares liquidation pallets and truckloads including kitchenware, small appliances, decor, storage and home essentials. Find verified suppliers offering returns and overstock housewares loads. Housewares pallets feature high piece counts of home goods.',
  "featuredSuppliersText" = 'Browse top-rated housewares liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find kitchen, home decor, and small appliances near you.',
  "centeredValueText" = 'Housewares liquidation includes department store returns, wedding registry overstock, and seasonal closeouts. FindLiquidation helps you discover verified housewares suppliers with diverse home goods for discount stores, flea markets, and bin stores.'
WHERE "slug" = 'housewares-liquidation';

-- Health & Wellness Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find health and wellness liquidation pallets and truckloads with vitamins, supplements, fitness accessories, personal care and health products. Connect with trusted suppliers of returns, shelf pulls and overstock. Health products require proper sourcing to ensure quality.',
  "featuredSuppliersText" = 'Browse top-rated health and wellness liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find vitamins, personal care, and fitness near you.',
  "centeredValueText" = 'Health and wellness liquidation includes drugstore overstock, supplement closeouts, and fitness accessory returns. FindLiquidation connects you with verified health product suppliers offering authentic products for health food stores and resellers.'
WHERE "slug" = 'health-wellness-liquidation';

-- Grocery Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find grocery liquidation pallets and truckloads with dry foods, beverages, snacks, canned goods and closeouts from major grocery chains. Browse verified suppliers offering dated and short-dated food liquidation, overstock and wholesale pallets. Food liquidation requires attention to dates and storage.',
  "featuredSuppliersText" = 'Browse top-rated grocery liquidation suppliers offering wholesale pallets, truckloads, closeouts, and overstock inventory. Find food, beverages, and grocery items near you.',
  "centeredValueText" = 'Grocery liquidation includes closeout merchandise, short-dated products, and packaging changes from major food brands. FindLiquidation helps you discover verified grocery suppliers with proper handling, clear date information, and consistent quality for grocery discount stores.'
WHERE "slug" = 'grocery-liquidation';

-- Bin Store Inventory
UPDATE "CategoryPage" SET
  "heroText" = 'Find high piece count pallets, Amazon Smalls/Mediums, GM returns and bin-store-ready inventory from verified suppliers. Bin store pallets are optimized for high volume with diverse merchandise at accessible piece counts.',
  "featuredSuppliersText" = 'Browse top-rated bin store inventory suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find high piece count loads and bin-ready merchandise near you.',
  "centeredValueText" = 'Bin store inventory requires high piece counts, diverse merchandise, and accessible starting goods. FindLiquidation connects you with verified suppliers offering bin-optimized loads, Amazon Smalls/Mediums, and mixed GM pallets for bin store operators.'
WHERE "slug" = 'bin-store-inventory';

-- Whatnot Inventory
UPDATE "CategoryPage" SET
  "heroText" = 'Find wholesale liquidation inventory for Whatnot sellers including electronics, GM, toys, apparel and smalls. Connect with verified pallet and truckload suppliers offering fast-moving merchandise ideal for live selling.',
  "featuredSuppliersText" = 'Browse top-rated Whatnot inventory suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find live-selling-ready merchandise near you.',
  "centeredValueText" = 'Whatnot sellers need visually appealing, fast-moving merchandise with good variety. FindLiquidation helps you discover verified suppliers offering manifested loads, collectibles, and diverse inventory optimized for live selling audiences.'
WHERE "slug" = 'whatnot-inventory';

-- eBay Reseller Inventory
UPDATE "CategoryPage" SET
  "heroText" = 'Discover wholesale pallets ideal for eBay sellers including electronics, tools, fashion and GM returns. Verified suppliers with consistent reseller-friendly loads featuring identifiable, listable merchandise.',
  "featuredSuppliersText" = 'Browse top-rated eBay reseller inventory suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find listable merchandise near you.',
  "centeredValueText" = 'eBay resellers need identifiable products with good sell-through rates. FindLiquidation connects you with verified suppliers offering manifested loads, brand-name merchandise, and consistent quality for profitable eBay sourcing.'
WHERE "slug" = 'ebay-reseller-inventory';

-- Amazon FBA Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Buy Amazon FBA-friendly liquidation pallets including smalls, mediums, electronics and GM. Verified suppliers offering inventory ideal for FBA and FBM sellers with proper sizing and gating considerations.',
  "featuredSuppliersText" = 'Browse top-rated Amazon FBA liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find FBA-ready merchandise near you.',
  "centeredValueText" = 'Amazon FBA sellers need inventory that meets size requirements and category restrictions. FindLiquidation helps you discover verified suppliers offering FBA-optimized loads, ungated categories, and proper documentation for profitable Amazon selling.'
WHERE "slug" = 'amazon-fba-liquidation';

-- Discount Store Inventory
UPDATE "CategoryPage" SET
  "heroText" = 'Find wholesale liquidation pallets for discount stores, dollar stores and surplus shops. Verified suppliers offering GM, housewares, beauty and food pallets with consistent quality.',
  "featuredSuppliersText" = 'Browse top-rated discount store inventory suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find store-ready merchandise near you.',
  "centeredValueText" = 'Discount stores need reliable, diverse inventory at accessible costs. FindLiquidation connects you with verified suppliers offering mixed loads, category-specific pallets, and consistent quality for profitable discount retail operations.'
WHERE "slug" = 'discount-store-inventory';

-- Flea Market Pallets
UPDATE "CategoryPage" SET
  "heroText" = 'Source GM, tools, toys, clothing and mixed pallets for flea market vendors. Verified liquidation suppliers offering affordable resale inventory with good variety and visual appeal.',
  "featuredSuppliersText" = 'Browse top-rated flea market pallet suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find vendor-ready merchandise near you.',
  "centeredValueText" = 'Flea market vendors need diverse, visually appealing merchandise that sells quickly. FindLiquidation helps you discover verified suppliers offering mixed loads, small lot options, and vendor-friendly inventory.'
WHERE "slug" = 'flea-market-pallets';

-- Grocery Store Inventory
UPDATE "CategoryPage" SET
  "heroText" = 'Source food liquidation pallets including dry goods, beverages, snacks and grocery GM. Verified suppliers with short-dated and overstock loads for grocery and discount food stores.',
  "featuredSuppliersText" = 'Browse top-rated grocery store inventory suppliers offering wholesale pallets, truckloads, closeouts, and overstock inventory. Find food and grocery items near you.',
  "centeredValueText" = 'Grocery store operators need reliable food inventory with proper handling and dating. FindLiquidation connects you with verified food suppliers offering consistent quality, clear documentation, and proper cold chain when needed.'
WHERE "slug" = 'grocery-store-liquidation-inventory';

-- Returns Pallets
UPDATE "CategoryPage" SET
  "heroText" = 'Find returns pallets from major retailers including Amazon, Walmart, Target and more. Verified suppliers offering shelf pulls, customer returns and manifested loads with transparent condition information.',
  "featuredSuppliersText" = 'Browse top-rated returns pallet suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find manifested and unmanifested loads near you.',
  "centeredValueText" = 'Returns pallets vary widely in condition and value. FindLiquidation helps you discover verified suppliers with transparent manifests, clear condition descriptions, and consistent quality for return pallet buyers.'
WHERE "slug" = 'returns-pallets';

-- Overstock Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Source overstock pallets and truckloads from major retailers. Find trusted suppliers offering excess inventory, closeouts, seasonals and GM overstock loads. Overstock typically features new, unopened merchandise.',
  "featuredSuppliersText" = 'Browse top-rated overstock liquidation suppliers offering wholesale pallets, truckloads, closeouts, and excess inventory. Find new overstock near you.',
  "centeredValueText" = 'Overstock liquidation features new merchandise from excess production, seasonal closeouts, and retail overbuys. FindLiquidation connects you with verified overstock suppliers offering pristine inventory at wholesale values.'
WHERE "slug" = 'overstock-liquidation';

-- Wholesale Pallets
UPDATE "CategoryPage" SET
  "heroText" = 'Buy wholesale pallets and truckloads from verified liquidation suppliers. Source GM, electronics, apparel, tools, beauty and more from trusted wholesalers across the country.',
  "featuredSuppliersText" = 'Browse top-rated wholesale pallet suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find bulk liquidation near you.',
  "centeredValueText" = 'Wholesale pallets provide diverse inventory for all types of resellers. FindLiquidation connects you with verified wholesale suppliers offering consistent loads, transparent sourcing, and reliable shipping nationwide.'
WHERE "slug" = 'wholesale-pallets';

-- Macy's Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find top Macy''s liquidation suppliers offering apparel, designer fashion, shoes, home goods, cosmetics and manifested return pallets. Macy''s liquidation features department store quality merchandise across fashion and home categories.',
  "featuredSuppliersText" = 'Browse top-rated Macy''s liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find fashion, home goods, and cosmetics near you.',
  "centeredValueText" = 'Macy''s liquidation includes department store returns, seasonal markdowns, and brand overstock. FindLiquidation helps you discover verified Macy''s suppliers with designer fashion, quality home goods, and beauty products for upscale resellers.'
WHERE "slug" = 'macys-liquidation';

-- Kohl's Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Discover verified Kohl''s liquidation suppliers offering apparel, footwear, home goods, beauty products and GM returns truckloads. Kohl''s liquidation features family-friendly merchandise across clothing and home categories.',
  "featuredSuppliersText" = 'Browse top-rated Kohl''s liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find clothing, home goods, and beauty near you.',
  "centeredValueText" = 'Kohl''s liquidation includes store returns, seasonal clearance, and brand overstock. FindLiquidation connects you with verified Kohl''s suppliers offering family apparel, home decor, and name-brand merchandise for discount retailers.'
WHERE "slug" = 'kohls-liquidation';

-- JCPenney Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Browse JCPenney liquidation suppliers with apparel, footwear, home goods, bedding and manifested returns pallets. JCPenney liquidation offers department store merchandise at wholesale values.',
  "featuredSuppliersText" = 'Browse top-rated JCPenney liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find clothing, bedding, and home goods near you.',
  "centeredValueText" = 'JCPenney liquidation features department store returns, home goods closeouts, and apparel overstock. FindLiquidation helps you discover verified JCPenney suppliers with family merchandise and home essentials for discount stores.'
WHERE "slug" = 'jcpenney-liquidation';

-- Nordstrom Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find premium Nordstrom liquidation suppliers offering designer clothing, beauty, shoes, handbags and high-end return pallets. Nordstrom liquidation features upscale merchandise from one of America''s premier department stores.',
  "featuredSuppliersText" = 'Browse top-rated Nordstrom liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find designer fashion and premium goods near you.',
  "centeredValueText" = 'Nordstrom liquidation includes designer returns, premium beauty products, and high-end accessories. FindLiquidation connects you with verified Nordstrom suppliers offering luxury merchandise for upscale boutiques and consignment stores.'
WHERE "slug" = 'nordstrom-liquidation';

-- TJ Maxx Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Discover verified TJ Maxx liquidation suppliers offering apparel, footwear, home decor, beauty and assorted return pallets. TJ Maxx liquidation features off-price merchandise already at wholesale values.',
  "featuredSuppliersText" = 'Browse top-rated TJ Maxx liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find apparel, home decor, and beauty near you.',
  "centeredValueText" = 'TJ Maxx liquidation includes store returns, seasonal items, and assorted merchandise. FindLiquidation helps you discover verified TJ Maxx suppliers with diverse fashion, home goods, and accessories for resellers.'
WHERE "slug" = 'tjmaxx-liquidation';

-- CVS Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Find verified CVS liquidation suppliers offering beauty, cosmetics, OTC medicine, household goods, seasonal merchandise and general merchandise return pallets. CVS liquidation features drugstore inventory across health and beauty categories.',
  "featuredSuppliersText" = 'Browse top-rated CVS liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find health, beauty, and household goods near you.',
  "centeredValueText" = 'CVS liquidation includes drugstore returns, seasonal overstock, and health product closeouts. FindLiquidation connects you with verified CVS suppliers offering authentic health and beauty products for discount stores and resellers.'
WHERE "slug" = 'cvs-liquidation';

-- Walgreens Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Browse Walgreens liquidation suppliers offering beauty products, health items, OTC, general merchandise and mixed return pallets. Walgreens liquidation provides drugstore inventory ideal for health and beauty resellers.',
  "featuredSuppliersText" = 'Browse top-rated Walgreens liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find health, beauty, and GM near you.',
  "centeredValueText" = 'Walgreens liquidation features drugstore returns, seasonal merchandise, and health product closeouts. FindLiquidation helps you discover verified Walgreens suppliers with authentic products for discount stores and health product resellers.'
WHERE "slug" = 'walgreens-liquidation';

-- Ace Hardware Liquidation
UPDATE "CategoryPage" SET
  "heroText" = 'Browse Ace Hardware liquidation suppliers offering tools, lawn and garden, outdoor gear, hardware and seasonal returns pallets. Ace Hardware liquidation features home improvement and outdoor merchandise.',
  "featuredSuppliersText" = 'Browse top-rated Ace Hardware liquidation suppliers offering wholesale pallets, truckloads, returns, and overstock inventory. Find tools, garden, and hardware near you.',
  "centeredValueText" = 'Ace Hardware liquidation includes store returns, seasonal overstock, and hardware closeouts. FindLiquidation connects you with verified Ace Hardware suppliers offering quality tools and outdoor merchandise for hardware resellers.'
WHERE "slug" = 'ace-hardware-liquidation';
