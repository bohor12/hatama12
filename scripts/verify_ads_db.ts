
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const ads = await prisma.ad.findMany();
    console.log(`Found ${ads.length} ads.`);

    ads.forEach(ad => {
        console.log(`- ${ad.title} [${ad.category}] (Date: ${ad.eventDate})`);
        if (!['GENERAL', 'DATE', 'DINNER', 'MOVIE', 'ACTIVITY', 'TRIP'].includes(ad.category)) {
            throw new Error(`Invalid category found: ${ad.category}`);
        }
    });

    if (ads.length === 0) throw new Error("No ads found!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
