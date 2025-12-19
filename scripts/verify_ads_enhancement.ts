
import { prisma } from '../lib/prisma.ts';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

async function verifyAdsEnhancement() {
  console.log("Starting verification...");

  // 1. Setup: Create a test user
  const email = `testuser_${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      email,
      password: 'password123',
      name: 'Test User',
      gender: 'F', // Female has no ad limit
    }
  });
  console.log("Created test user:", user.id);

  // Generate token manually
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  // 2. Test POST /api/ads (via direct prisma call to simulate, as we can't easily mock NextRequest here with cookies in a script without full fetch setup)
  // Actually, we can use fetch if the server is running, but let's test the logic by interacting with DB and verifying the schema works as expected.
  // The goal is to verify the SCHEMA and DATA persistence.

  // Let's rely on Prisma to verify the fields exist and are writable.
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 7); // 1 week from now

  const ad = await prisma.ad.create({
    data: {
        userId: user.id,
        title: "Dinner Date",
        content: "Looking for someone to eat pizza with",
        location: "Ljubljana",
        category: "DINNER",
        eventDate: eventDate
    }
  });

  console.log("Created Ad with new fields:", ad);

  if (ad.category !== "DINNER") throw new Error("Category mismatch");
  if (!ad.eventDate) throw new Error("EventDate missing");

  // 3. Test Filtering Logic (Simulate what GET /api/ads does)
  const dinnerAds = await prisma.ad.findMany({
      where: { isActive: true, category: "DINNER" }
  });
  console.log(`Found ${dinnerAds.length} DINNER ads`);

  if (dinnerAds.length < 1) throw new Error("Filtering failed - expected at least 1 dinner ad");

  const movieAds = await prisma.ad.findMany({
    where: { isActive: true, category: "MOVIE" }
  });
  console.log(`Found ${movieAds.length} MOVIE ads`);
  if (movieAds.length > 0) {
      // unless there were existing movie ads.
      // let's assume clean slate or just check our specific ad isn't there
      const ourAdInMovies = movieAds.find(a => a.id === ad.id);
      if (ourAdInMovies) throw new Error("Filtering failed - DINNER ad found in MOVIE category");
  }

  // Cleanup
  await prisma.ad.delete({ where: { id: ad.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Cleanup done. Verification successful.");
}

verifyAdsEnhancement()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
