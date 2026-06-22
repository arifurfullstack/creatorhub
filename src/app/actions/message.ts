"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Find all messages sent or received by this user
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: { id: true, name: true, image: true, role: true },
      },
      receiver: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
  });

  // Group by participant
  const participantsMap = new Map<string, any>();

  for (const msg of messages) {
    const participant = msg.senderId === session.user.id ? msg.receiver : msg.sender;
    if (!participantsMap.has(participant.id)) {
      participantsMap.set(participant.id, {
        id: participant.id,
        name: participant.name,
        image: participant.image,
        role: participant.role,
        lastMessage: msg.content || `[${msg.type} file]`,
        lastMessageAt: msg.createdAt.toISOString(),
        unread: !msg.isRead && msg.receiverId === session.user.id,
      });
    }
  }

  return Array.from(participantsMap.values());
}

export async function getMessages(otherUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark other user's messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: session.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return messages.map(msg => ({
    id: msg.id,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    content: msg.content,
    type: msg.type,
    mediaUrl: msg.mediaUrl,
    lockPrice: msg.lockPrice,
    isUnlocked: msg.isUnlocked,
    isRead: msg.isRead,
    createdAt: msg.createdAt.toISOString(),
  }));
}

export async function sendMessage(formData: {
  receiverId: string;
  content: string;
  type?: string;
  mediaUrl?: string;
  lockPrice?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const lockPriceVal = Number(formData.lockPrice || 0);

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId: formData.receiverId,
      content: formData.content.trim(),
      type: formData.type || "text",
      mediaUrl: formData.mediaUrl,
      lockPrice: lockPriceVal,
      isUnlocked: lockPriceVal === 0, // Unlocked by default if price is 0
    },
  });

  return {
    success: true,
    message: {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      type: message.type,
      mediaUrl: message.mediaUrl,
      lockPrice: message.lockPrice,
      isUnlocked: message.isUnlocked,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    },
  };
}

export async function unlockMessage(messageId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  // Create mock purchase record
  await prisma.purchase.create({
    data: {
      userId: session.user.id,
      messageId: message.id,
      amount: message.lockPrice,
    },
  });

  // Mark message as unlocked
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { isUnlocked: true },
  });

  return {
    success: true,
    messageId: updatedMessage.id,
  };
}

export async function getUnreadMessagesCount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return 0;
  }

  const count = await prisma.message.count({
    where: {
      receiverId: session.user.id,
      isRead: false,
    },
  });

  return count;
}

export async function markMessagesAsRead(senderId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false };
  }

  await prisma.message.updateMany({
    where: {
      senderId: senderId,
      receiverId: session.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}
