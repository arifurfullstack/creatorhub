import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import SettingsClient from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role || "fan";

  // Load creator profile if they are a creator
  const creatorProfile = userRole === "creator"
    ? await prisma.creatorProfile.findUnique({
        where: { userId },
      })
    : null;

  // Load subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
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
    where: { userId },
    include: {
      creatorProfile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          followerCount: true,
          coverImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Load purchase history (billing logs)
  const purchases = await prisma.purchase.findMany({
    where: { userId },
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

  // Serialize properties for Client Components (avoid dynamic Date instance boundaries)
  const serializedUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image || "",
    role: userRole,
  };

  const serializedCreatorProfile = creatorProfile
    ? {
        id: creatorProfile.id,
        username: creatorProfile.username,
        displayName: creatorProfile.displayName,
        bio: creatorProfile.bio || "",
        location: creatorProfile.location || "",
        coverImage: creatorProfile.coverImage || "",
        stripeAccountId: creatorProfile.stripeAccountId || "",
        paypalEmail: creatorProfile.paypalEmail || "",
        wiseEmail: creatorProfile.wiseEmail || "",
        bankDetails: creatorProfile.bankDetails || "",
        socialLinks: creatorProfile.socialLinks || "",
      }
    : null;

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
    creatorProfile: {
      id: f.creatorProfile.id,
      username: f.creatorProfile.username,
      displayName: f.creatorProfile.displayName,
      coverImage: f.creatorProfile.coverImage || "",
      followerCount: f.creatorProfile.followerCount,
    },
  }));

  const serializedPurchases = purchases.map((p) => {
    let itemName = "Premium content unlock";
    let creatorName = "Platform Creator";
    let creatorUsername = "";

    if (p.post) {
      itemName = `Post Unlock: "${p.post.title}"`;
      creatorName = p.post.creatorProfile.displayName;
      creatorUsername = p.post.creatorProfile.username;
    } else if (p.message) {
      itemName = `Message Attachment: "${p.message.content || "Locked Attachment"}"`;
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
      <SettingsClient
        user={serializedUser}
        creatorProfile={serializedCreatorProfile}
        subscriptions={serializedSubscriptions}
        follows={serializedFollows}
        purchases={serializedPurchases}
      />
    </div>
  );
}
