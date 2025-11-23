import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Movies
  await prisma.movie.createMany({
    data: [
      { title: 'Blade Runner 2049', overview: 'Neon-noir scifi' },
      { title: 'Heat', overview: 'Crime epic' }
    ],
    skipDuplicates: true
  });

  // Users
  await prisma.user.createMany({
    data: [
      { username: 'Testi-Alpo', email: 'alpo@testi.fi' },
      { username: 'Testi-Teemu', email: 'teemu@testi.fi' }
    ],
    skipDuplicates: true
  });

  const alpo = await prisma.user.findFirst({
    where: { email: 'alpo@testi.fi' },
  });

  const teemu = await prisma.user.findFirst({
    where: { email: 'teemu@testi.fi' },
  });

  if (!alpo || !teemu) throw new Error('Users not found');

  await prisma.group.create({
    data: {
      name: 'Scifi group',
      owner: {
        connect: { id: teemu.id },
      },
      members: {
        connect: [
          { id: alpo.id },
          { id: teemu.id },
        ],
      },
    },
  });

  await prisma.group.create({
    data: {
      name: 'Horror group',
      owner: {
        connect: { id: teemu.id },
      },
      members: {
        connect: [
          { id: alpo.id },
          { id: teemu.id },
        ],
      },
    },
  });

  console.log("Mock data seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
