import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Gender-specific placeholders based on user request (anonymous/no face)
// Using text-based placeholders for now as a robust solution.
// In a real scenario, these could be local assets like /uploads/male_placeholder.jpg
const MALE_PHOTO = JSON.stringify(['https://placehold.co/600x800/202020/FFFFFF/png?text=Moski']);
const FEMALE_PHOTO = JSON.stringify(['https://placehold.co/600x800/ffb6c1/FFFFFF/png?text=Zenska']);

const maleNames = [
  'Luka', 'Nik', 'Filip', 'Mark', 'Jan',
  'Jaka', 'Žan', 'Matej', 'Tomaž', 'Anže'
];

const femaleNames = [
  'Ana', 'Eva', 'Sara', 'Nika', 'Lara',
  'Maja', 'Nina', 'Kaja', 'Teja', 'Petra'
];

const cities = [
  'Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje',
  'Koper', 'Novo Mesto', 'Ptuj', 'Trbovlje', 'Kamnik'
];

const personalTraitsList = [
  'Iskren', 'Zabaven', 'Spontan', 'Resen', 'Ambiciozen',
  'Športen', 'Umetniški', 'Družaben', 'Miren', 'Optimističen'
];

const partnerTraitsList = [
  'Iskrenost', 'Humor', 'Inteligenca', 'Zvestoba', 'Prijaznost',
  'Energija', 'Razumevanje', 'Podpora', 'Strast', 'Zanesljivost'
];

const interestsList = [
  'Šport', 'Glasba', 'Potovanja', 'Kuhanje', 'Filmi',
  'Narava', 'Fotografija', 'Ples', 'Knjige', 'Tehnologija'
];

function getRandomItems(arr: string[], count: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('Start seeding ...');

  // Clear existing users? Maybe strictly for test.
  // await prisma.user.deleteMany();
  // Better not to delete existing data unless asked, to prevent data loss on dev envs.
  // But for a seed script, usually it's additive or idempotent.
  // We will just add new ones.

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create 10 Men
  for (const name of maleNames) {
    const email = `${name.toLowerCase()}${getRandomInt(100, 999)}@example.com`;
    // Check if exists to avoid unique constraint error
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) continue;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender: 'M',
        birthDate: new Date(getRandomInt(1980, 2000), getRandomInt(0, 11), getRandomInt(1, 28)),
        height: getRandomInt(170, 200),
        location: cities[getRandomInt(0, cities.length - 1)],
        bio: `Pozdravljeni, sem ${name}. Iščem resno zvezo ali prijateljstvo.`,
        photos: MALE_PHOTO,
        lookingFor: Math.random() > 0.5 ? 'Resna zveza' : 'Prijateljstvo',
        interests: JSON.stringify(getRandomItems(interestsList, 3)),
        personalTraits: JSON.stringify(getRandomItems(personalTraitsList, 3)),
        partnerTraits: JSON.stringify(getRandomItems(partnerTraitsList, 3)),
        isSmoker: Math.random() > 0.8,
        voiceCallAllowed: Math.random() > 0.5,
      },
    });
    console.log(`Created user with id: ${user.id} (${user.name})`);
  }

  // Create 10 Women
  for (const name of femaleNames) {
    const email = `${name.toLowerCase()}${getRandomInt(100, 999)}@example.com`;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) continue;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender: 'F',
        birthDate: new Date(getRandomInt(1985, 2002), getRandomInt(0, 11), getRandomInt(1, 28)),
        height: getRandomInt(160, 180),
        location: cities[getRandomInt(0, cities.length - 1)],
        bio: `Hej, sem ${name}. Rada imam ${getRandomItems(interestsList, 1)[0].toLowerCase()}.`,
        photos: FEMALE_PHOTO,
        lookingFor: Math.random() > 0.5 ? 'Resna zveza' : 'Prijateljstvo',
        interests: JSON.stringify(getRandomItems(interestsList, 3)),
        personalTraits: JSON.stringify(getRandomItems(personalTraitsList, 3)),
        partnerTraits: JSON.stringify(getRandomItems(partnerTraitsList, 3)),
        isSmoker: Math.random() > 0.9,
        voiceCallAllowed: Math.random() > 0.5,
      },
    });
    console.log(`Created user with id: ${user.id} (${user.name})`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
