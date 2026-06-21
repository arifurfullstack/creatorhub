import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CreatorDashboardClient from "@/components/dashboard/creator-dashboard-client";

export default async function CreatorDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if ((session.user as any).role !== "creator") {
    redirect("/feed");
  }

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      plans: {
        orderBy: {
          price: "asc",
        },
      },
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      withdrawals: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!creator) {
    redirect("/dashboard/creator/setup");
  }

  // Load active subscriptions for this creator's plans
  const subscriptions = await prisma.subscription.findMany({
    where: {
      plan: {
        creatorProfileId: creator.id,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      plan: {
        select: {
          name: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize Prisma Date fields to strings and load profile extensions
  const serializedCreator = {
    id: creator.id,
    username: creator.username,
    displayName: creator.displayName,
    bio: creator.bio || "",
    location: creator.location || "",
    coverImage: creator.coverImage || "",
    socialLinks: creator.socialLinks || "",
    stripeAccountId: creator.stripeAccountId || "",
    paypalEmail: creator.paypalEmail || "",
    wiseEmail: creator.wiseEmail || "",
    bankDetails: creator.bankDetails || "",
    plans: creator.plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      benefits: p.benefits,
    })),
    posts: creator.posts.map((post) => ({
      id: post.id,
      title: post.title,
      visibility: post.visibility,
      price: post.price,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      createdAt: post.createdAt.toISOString(),
    })),
    withdrawals: creator.withdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      method: w.method,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
    })),
    subscriptions: subscriptions.map((sub) => ({
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
      user: {
        name: sub.user.name,
        email: sub.user.email,
        image: sub.user.image,
      },
      plan: {
        name: sub.plan.name,
        price: sub.plan.price,
      },
    })),
  };

  return <CreatorDashboardClient creator={serializedCreator} />;
}
