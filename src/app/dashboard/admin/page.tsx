import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminOverview } from "@/app/actions/admin";
import AdminDashboardClient from "@/components/dashboard/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Double check authorization limits
  if ((session.user as any).role !== "admin") {
    redirect("/feed");
  }

  // Load platforms statistics bundle
  const overview = await getAdminOverview();

  // Serialize dates for safety in Client Components
  const serializedData = {
    totalUsers: overview.totalUsers,
    totalCreators: overview.totalCreators,
    activeSubsCount: overview.activeSubsCount,
    platformRevenue: overview.platformRevenue,
    settings: overview.settings.map((s) => ({
      id: s.id,
      key: s.key,
      value: s.value,
      description: s.description,
    })),
    users: overview.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    })),
    pendingVerifications: overview.pendingVerifications.map((v) => ({
      id: v.id,
      username: v.username,
      displayName: v.displayName,
      bio: v.bio,
      location: v.location,
      followerCount: v.followerCount,
      user: {
        email: v.user.email,
        image: v.user.image,
      },
    })),
    pendingWithdrawals: overview.pendingWithdrawals.map((w) => ({
      id: w.id,
      amount: w.amount,
      method: w.method,
      details: w.details,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      creatorProfile: {
        id: w.creatorProfile.id,
        username: w.creatorProfile.username,
        displayName: w.creatorProfile.displayName,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <AdminDashboardClient data={serializedData} />
    </div>
  );
}
