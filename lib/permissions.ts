import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return null;

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    return null;
  }
}

export async function canUserMessage(senderId: string, receiverId: string): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Fetch sender's attributes
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!sender) {
    return { allowed: false, reason: "Pošiljatelj ne obstaja." }; // Sender does not exist
  }

  // 2. Fetch receiver's filters
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    include: { filter: true },
  });

  if (!receiver) {
    return { allowed: false, reason: "Prejemnik ne obstaja." }; // Receiver does not exist
  }

  // 3. CRITICAL: Check Interest Approval (The "Women Control" Logic)
  // Check if there is an APPROVED interest between these two.
  // We need to check both directions because approval creates a connection.
  // Actually, usually interest is Sender -> Receiver. 
  // If Man sends Interest to Woman, she Approves. Then Man can message.
  
  // Find interest where (sender=Sender AND receiver=Receiver) OR (sender=Receiver AND receiver=Sender)
  // AND status is APPROVED.
  const connection = await prisma.interest.findFirst({
      where: {
          OR: [
              { senderId: senderId, receiverId: receiverId },
              { senderId: receiverId, receiverId: senderId }
          ],
          status: 'APPROVED'
      }
  });

  if (!connection) {
      return { allowed: false, reason: "Oseba vas mora najprej odobriti (Zanimaš me -> Odobritev)." };
  }

  const filter = receiver.filter;

  if (!filter) {
    // No filters set, message allowed
    return { allowed: true };
  }

  // 4. Check Attribute Filters (Double security, usually filtered at browse time)
  
  // Height check
  if (filter.minHeight && (!sender.height || sender.height < filter.minHeight)) {
    return { allowed: false, reason: "Ne ustrezate kriterijem višine." };
  }

  // Smoker check
  if (filter.mustNotSmoke && sender.isSmoker) {
    return { allowed: false, reason: "Uporabnica ne želi sporočil od kadilcev." };
  }

  // Age check
  if (filter.minAge || filter.maxAge) {
    if (!sender.birthDate) {
        // Fail-closed: If user has age requirement, sender MUST have birthdate set.
        return { allowed: false, reason: "Za pošiljanje sporočila morate v profilu nastaviti datum rojstva." };
    }

    const ageDiffMs = Date.now() - sender.birthDate.getTime();
    const ageDate = new Date(ageDiffMs); // miliseconds from epoch
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (filter.minAge && age < filter.minAge) {
       return { allowed: false, reason: "Ste premladi za to osebo." };
    }
    if (filter.maxAge && age > filter.maxAge) {
       return { allowed: false, reason: "Ste prestari za to osebo." };
    }
  }

  return { allowed: true };
}