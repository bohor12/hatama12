
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'seed_admin@example.com',
      password: 'hashed_password_placeholder',
      name: 'Admin User',
      gender: 'M',
      location: 'Ljubljana',
      bio: 'System Admin',
    }
  });
  console.log('Created user:', user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
