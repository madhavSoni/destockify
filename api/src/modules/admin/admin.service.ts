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
