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
