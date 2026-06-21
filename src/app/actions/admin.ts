"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to verify admin role on the server
async function checkAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to access this page");
  }

  if ((session.user as any).role !== "admin") {
    throw new Error("Access denied. Admins only.");
  }

  return session;
}

export async function getAdminOverview() {
  await checkAdminSession();

  // Query platform statistics
  const totalUsers = await prisma.user.count();
  const totalCreators = await prisma.creatorProfile.count();
  
  const activeSubsCount = await prisma.subscription.count({
    where: { status: "active" },
  });

  // Calculate platform revenue (sum of platform commission cut)
  const transactions = await prisma.transaction.findMany({
    where: { status: "success" },
    select: { commissionAmount: true },
  });
  const platformRevenue = transactions.reduce((acc, t) => acc + t.commissionAmount, 0);

  // Retrieve pending verification requests
  // For simulation, any CreatorProfile with isVerified = false is a pending request
  const pendingVerifications = await prisma.creatorProfile.findMany({
    where: { isVerified: false },
    include: {
      user: {
        select: { email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Retrieve pending withdrawal requests
  const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
    where: { status: "pending" },
    include: {
      creatorProfile: {
        select: { id: true, username: true, displayName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Retrieve platform users list
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Retrieve settings
  const settings = await prisma.systemSetting.findMany();

  return {
    totalUsers,
    totalCreators,
    activeSubsCount,
    platformRevenue,
    pendingVerifications,
    pendingWithdrawals,
    users,
    settings,
  };
}

export async function updatePlatformSetting(key: string, value: string) {
  await checkAdminSession();

  const setting = await prisma.systemSetting.update({
    where: { key },
    data: { value },
  });

  revalidatePath("/dashboard/admin");
  return { success: true, setting };
}

export async function changeUserRole(userId: string, newRole: string) {
  await checkAdminSession();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // If changing role to creator and creator profile doesn't exist, we let them create it.
  // In a real app we might do additional steps.

  // Log action
  await prisma.auditLog.create({
    data: {
      userId: userId,
      action: "change_user_role",
      details: `Role updated to ${newRole}`,
    },
  });

  revalidatePath("/dashboard/admin");
  return { success: true, user };
}

export async function toggleUserStatus(userId: string, ban: boolean) {
  await checkAdminSession();

  // For simulation, we change the user's role to "banned" or restore their standard role
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new Error("User not found");
  }

  const updatedRole = ban ? "banned" : "fan";

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: updatedRole },
  });

  await prisma.auditLog.create({
    data: {
      userId: userId,
      action: ban ? "ban_user" : "unban_user",
      details: ban ? "Banned user account access" : "Restored user account access",
    },
  });

  revalidatePath("/dashboard/admin");
  return { success: true, user };
}

export async function handleVerificationRequest(creatorProfileId: string, approve: boolean) {
  await checkAdminSession();

  const profile = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
  });

  if (!profile) {
    throw new Error("Creator profile not found");
  }

  const updatedProfile = await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: { isVerified: approve },
  });

  // Send system announcement notification
  await prisma.notification.create({
    data: {
      userId: profile.userId,
      type: "announcement",
      title: approve ? "Verification Approved!" : "Verification Request Update",
      content: approve
        ? "Congratulations! Your profile verification has been approved. The verified star badge is now visible."
        : "Your verification request has been rejected. Please review your profile details and re-submit.",
      link: `/creator/${profile.username}`,
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath(`/creator/${profile.username}`);
  return { success: true };
}

export async function handleWithdrawalRequest(withdrawalId: string, status: "approved" | "rejected" | "held") {
  await checkAdminSession();

  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal request not found");
  }

  const updatedWithdrawal = await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: { status },
  });

  if (status === "approved") {
    // Log as a transaction in the database
    await prisma.transaction.create({
      data: {
        creatorProfileId: withdrawal.creatorProfileId,
        amount: -withdrawal.amount, // negative represents payout withdrawal
        commissionAmount: 0.0,
        netAmount: -withdrawal.amount,
        type: "withdrawal",
        status: "success",
      },
    });
  }

  // Notify creator
  const profile = await prisma.creatorProfile.findUnique({
    where: { id: withdrawal.creatorProfileId },
  });

  if (profile) {
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        type: "announcement",
        title: `Withdrawal Request ${status.toUpperCase()}`,
        content: status === "approved"
          ? `Your withdrawal request of $${withdrawal.amount} via ${withdrawal.method.replace("_", " ")} has been approved and processed.`
          : `Your withdrawal request of $${withdrawal.amount} has been ${status}. Please contact support for details.`,
        link: "/dashboard/creator",
      },
    });
  }

  revalidatePath("/dashboard/admin");
  return { success: true };
}
