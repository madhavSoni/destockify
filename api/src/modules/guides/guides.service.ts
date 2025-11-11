import { Prisma } from '@prisma/client';
import prisma from '../../lib/prismaClient';

const guideInclude = {
  categories: {
    include: {
      category: true,
    },
  },
} satisfies Prisma.GuideInclude;

type GuidePayload = Prisma.GuideGetPayload<{ include: typeof guideInclude }>;

function mapGuide(guide: GuidePayload) {
  return {
    slug: guide.slug,
    title: guide.title,
    intro: guide.intro,
    heroImage: guide.heroImage,
    excerpt: guide.excerpt,
    sections: guide.sections,
    isFeatured: guide.isFeatured,
    publishedAt: guide.publishedAt,
    categories: guide.categories.map((entry: (typeof guide.categories)[number]) => ({
      slug: entry.category.slug,
      name: entry.category.name,
    })),
  };
}

export interface GuideListParams {
  featuredOnly?: boolean;
  limit?: number;
}

export async function listGuides(params: GuideListParams = {}) {
  const where: Prisma.GuideWhereInput = {};

  if (params.featuredOnly) {
    where.isFeatured = true;
  }

  const guides = await prisma.guide.findMany({
    where,
    include: guideInclude,
    orderBy: [
      { isFeatured: 'desc' },
      { publishedAt: 'desc' },
      { title: 'asc' },
    ],
    take: params.limit ?? 10,
  });

  return guides.map(mapGuide);
}

export async function getGuide(slug: string) {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: guideInclude,
  });

  if (!guide) {
    return null;
  }

  return mapGuide(guide);
}

