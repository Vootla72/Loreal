import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const revitalift = await prisma.product.upsert({
    where: { name: 'Revitalift Night Cream' },
    update: {},
    create: { name: 'Revitalift Night Cream', description: 'Anti-aging night cream with retinol', category: 'Anti-aging' },
  });
  const hydra = await prisma.product.upsert({
    where: { name: 'Hydra Genius Serum' },
    update: {},
    create: { name: 'Hydra Genius Serum', description: 'Hydrating face serum with hyaluronic acid', category: 'Hydration' },
  });

  if ((await prisma.claim.count()) === 0) {
    await prisma.claim.createMany({
      data: [
        { productId: revitalift.id, claimText: 'Reduces wrinkles by 20% in 4 weeks', category: 'Anti-aging', status: 'PENDING' },
        {
          productId: hydra.id,
          claimText: 'Provides 72-hour hydration',
          category: 'Hydration',
          status: 'READY_FOR_EVALUATION',
          applicability: true,
          feasibility: true,
          managerComments: 'Strong market fit.',
          scientistTest: 'Corneometer hydration test',
          scientistResult: 'PASS',
          scientistComments: 'Formulation stable; skin moisture elevated at 72h in pilot panel.',
        },
      ],
    });
  }
}

main()
  .then(() => console.log('Seed complete'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
