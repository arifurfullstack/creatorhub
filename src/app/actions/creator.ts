"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createCreatorProfile(formData: {
  username: string;
  displayName: string;
  bio: string;
  location: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to create a profile");
  }

  // Verify user is a creator
  if ((session.user as any).role !== "creator") {
    throw new Error("Only users with creator role can create a creator profile");
  }

  const usernameClean = formData.username.trim().toLowerCase();

  // Validate username format
  if (!/^[a-zA-Z0-9_-]{3,16}$/.test(usernameClean)) {
    throw new Error("Username must be between 3 and 16 characters and contain only letters, numbers, underscores, or hyphens.");
  }

  // Check if profile already exists for this user
  const existingUser = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existingUser) {
    throw new Error("You already have a creator profile configured");
  }

  // Check if username is taken
  const existingUsername = await prisma.creatorProfile.findUnique({
    where: { username: usernameClean },
  });

  if (existingUsername) {
    throw new Error("This username is already taken");
  }

  // Create the CreatorProfile
  const profile = await prisma.creatorProfile.create({
    data: {
      userId: session.user.id,
      username: usernameClean,
      displayName: formData.displayName.trim() || session.user.name,
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&q=80",
    },
  });

  revalidatePath(`/creator/${usernameClean}`);
  revalidatePath("/");

  return { success: true, username: usernameClean };
}

export async function getCreatorUsername() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { username: true },
  });

  return profile?.username || null;
}

export async function getFeaturedCreatorsList() {
  const creators = await prisma.creatorProfile.findMany({
    take: 4,
    include: {
      user: {
        select: {
          image: true,
        },
      },
      plans: {
        orderBy: {
          price: "asc",
        },
      },
    },
    orderBy: {
      followerCount: "desc",
    },
  });

  return creators.map((creator) => {
    // Helper to format subscribers count
    const formatCount = (count: number) => {
      if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
      }
      return count.toString();
    };

    // Helper to determine category dynamically
    const getCreatorCategory = (username: string, bio: string | null) => {
      const userLower = username.toLowerCase();
      if (userLower.includes("aria") || userLower.includes("art")) return "Digital Art & 3D";
      if (userLower.includes("marcus") || userLower.includes("music") || userLower.includes("beat")) return "Music & Beats";
      if (userLower.includes("elena") || userLower.includes("fit") || userLower.includes("nutrition")) return "Fitness & Nutrition";
      if (userLower.includes("sarah") || userLower.includes("ux") || userLower.includes("design")) return "UI/UX & Product Design";
      
      const bioLower = (bio || "").toLowerCase();
      if (bioLower.includes("art") || bioLower.includes("3d") || bioLower.includes("render")) return "Digital Art & 3D";
      if (bioLower.includes("music") || bioLower.includes("beat") || bioLower.includes("synth")) return "Music & Beats";
      if (bioLower.includes("fitness") || bioLower.includes("workout") || bioLower.includes("nutrition")) return "Fitness & Nutrition";
      if (bioLower.includes("ux") || bioLower.includes("design") || bioLower.includes("product")) return "UI/UX & Product Design";
      
      return "Digital Creator";
    };

    const cheapestPrice = creator.plans.length > 0 ? `$${creator.plans[0].price}` : "$0";

    return {
      id: creator.id,
      name: creator.displayName,
      username: creator.username,
      category: getCreatorCategory(creator.username, creator.bio),
      image: creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      banner: creator.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
      subscribers: formatCount(creator.subscriberCount),
      minPrice: cheapestPrice,
      isVerified: creator.isVerified,
    };
  });
}
