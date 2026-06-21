"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifySession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to perform this action");
  }

  return session;
}

export async function getNotifications() {
  const session = await verifySession();

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}

export async function getUnreadNotificationsCount() {
  const session = await verifySession();

  const count = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
    },
  });

  return count;
}

export async function markNotificationAsRead(id: string) {
  const session = await verifySession();

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== session.user.id) {
    throw new Error("You are not authorized to edit this notification");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true, notification: updated };
}

export async function markAllNotificationsAsRead() {
  const session = await verifySession();

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function clearAllNotifications() {
  const session = await verifySession();

  await prisma.notification.deleteMany({
    where: {
      userId: session.user.id,
    },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { success: true };
}
