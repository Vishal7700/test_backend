const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.vehicleType.deleteMany();

  await prisma.vehicleType.createMany({
    data: [
      { name: 'Hatchback', wheels: 4 },
      { name: 'SUV', wheels: 4 },
      { name: 'Sedan', wheels: 4 },
      { name: 'Cruiser', wheels: 2 },
    ],
  });

  const types = await prisma.vehicleType.findMany();

  for (const type of types) {
    await prisma.vehicle.create({
      data: {
        name: `${type.name} Model 1`,
        vehicleTypeId: type.id,
      },
    });
  }

  console.log('✅ Seed completed');
}

main().catch(console.error).finally(() => prisma.$disconnect());
