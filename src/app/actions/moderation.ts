"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitReport(formData: {
  targetType: string;
  targetId: string;
  reason: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be logged in to submit a report");
  }

  const report = await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: formData.targetType,
      targetId: formData.targetId,
      reason: formData.reason,
      status: "pending",
    },
  });

  return { success: true, report };
}

export async function getReports() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || ((session.user as any).role !== "moderator" && (session.user as any).role !== "admin")) {
    throw new Error("Unauthorized");
  }

  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function moderateReport(reportId: string, action: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || ((session.user as any).role !== "moderator" && (session.user as any).role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  // Update report
  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "resolved",
      actionTaken: action,
    },
  });

  // Perform the actual moderation action depending on the action name
  if (action.includes("hide_post") || action.includes("delete_post")) {
    await prisma.post.update({
      where: { id: report.targetId },
      data: { status: "draft" }, // hides post
    });
  } else if (action.includes("ban_user")) {
    // In a real app we'd suspend their credentials, for simulation we log it
    console.log(`Moderator banned user: ${report.targetId}`);
  }

  // Write audit logs
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action,
      details: `Report ID: ${reportId}, Target Type: ${report.targetType}, Target ID: ${report.targetId}`,
    },
  });

  revalidatePath("/dashboard/moderator");
  return { success: true };
}
