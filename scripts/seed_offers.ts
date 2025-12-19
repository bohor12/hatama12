
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Offers...');

  // Get a user to be the author
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found, cannot seed ads.');
    return;
  }

  const offers = [
    {
      title: "Kino Zmenek - 50% popust",
      content: "Imam dodatno karto za premiero filma v Cineplexxu ta petek. Kdo gre z mano?",
      location: "Ljubljana",
      category: "MOVIE",
      eventDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      userId: user.id
    },
    {
      title: "Pohod na Šmarno Goro",
      content: "Iščem družbo za jutranji pohod na Šmarno goro. Start ob 8:00 iz Tacna.",
      location: "Ljubljana - Tacen",
      category: "ACTIVITY",
      eventDate: new Date(Date.now() + 86400000), // 1 day from now
      userId: user.id
    },
    {
      title: "Romantična večerja",
      content: "Rad bi peljal simpatično punco na večerjo v Restavracijo Cubo. Častim jaz!",
      location: "Ljubljana",
      category: "DINNER",
      userId: user.id
    }
  ];

  for (const offer of offers) {
    await prisma.ad.create({
      data: offer
    });
  }

  console.log('Offers seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
