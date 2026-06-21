import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import NotificationsClient from "@/components/shared/notifications-client";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch user's notifications sorted by newest
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize models (Dates to Strings) to satisfy Next.js page prop boundaries
  const serializedNotifications = notifications.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    content: n.content,
    link: n.link || null,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-32 pb-16 flex-1 flex flex-col">
      <NotificationsClient initialNotifications={serializedNotifications} />
    </div>
  );
}
