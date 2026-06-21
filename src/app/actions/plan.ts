"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPlan(formData: {
  name: string;
  price: number;
  description: string;
  benefits: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to configure packages");
  }

  if ((session.user as any).role !== "creator") {
    throw new Error("Only content creators can create subscription plans");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Creator profile has not been initialized");
  }

  const plan = await prisma.membershipPlan.create({
    data: {
      creatorProfileId: profile.id,
      name: formData.name.trim(),
      price: Number(formData.price),
      description: formData.description.trim(),
      benefits: formData.benefits.filter((b) => b.trim() !== ""),
    },
  });

  revalidatePath(`/creator/${profile.username}`);

  return { success: true, plan };
}
