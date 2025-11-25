import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSuppliers() {
  const total = await prisma.supplier.count();
  const withHomeRank = await prisma.supplier.count({ where: { homeRank: { gt: 0 } } });
  const withImages = await prisma.supplier.count({ 
    where: { 
      OR: [
        { heroImage: { not: null } },
        { logoImage: { not: null } }
      ]
    } 
  });
  
  console.log(`Total suppliers: ${total}`);
  console.log(`Suppliers with homeRank > 0: ${withHomeRank}`);
  console.log(`Suppliers with images: ${withImages}`);
  
  if (total > 0) {
    const sample = await prisma.supplier.findFirst({
      select: {
        id: true,
        name: true,
        homeRank: true,
        heroImage: true,
        logoImage: true,
        isVerified: true,
      }
    });
    console.log('\nSample supplier:', JSON.stringify(sample, null, 2));
  }
  
  await prisma.$disconnect();
}

checkSuppliers().catch(console.error);
