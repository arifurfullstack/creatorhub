"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createWithdrawalRequest(formData: {
  amount: number;
  method: string;
  details: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to request withdrawals");
  }

  if ((session.user as any).role !== "creator") {
    throw new Error("Only content creators can request withdrawals");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error("Creator profile has not been initialized");
  }

  const amountNum = Number(formData.amount);
  if (amountNum <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  // Get platform settings for minimum withdrawal
  const minSetting = await prisma.systemSetting.findUnique({
    where: { key: "min_withdrawal_amount" },
  });
  const minLimit = minSetting ? Number(minSetting.value) : 50.0;

  if (amountNum < minLimit) {
    throw new Error(`Minimum withdrawal amount is $${minLimit}`);
  }

  // Write withdrawal request
  const request = await prisma.withdrawalRequest.create({
    data: {
      creatorProfileId: profile.id,
      amount: amountNum,
      method: formData.method,
      details: formData.details.trim(),
      status: "pending",
    },
  });

  return { success: true, request };
}
