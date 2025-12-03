import prisma from '../../lib/prismaClient';
import { uploadBuffer, generatePath } from '../../lib/gcsService';
import crypto from 'crypto';
import path from 'path';

export async function getDashboardStats() {
  const [
    totalSuppliers,
    totalReviews,
    pendingReviews,
    recentSuppliers,
    recentReviews,
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  return {
    stats: {
      totalSuppliers,
      totalReviews,
      pendingReviews,
    },
    recentActivity: {
      suppliers: recentSuppliers.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        createdAt: s.createdAt.toISOString(),
      })),
      reviews: recentReviews.map((r) => ({
        id: r.id,
        rating: r.ratingOverall,
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
        supplier: {
          id: r.supplier.id,
          name: r.supplier.name,
          slug: r.supplier.slug,
        },
        reviewer: `${r.customer.firstName} ${r.customer.lastName}`,
      })),
    },
  };
}

export async function uploadImage(base64Data: string, filename?: string, mimeType?: string): Promise<string> {
  if (!base64Data) {
    throw new Error('No image data provided');
  }

  // Parse base64 data (can be data URL or raw base64)
  let buffer: Buffer;
  let contentType: string = mimeType || 'image/png';
  
  if (base64Data.startsWith('data:')) {
    // Handle data URL format: data:image/png;base64,...
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid data URL format');
    }
    contentType = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // Handle raw base64 string
    buffer = Buffer.from(base64Data, 'base64');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(contentType)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (buffer.length > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Generate unique filename
  let ext = path.extname(filename || '');
  if (!ext) {
    // Determine extension from content type
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    ext = extMap[contentType] || '.png';
  }
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const finalFilename = `${uniqueId}${ext}`;
  const gcsPath = generatePath(['admin', 'uploads'], finalFilename);

  // Upload to GCS using existing uploadBuffer function
  const publicUrl = await uploadBuffer(buffer, gcsPath, {
    metadata: {
      contentType,
    },
  });

  return publicUrl;
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// CategoryPage CRUD operations
export async function listCategoryPages(params?: { limit?: number; offset?: number }) {
  const limit = params?.limit || 100;
  const offset = params?.offset || 0;

  const [pages, total] = await Promise.all([
    prisma.categoryPage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.categoryPage.count(),
  ]);

  return {
    items: pages,
    total,
    limit,
    offset,
  };
}

export async function getCategoryPage(id: number) {
  const page = await prisma.categoryPage.findUnique({
    where: { id },
  });

  if (!page) {
    throw new Error('Category page not found');
  }

  return page;
}

export async function createCategoryPage(data: {
  pageTitle: string;
  metaTitle: string;
  metaDescription: string;
  slug?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  enableFaqSchema?: boolean;
  enableBreadcrumbSchema?: boolean;
  customSchema?: any;
  heroImage?: string;
  heroImageAlt?: string;
  heroH1?: string;
  heroText?: string;
  featuredSuppliersH2?: string;
  featuredSuppliersText?: string;
  supplierSourceType?: string;
  supplierIds?: number[];
  centeredValueH2?: string;
  centeredValueText?: string;
  contentBlocks?: any;
  faqSectionH2?: string;
  faqs?: any;
  internalLinks?: any;
  customHtml?: string;
  lastUpdated?: Date;
  authorOverride?: string;
  topicCategory?: string;
  enableDivider?: boolean;
}) {
  const slug = data.slug || generateSlug(data.pageTitle);

  // Check if slug already exists
  const existing = await prisma.categoryPage.findUnique({ where: { slug } });
  if (existing) {
    throw new Error('A category page with this slug already exists');
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  const page = await prisma.categoryPage.create({
    data: {
      pageTitle: data.pageTitle.trim(),
      metaTitle: data.metaTitle.trim(),
      metaDescription: data.metaDescription.trim(),
      slug,
      canonicalUrl: data.canonicalUrl?.trim() || null,
      ogTitle: data.ogTitle?.trim() || null,
      ogDescription: data.ogDescription?.trim() || null,
      ogImage: data.ogImage?.trim() || null,
      noindex: data.noindex ?? false,
      nofollow: data.nofollow ?? false,
      enableFaqSchema: data.enableFaqSchema ?? true,
      enableBreadcrumbSchema: data.enableBreadcrumbSchema ?? true,
      customSchema: data.customSchema || null,
      heroImage: data.heroImage?.trim() || null,
      heroImageAlt: data.heroImageAlt?.trim() || null,
      heroH1: data.heroH1?.trim() || null,
      heroText: data.heroText?.trim() || null,
      featuredSuppliersH2: data.featuredSuppliersH2?.trim() || null,
      featuredSuppliersText: data.featuredSuppliersText?.trim() || null,
      supplierSourceType: data.supplierSourceType || 'manual',
      supplierIds: data.supplierIds || [],
      centeredValueH2: data.centeredValueH2?.trim() || null,
      centeredValueText: data.centeredValueText?.trim() || null,
      contentBlocks: data.contentBlocks || [],
      faqSectionH2: data.faqSectionH2?.trim() || null,
      faqs: data.faqs || [],
      internalLinks: data.internalLinks || null,
      customHtml: data.customHtml?.trim() || null,
      lastUpdated: data.lastUpdated || null,
      authorOverride: data.authorOverride?.trim() || null,
      topicCategory: data.topicCategory?.trim() || null,
      enableDivider: data.enableDivider ?? false,
    },
  });

  return page;
}

export async function updateCategoryPage(
  id: number,
  data: {
    pageTitle?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noindex?: boolean;
    nofollow?: boolean;
    enableFaqSchema?: boolean;
    enableBreadcrumbSchema?: boolean;
    customSchema?: any;
    heroImage?: string;
    heroImageAlt?: string;
    heroH1?: string;
    heroText?: string;
    featuredSuppliersH2?: string;
    featuredSuppliersText?: string;
    supplierSourceType?: string;
    supplierIds?: number[];
    centeredValueH2?: string;
    centeredValueText?: string;
    contentBlocks?: any;
    faqSectionH2?: string;
    faqs?: any;
    internalLinks?: any;
    customHtml?: string;
    lastUpdated?: Date;
    authorOverride?: string;
    topicCategory?: string;
    enableDivider?: boolean;
  }
) {
  const existing = await prisma.categoryPage.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Category page not found');
  }

  // Determine slug: use provided slug, or generate from pageTitle, or keep existing
  let slug = existing.slug;
  if (data.slug) {
    slug = data.slug;
  } else if (data.pageTitle) {
    slug = generateSlug(data.pageTitle);
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  // Check if new slug conflicts with another page
  if (slug !== existing.slug) {
    const slugConflict = await prisma.categoryPage.findUnique({ where: { slug } });
    if (slugConflict) {
      throw new Error('A category page with this slug already exists');
    }
  }

  const page = await prisma.categoryPage.update({
    where: { id },
    data: {
      ...(data.pageTitle !== undefined && { pageTitle: data.pageTitle.trim() }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle.trim() }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription.trim() }),
      ...(slug !== existing.slug && { slug }),
      ...(data.canonicalUrl !== undefined && { canonicalUrl: data.canonicalUrl?.trim() || null }),
      ...(data.ogTitle !== undefined && { ogTitle: data.ogTitle?.trim() || null }),
      ...(data.ogDescription !== undefined && { ogDescription: data.ogDescription?.trim() || null }),
      ...(data.ogImage !== undefined && { ogImage: data.ogImage?.trim() || null }),
      ...(data.noindex !== undefined && { noindex: data.noindex }),
      ...(data.nofollow !== undefined && { nofollow: data.nofollow }),
      ...(data.enableFaqSchema !== undefined && { enableFaqSchema: data.enableFaqSchema }),
      ...(data.enableBreadcrumbSchema !== undefined && { enableBreadcrumbSchema: data.enableBreadcrumbSchema }),
      ...(data.customSchema !== undefined && { customSchema: data.customSchema }),
      ...(data.heroImage !== undefined && { heroImage: data.heroImage?.trim() || null }),
      ...(data.heroImageAlt !== undefined && { heroImageAlt: data.heroImageAlt?.trim() || null }),
      ...(data.heroH1 !== undefined && { heroH1: data.heroH1?.trim() || null }),
      ...(data.heroText !== undefined && { heroText: data.heroText?.trim() || null }),
      ...(data.featuredSuppliersH2 !== undefined && { featuredSuppliersH2: data.featuredSuppliersH2?.trim() || null }),
      ...(data.featuredSuppliersText !== undefined && { featuredSuppliersText: data.featuredSuppliersText?.trim() || null }),
      ...(data.supplierSourceType !== undefined && { supplierSourceType: data.supplierSourceType }),
      ...(data.supplierIds !== undefined && { supplierIds: data.supplierIds }),
      ...(data.centeredValueH2 !== undefined && { centeredValueH2: data.centeredValueH2?.trim() || null }),
      ...(data.centeredValueText !== undefined && { centeredValueText: data.centeredValueText?.trim() || null }),
      ...(data.contentBlocks !== undefined && { contentBlocks: data.contentBlocks }),
      ...(data.faqSectionH2 !== undefined && { faqSectionH2: data.faqSectionH2?.trim() || null }),
      ...(data.faqs !== undefined && { faqs: data.faqs }),
      ...(data.internalLinks !== undefined && { internalLinks: data.internalLinks }),
      ...(data.customHtml !== undefined && { customHtml: data.customHtml?.trim() || null }),
      ...(data.lastUpdated !== undefined && { lastUpdated: data.lastUpdated }),
      ...(data.authorOverride !== undefined && { authorOverride: data.authorOverride?.trim() || null }),
      ...(data.topicCategory !== undefined && { topicCategory: data.topicCategory?.trim() || null }),
      ...(data.enableDivider !== undefined && { enableDivider: data.enableDivider }),
    },
  });

  return page;
}

export async function deleteCategoryPage(id: number) {
  const existing = await prisma.categoryPage.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Category page not found');
  }

  await prisma.categoryPage.delete({ where: { id } });
  return { message: 'Category page deleted successfully' };
}
