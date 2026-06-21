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

  // Serialize Prisma Date fields to strings
  const serializedCreator = {
    id: creator.id,
    username: creator.username,
    displayName: creator.displayName,
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
  };

  return <CreatorDashboardClient creator={serializedCreator} />;
}
