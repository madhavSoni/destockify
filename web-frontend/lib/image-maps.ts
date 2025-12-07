export const getBrandLogo = (slug: string) => {
    const logoMap: Record<string, string> = {
        // Retailers
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

    // Try exact match first
    if (logoMap[slug]) return logoMap[slug];

    // Partial match - check if slug contains key
    const foundKey = Object.keys(logoMap).find(key => slug.includes(key));
    if (foundKey) return logoMap[foundKey];

    return null;
};

export const getCategoryIcon = (slug: string) => {
    const iconMap: Record<string, string> = {
        // Categories & Inventory Types
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
        // Fallbacks based on typical inventory types if specific icon missing
        'health': '/images/categories/beauty.png',
        'shoes': '/images/categories/clothing.png',
        'sporting-goods': '/images/categories/general-merchandise.png',
        'toys': '/images/categories/general-merchandise.png',
        'automotive': '/images/categories/tools.png',
        'housewares': '/images/categories/furniture.png',
    };

    if (iconMap[slug]) return iconMap[slug];

    const foundKey = Object.keys(iconMap).find(key => slug.includes(key));
    if (foundKey) return iconMap[foundKey];

    return null;
};
