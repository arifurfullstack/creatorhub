import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import FanDashboardClient from "@/components/dashboard/fan-dashboard-client";

export default async function FanDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Load subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      plan: {
        include: {
          creatorProfile: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Load followed creators
  const follows = await prisma.follow.findMany({
    where: { userId: session.user.id },
    include: {
      creatorProfile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          location: true,
          followerCount: true,
          coverImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Load bookmarks
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        include: {
          creatorProfile: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Load purchase history
  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          creatorProfile: {
            select: {
              displayName: true,
              username: true,
            },
          },
        },
      },
      message: {
        select: {
          id: true,
          content: true,
          sender: {
            select: {
              name: true,
              creatorProfile: {
                select: {
                  displayName: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize models for Client Component
  const serializedUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image || "",
    role: (session.user as any).role || "fan",
  };

  const serializedSubscriptions = subscriptions.map((sub) => ({
    id: sub.id,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart.toISOString(),
    currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    plan: {
      id: sub.plan.id,
      name: sub.plan.name,
      price: sub.plan.price,
      creatorProfile: sub.plan.creatorProfile,
    },
  }));

  const serializedFollows = follows.map((f) => ({
    id: f.id,
    createdAt: f.createdAt.toISOString(),
    creatorProfile: {
      id: f.creatorProfile.id,
      username: f.creatorProfile.username,
      displayName: f.creatorProfile.displayName,
      bio: f.creatorProfile.bio || "",
      location: f.creatorProfile.location || "",
      coverImage: f.creatorProfile.coverImage || "",
      followerCount: f.creatorProfile.followerCount,
    },
  }));

  const serializedBookmarks = bookmarks.map((b) => ({
    id: b.id,
    createdAt: b.createdAt.toISOString(),
    post: {
      id: b.post.id,
      title: b.post.title,
      visibility: b.post.visibility,
      price: b.post.price,
      creatorProfile: b.post.creatorProfile,
    },
  }));

  const serializedPurchases = purchases.map((p) => {
    let itemName = "Gated content unlock";
    let creatorName = "Platform Creator";
    let creatorUsername = "";

    if (p.post) {
      itemName = `Post Unlock: "${p.post.title}"`;
      creatorName = p.post.creatorProfile.displayName;
      creatorUsername = p.post.creatorProfile.username;
    } else if (p.message) {
      itemName = `Paid Message Attachment: "${p.message.content || "Locked Attachment"}"`;
      const senderCreator = p.message.sender.creatorProfile;
      creatorName = senderCreator?.displayName || p.message.sender.name;
      creatorUsername = senderCreator?.username || "";
    }

    return {
      id: p.id,
      amount: p.amount,
      itemName,
      creatorName,
      creatorUsername,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-36">
      <FanDashboardClient
        user={serializedUser}
        subscriptions={serializedSubscriptions}
        follows={serializedFollows}
        bookmarks={serializedBookmarks}
        purchases={serializedPurchases}
      />
    </div>
  );
}
