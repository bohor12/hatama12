import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Niste prijavljeni' }, { status: 401 });
        }
        const userId = currentUser.id;

        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder') || 'PRIMARY'; // Default to PRIMARY

        // Get all messages involving this user, grouped by conversation partner
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                // For PRIMARY, show only PRIMARY folder messages
                // For OTHERS, show only OTHERS folder messages
                ...(folder === 'OTHERS' ? { folder: 'OTHERS', receiverId: userId } : { folder: 'PRIMARY' })
            } as any,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, photos: true, isVerified: true } },
                receiver: { select: { id: true, name: true, photos: true, isVerified: true } }
            }
        });

        // Group by conversation partner
        const conversationMap = new Map<string, any>();

        for (const msg of messages) {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;

            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, {
                    ...partner,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unread: msg.receiverId === userId && !msg.isRead ? 1 : 0
                });
            } else {
                // Increment unread count
                const existing = conversationMap.get(partnerId);
                if (msg.receiverId === userId && !msg.isRead) {
                    existing.unread++;
                }
            }
        }

        const conversations = Array.from(conversationMap.values());

        // Also get count for OTHER folder (for badge)
        let othersCount = 0;
        if (folder === 'PRIMARY') {
            othersCount = await prisma.message.count({
                where: {
                    receiverId: userId,
                    folder: 'OTHERS',
                    isRead: false
                } as any
            });
        }

        return NextResponse.json({
            conversations,
            othersCount,
            folder
        });
    } catch (error) {
        console.error("Conversations Error:", error);
        return NextResponse.json({ error: 'Napaka strežnika' }, { status: 500 });
    }
}
