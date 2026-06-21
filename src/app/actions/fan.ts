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

export async function cancelFanSubscription(subscriptionId: string) {
  const session = await verifySession();

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.userId !== session.user.id) {
    throw new Error("You are not authorized to cancel this subscription");
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: true,
    },
    include: {
      plan: {
        select: {
          creatorProfileId: true,
        },
      },
    },
  });

  // Decrement creator subscriber count if active
  if (subscription.status === "active") {
    await prisma.creatorProfile.update({
      where: { id: updatedSubscription.plan.creatorProfileId },
      data: {
        subscriberCount: {
          decrement: 1,
        },
      },
    });
  }

  revalidatePath("/dashboard/fan");
  revalidatePath("/feed");
  return { success: true, subscription: updatedSubscription };
}

export async function unfollowCreator(creatorProfileId: string) {
  const session = await verifySession();

  const follow = await prisma.follow.findUnique({
    where: {
      userId_creatorProfileId: {
        userId: session.user.id,
        creatorProfileId,
      },
    },
  });

  if (!follow) {
    throw new Error("You are not following this creator");
  }

  await prisma.follow.delete({
    where: {
      id: follow.id,
    },
  });

  // Decrement follower count
  const updatedCreator = await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: {
      followerCount: {
        decrement: 1,
      },
    },
  });

  revalidatePath("/dashboard/fan");
  revalidatePath(`/creator/${updatedCreator.username}`);
  revalidatePath("/feed");
  return { success: true };
}

export async function removeBookmark(postId: string) {
  const session = await verifySession();

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId,
      },
    },
  });

  if (!bookmark) {
    throw new Error("Bookmark not found");
  }

  await prisma.bookmark.delete({
    where: {
      id: bookmark.id,
    },
  });

  revalidatePath("/dashboard/fan");
  revalidatePath("/feed");
  return { success: true };
}

export async function updateFanProfile(formData: {
  name: string;
  image?: string;
}) {
  const session = await verifySession();

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: formData.name.trim() || session.user.name,
      image: formData.image?.trim() || null,
    },
    include: {
      creatorProfile: {
        select: {
          username: true,
        },
      },
    },
  });

  revalidatePath("/dashboard/fan");
  revalidatePath("/");
  if (updatedUser.creatorProfile) {
    revalidatePath(`/creator/${updatedUser.creatorProfile.username}`);
  }
  return { success: true, user: updatedUser };
}
