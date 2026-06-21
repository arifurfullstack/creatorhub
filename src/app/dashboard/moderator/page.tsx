import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getReports } from "@/app/actions/moderation";
import ModeratorClient from "@/components/dashboard/moderator-client";

export default async function ModeratorDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Authorize moderators or admins
  if ((session.user as any).role !== "moderator" && (session.user as any).role !== "admin") {
    redirect("/feed");
  }

  const reports = await getReports();

  // Serialize date parameters for client safety
  const serializedReports = reports.map((rep) => ({
    id: rep.id,
    targetType: rep.targetType,
    targetId: rep.targetId,
    reason: rep.reason,
    status: rep.status,
    actionTaken: rep.actionTaken,
    createdAt: rep.createdAt.toISOString() as any,
    reporter: {
      name: rep.reporter.name,
      email: rep.reporter.email,
    },
  }));

  return (
    <div className="min-h-screen bg-[#09090b]">
      <ModeratorClient initialReports={serializedReports} />
    </div>
  );
}
