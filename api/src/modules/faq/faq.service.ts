import prisma from '../../lib/prismaClient';

export async function listFaq(audience?: string) {
  const faqs = await prisma.faq.findMany({
    where: audience
      ? {
          OR: [{ audience }, { audience: null }],
        }
      : undefined,
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  return faqs.map((faq: (typeof faqs)[number]) => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    audience: faq.audience,
    order: faq.order,
  }));
}

