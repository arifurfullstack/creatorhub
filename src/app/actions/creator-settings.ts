"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifyCreatorSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to update settings");
  }

  if ((session.user as any).role !== "creator") {
    throw new Error("Only creators can manage creator settings");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Creator profile not found. Please complete profile setup first.");
  }

  return { session, profile };
}

export async function updateCreatorProfileSettings(formData: {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  coverImage?: string;
  socialLinks?: string;
}) {
  const { profile } = await verifyCreatorSession();

  const newUsername = formData.username.trim().toLowerCase();

  // Validate username format
  if (!/^[a-zA-Z0-9_-]{3,16}$/.test(newUsername)) {
    throw new Error("Username must be between 3 and 16 characters and contain only letters, numbers, underscores, or hyphens.");
  }

  // Check if username is already taken by another creator
  if (newUsername !== profile.username) {
    const existing = await prisma.creatorProfile.findUnique({
      where: { username: newUsername },
    });
    if (existing) {
      throw new Error("Username is already taken");
    }
  }

  // Update profile
  const updatedProfile = await prisma.creatorProfile.update({
    where: { id: profile.id },
    data: {
      displayName: formData.displayName.trim() || profile.displayName,
      username: newUsername,
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      coverImage: formData.coverImage?.trim() || profile.coverImage,
      socialLinks: formData.socialLinks !== undefined ? formData.socialLinks : profile.socialLinks,
    },
  });

  revalidatePath(`/creator/${updatedProfile.username}`);
  revalidatePath(`/creator/${profile.username}`);
  revalidatePath("/dashboard/creator");
  revalidatePath("/");

  return { success: true, profile: updatedProfile };
}

export async function updatePaymentSettings(formData: {
  stripeAccountId?: string;
  paypalEmail?: string;
  wiseEmail?: string;
  bankDetails?: string;
}) {
  const { profile } = await verifyCreatorSession();

  const updatedProfile = await prisma.creatorProfile.update({
    where: { id: profile.id },
    data: {
      stripeAccountId: formData.stripeAccountId?.trim() || null,
      paypalEmail: formData.paypalEmail?.trim() || null,
      wiseEmail: formData.wiseEmail?.trim() || null,
      bankDetails: formData.bankDetails?.trim() || null,
    },
  });

  revalidatePath("/dashboard/creator");
  return { success: true, profile: updatedProfile };
}
