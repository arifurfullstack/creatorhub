"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  updatePlatformSetting,
  changeUserRole,
  toggleUserStatus,
  handleVerificationRequest,
  handleWithdrawalRequest,
} from "@/app/actions/admin";
import { Command } from "cmdk";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Star,
  CreditCard,
  Settings,
  BarChart3,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Search,
  UserMinus,
  Save,
  FileText,
  Globe,
  Palette
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface CreatorRequest {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  followerCount: number;
  user: {
    email: string;
    image: string | null;
  };
}

interface PayoutRequest {
  id: string;
  amount: number;
  method: string;
  details: string;
  status: string;
  createdAt: string;
  creatorProfile: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

interface AdminOverviewProps {
  totalUsers: number;
  totalCreators: number;
  activeSubsCount: number;
  platformRevenue: number;
  pendingVerifications: CreatorRequest[];
  pendingWithdrawals: PayoutRequest[];
  users: UserData[];
  settings: SystemSetting[];
}

export default function AdminDashboardClient({ data }: { data: AdminOverviewProps }) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "verifications" | "withdrawals" | "settings" | "customizer" | "theme">("overview");

  // Local state for lists
  const [usersList, setUsersList] = useState<UserData[]>(data.users);
  const [verifications, setVerifications] = useState<CreatorRequest[]>(data.pendingVerifications);
  const [withdrawals, setWithdrawals] = useState<PayoutRequest[]>(data.pendingWithdrawals);
  const [settings, setSettings] = useState<SystemSetting[]>(data.settings);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCommand, setOpenCommand] = useState(false);

  // Toggle command palette on Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Loading indicator states
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Settings states
  const commissionSetting = settings.find((s) => s.key === "commission_rate");
  const minWithdrawSetting = settings.find((s) => s.key === "min_withdrawal_amount");
  const [commissionVal, setCommissionVal] = useState(commissionSetting?.value || "10");
  const [minWithdrawVal, setMinWithdrawVal] = useState(minWithdrawSetting?.value || "50");

  // Website Customizer States
  const logoSetting = settings.find((s) => s.key === "website_logo");
  const faviconSetting = settings.find((s) => s.key === "website_favicon");
  const titleSetting = settings.find((s) => s.key === "website_title");
  const descriptionSetting = settings.find((s) => s.key === "website_description");
  const metaTitleSetting = settings.find((s) => s.key === "website_meta_title");
  const metaDescriptionSetting = settings.find((s) => s.key === "website_meta_description");
  const keywordsSetting = settings.find((s) => s.key === "website_keywords");
  const themeSetting = settings.find((s) => s.key === "website_theme");

  const [logoVal, setLogoVal] = useState(logoSetting?.value || "CREATORHUB");
  const [faviconVal, setFaviconVal] = useState(faviconSetting?.value || "/favicon.ico");
  const [titleVal, setTitleVal] = useState(titleSetting?.value || "CreatorHub | Premium Creator Economy Platform");
  const [descriptionVal, setDescriptionVal] = useState(descriptionSetting?.value || "Monetize your content through subscriptions, locked posts, tips, and direct messaging. The ultimate SaaS platform for creators and fans.");
  const [metaTitleVal, setMetaTitleVal] = useState(metaTitleSetting?.value || "CreatorHub | Premium Creator Economy Platform");
  const [metaDescriptionVal, setMetaDescriptionVal] = useState(metaDescriptionSetting?.value || "Monetize your content through subscriptions, locked posts, tips, and direct messaging. The ultimate SaaS platform for creators and fans.");
  const [keywordsVal, setKeywordsVal] = useState(keywordsSetting?.value || "creator, platform, subscriptions, economy");
  const [themeVal, setThemeVal] = useState(themeSetting?.value || "dark");

  const [isSavingCustomizer, setIsSavingCustomizer] = useState(false);

  const handleSaveCustomizer = async () => {
    setIsSavingCustomizer(true);
    try {
      await updatePlatformSetting("website_logo", logoVal);
      await updatePlatformSetting("website_favicon", faviconVal);
      await updatePlatformSetting("website_title", titleVal);
      await updatePlatformSetting("website_description", descriptionVal);
      await updatePlatformSetting("website_meta_title", metaTitleVal);
      await updatePlatformSetting("website_meta_description", metaDescriptionVal);
      await updatePlatformSetting("website_keywords", keywordsVal);
      await updatePlatformSetting("website_theme", themeVal);
      
      toast.success("Website customizer settings saved successfully!");
      // Reload layout resources dynamically at layout root
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save customizer settings");
    } finally {
      setIsSavingCustomizer(false);
    }
  };

  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const handleApplyTheme = async (themeId: string) => {
    setIsApplyingTheme(true);
    const loadingToast = toast.loading(`Applying theme preset...`);
    try {
      await updatePlatformSetting("website_theme", themeId);
      setThemeVal(themeId);
      toast.success("Theme preset applied successfully!", { id: loadingToast });
      // Reload layout resources dynamically at layout root
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply theme", { id: loadingToast });
    } finally {
      setIsApplyingTheme(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await updatePlatformSetting(key, value);
      if (res.success && res.setting) {
        setSettings(settings.map((s) => (s.key === key ? { ...s, value: res.setting.value } : s)));
        toast.success(`Platform setting ${key} updated successfully!`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update setting");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await changeUserRole(userId, newRole);
      if (res.success && res.user) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u)));
        toast.success("User role updated successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to change user role");
    }
  };

  const handleUserStatus = async (userId: string, ban: boolean) => {
    const actionLabel = ban ? "ban" : "unban";
    if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) return;
    try {
      const res = await toggleUserStatus(userId, ban);
      if (res.success && res.user) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u)));
        toast.success(`User has been ${ban ? "banned" : "unbanned"} successfully.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to modify user status");
    }
  };

  const handleVerify = async (creatorProfileId: string, approve: boolean) => {
    setLoadingId(creatorProfileId);
    try {
      const res = await handleVerificationRequest(creatorProfileId, approve);
      if (res.success) {
        setVerifications(verifications.filter((v) => v.id !== creatorProfileId));
        toast.success(`Verification request ${approve ? "approved" : "rejected"}!`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to moderate verification");
    } finally {
      setLoadingId(null);
    }
  };

  const handleWithdrawal = async (withdrawalId: string, status: "approved" | "rejected" | "held") => {
    setLoadingId(withdrawalId);
    try {
      const res = await handleWithdrawalRequest(withdrawalId, status);
      if (res.success) {
        setWithdrawals(withdrawals.filter((w) => w.id !== withdrawalId));
        toast.success(`Withdrawal request has been marked as ${status}.`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to process withdrawal");
    } finally {
      setLoadingId(null);
    }
  };

  // Filter users based on query
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row relative overflow-hidden pt-24 md:pt-28">
      {/* Background Liquid Mesh Evolved */}
      <div className="liquid-mesh-container">
        <div className="liquid-mesh-blob liquid-mesh-blob-1" />
        <div className="liquid-mesh-blob liquid-mesh-blob-2" />
        <div className="liquid-mesh-blob liquid-mesh-blob-3" />
      </div>

      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 glass-card-static p-6 shrink-0 relative z-10">
        <div className="mb-8">
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Administrator</p>
          <h2 className="text-lg font-extrabold text-white mt-1 flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-primary" />
            Admin Suite
          </h2>
        </div>

        <nav className="space-y-1.5">
          {[
            { id: "overview", label: "Dashboard Overview", icon: BarChart3 },
            { id: "users", label: "Users & Creators", icon: Users },
            { id: "verifications", label: "Verifications Queue", icon: Star },
            { id: "withdrawals", label: "Withdrawals Audit", icon: CreditCard },
            { id: "settings", label: "Platform Settings", icon: Settings },
            { id: "customizer", label: "Website Customizer", icon: Globe },
            { id: "theme", label: "Website Themes", icon: Palette },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                  isSelected
                    ? "text-white"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {isSelected && (
                  <>
                    <motion.div
                      layoutId="activeAdminDashTab"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl -z-10 shadow-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
                  </>
                )}
                <Icon className="w-4.5 h-4.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-x-hidden">
        {/* Overview Panel */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
                <p className="text-xs text-text-muted mt-1">Platform analytics and administrative status</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white font-mono text-[10px]">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white font-mono text-[10px]">K</kbd>
                <span>to search commands</span>
              </div>
            </div>

            {/* Platform statistics widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Platform Revenue", value: `$${data.platformRevenue.toFixed(2)}`, sub: "Total commission fees", color: "text-primary" },
                { label: "Active Subscriptions", value: data.activeSubsCount, sub: "Memberships monthly renewal", color: "text-white" },
                { label: "Registered Users", value: data.totalUsers, sub: "Fans, creators, admins", color: "text-white" },
                { label: "Creator Profiles", value: data.totalCreators, sub: "Verified + unverified", color: "text-white" },
              ].map((card, i) => (
                <div key={i} className="glass-card-premium p-5 rounded-2xl relative overflow-hidden">
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl font-black mt-2 ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] text-text-muted mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions / Highlights */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Verifications indicator */}
              <div className="glass-card-premium p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Verification Queue
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  There are currently <span className="font-bold text-white">{verifications.length}</span> pending verification requests from creators.
                </p>
                <button
                  onClick={() => setActiveTab("verifications")}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5"
                >
                  Manage Requests
                </button>
              </div>

              {/* Withdrawals indicator */}
              <div className="glass-card-premium p-6 rounded-2xl">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Withdrawals Queue
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  There are currently <span className="font-bold text-white">{withdrawals.length}</span> pending payout requests requiring verification.
                </p>
                <button
                  onClick={() => setActiveTab("withdrawals")}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5"
                >
                  Audit Withdrawals
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users & Creators Directory Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Users & Creators</h1>
              <p className="text-xs text-text-muted mt-1">Manage user roles, credentials, and ban/unban profiles</p>
            </div>

            {/* Search filter */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
              />
            </div>

            {/* Users Table */}
            <div className="glass-card-static rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-white/5 text-text-muted uppercase font-bold tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/90">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-text-muted">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold">{user.name}</td>
                          <td className="p-4 font-mono">{user.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                user.role === "admin"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/25"
                                  : user.role === "creator"
                                  ? "bg-pink-500/10 text-primary border border-primary/25"
                                  : user.role === "moderator"
                                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/25"
                                  : user.role === "banned"
                                  ? "bg-red-500/10 text-red-500 border border-red-500/25 animate-pulse"
                                  : "bg-white/5 text-white border border-white/10"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-text-muted">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            {/* Change Role Trigger */}
                            {user.role !== "admin" && (
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                className="bg-[#222226] border border-white/10 rounded px-2 py-1 text-[10px] font-semibold text-white focus:outline-none"
                              >
                                <option value="fan">Fan</option>
                                <option value="creator">Creator</option>
                                <option value="moderator">Moderator</option>
                              </select>
                            )}

                            {/* Ban / Unban trigger */}
                            {user.role !== "admin" && (
                              <button
                                onClick={() => handleUserStatus(user.id, user.role !== "banned")}
                                className={`p-1.5 rounded transition-all ${
                                  user.role === "banned"
                                    ? "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                                    : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                }`}
                                title={user.role === "banned" ? "Unban User" : "Ban User"}
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verification Queue Tab */}
        {activeTab === "verifications" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Verification Queue</h1>
              <p className="text-xs text-text-muted mt-1">Audit creator requests and approve verified badges</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifications.length === 0 ? (
                <div className="col-span-full text-center py-16 glassmorphism rounded-2xl border border-white/5">
                  <CheckCircle className="w-12 h-12 text-green-500/40 mx-auto mb-4" />
                  <h3 className="font-bold text-white text-base mb-1">Queue is Empty</h3>
                  <p className="text-xs text-text-muted">No creator profile verifications are pending.</p>
                </div>
              ) : (
                verifications.map((creator) => (
                  <div
                    key={creator.id}
                    className="bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt={creator.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{creator.displayName}</h4>
                        <p className="text-xs text-text-muted">@{creator.username}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 text-xs text-text-muted">
                      <div>
                        <p className="font-bold uppercase text-[9px]">Email</p>
                        <p className="text-white mt-0.5">{creator.user.email}</p>
                      </div>
                      {creator.bio && (
                        <div>
                          <p className="font-bold uppercase text-[9px]">Bio</p>
                          <p className="text-white mt-0.5 truncate">{creator.bio}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-bold uppercase text-[9px]">Followers</p>
                        <p className="text-white mt-0.5 font-bold">{creator.followerCount}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-white/5 pt-4">
                      <button
                        disabled={loadingId === creator.id}
                        onClick={() => handleVerify(creator.id, true)}
                        className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                      >
                        Approve Badge
                      </button>
                      <button
                        disabled={loadingId === creator.id}
                        onClick={() => handleVerify(creator.id, false)}
                        className="px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-text-muted rounded-lg text-xs font-bold transition-all border border-white/5 shrink-0"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Withdrawals Queue Tab */}
        {activeTab === "withdrawals" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Withdrawals Audit</h1>
              <p className="text-xs text-text-muted mt-1">Process pending withdrawal and payout requests</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {withdrawals.length === 0 ? (
                <div className="col-span-full text-center py-16 glassmorphism rounded-2xl border border-white/5">
                  <CheckCircle className="w-12 h-12 text-green-500/40 mx-auto mb-4" />
                  <h3 className="font-bold text-white text-base mb-1">Queue is Empty</h3>
                  <p className="text-xs text-text-muted">No pending creator withdrawal requests found.</p>
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="bg-card border border-white/5 p-6 rounded-2xl relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">@{w.creatorProfile.username}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 capitalize">
                          {w.method.replace("_", " ")} &bull; {new Date(w.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-lg font-black text-primary">${w.amount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/90 leading-relaxed font-mono truncate mb-6">
                      <span className="font-bold font-sans text-[9px] uppercase block text-text-muted mb-1">
                        Payout Account details
                      </span>
                      {w.details}
                    </div>

                    <div className="flex gap-2 border-t border-white/5 pt-4">
                      <button
                        disabled={loadingId === w.id}
                        onClick={() => handleWithdrawal(w.id, "approved")}
                        className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        disabled={loadingId === w.id}
                        onClick={() => handleWithdrawal(w.id, "held")}
                        className="p-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black rounded-lg transition-colors"
                        title="Hold Payout"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button
                        disabled={loadingId === w.id}
                        onClick={() => handleWithdrawal(w.id, "rejected")}
                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                        title="Reject Payout"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Platform Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Platform Settings</h1>
              <p className="text-xs text-text-muted mt-1">Configure site commission rules and limits</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Configuration panel */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-6">
                <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Commission & Limits
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Platform Commission Cut (%)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={commissionVal}
                        onChange={(e) => setCommissionVal(e.target.value)}
                        className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white font-bold"
                      />
                      <button
                        onClick={() => handleUpdateSetting("commission_rate", commissionVal)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-4.5 h-4.5" />
                        Save Cut
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5">
                      Percentage fee deducted from all subscriber memberships and content sales checkout transactions.
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Minimum Withdrawal Limit (USD)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min={1}
                        value={minWithdrawVal}
                        onChange={(e) => setMinWithdrawVal(e.target.value)}
                        className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white font-bold"
                      />
                      <button
                        onClick={() => handleUpdateSetting("min_withdrawal_amount", minWithdrawVal)}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-4.5 h-4.5" />
                        Save Limit
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5">
                      Minimum amount creators must accumulate in their earnings balance before submitting payout request claims.
                    </p>
                  </div>
                </div>
              </div>

              {/* CMS Text Management Panel */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  CMS Static Content Editor
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  Admin panel content mapping is active. Edit static pages blocks.
                </p>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Frequently Asked Questions (FAQs)
                    </label>
                    <textarea
                      readOnly
                      value={`[ { "q": "How do payouts work?", "a": "Approved withdrawals process via wise/bank transfer within 48 hours." } ]`}
                      rows={3}
                      className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-xl focus:outline-none text-text-muted font-mono resize-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Terms of Service
                    </label>
                    <textarea
                      readOnly
                      value="Standard terms mapping details commission cuts, content restrictions, copyright audits, and user refunds."
                      rows={2}
                      className="w-full px-3 py-2 bg-[#222226] border border-white/10 rounded-xl focus:outline-none text-text-muted font-sans resize-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Website Customizer Tab */}
        {activeTab === "customizer" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Website Customizer</h1>
              <p className="text-xs text-text-muted mt-1">Manage global platform themes, branding text, dynamic SEO properties, and favicons</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Settings Fields */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-6">
                  <div>
                    <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Branding & Theme
                    </h3>
                    <p className="text-xs text-text-muted">General website identity configurations.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                        Logo Branding (Text or Image URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoVal}
                          onChange={(e) => setLogoVal(e.target.value)}
                          placeholder="e.g. CREATORHUB or /uploads/logo.png"
                          className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white font-bold"
                        />
                        <label className="relative flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-xs font-bold text-white transition-all shrink-0 hover:scale-[1.02]">
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const loadingToast = toast.loading("Uploading logo...");
                              try {
                                const body = new FormData();
                                body.append("file", file);
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body,
                                });
                                const data = await res.json();
                                if (!res.ok || data.error) {
                                  throw new Error(data.error || "Failed to upload logo");
                                }
                                setLogoVal(data.url);
                                toast.success("Logo uploaded successfully!", { id: loadingToast });
                              } catch (err: any) {
                                toast.error(err.message || "Logo upload failed", { id: loadingToast });
                              }
                            }}
                          />
                        </label>
                      </div>
                      {(logoVal.startsWith("/") || logoVal.startsWith("http")) && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logoVal} alt="Logo preview" className="h-6 max-w-[100px] object-contain rounded bg-white/5 p-0.5" />
                          <button type="button" onClick={() => setLogoVal("CREATORHUB")} className="text-red-400 hover:text-red-300 font-semibold cursor-pointer">Remove image</button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                        Favicon Path or URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={faviconVal}
                          onChange={(e) => setFaviconVal(e.target.value)}
                          placeholder="e.g. /favicon.ico"
                          className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white font-mono"
                        />
                        <label className="relative flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-xs font-bold text-white transition-all shrink-0 hover:scale-[1.02]">
                          <span>Upload Icon</span>
                          <input
                            type="file"
                            accept="image/*,.ico"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const loadingToast = toast.loading("Uploading favicon...");
                              try {
                                const body = new FormData();
                                body.append("file", file);
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body,
                                });
                                const data = await res.json();
                                if (!res.ok || data.error) {
                                  throw new Error(data.error || "Failed to upload favicon");
                                }
                                setFaviconVal(data.url);
                                toast.success("Favicon uploaded successfully!", { id: loadingToast });
                              } catch (err: any) {
                                toast.error(err.message || "Favicon upload failed", { id: loadingToast });
                              }
                            }}
                          />
                        </label>
                      </div>
                      {(faviconVal.startsWith("/") || faviconVal.startsWith("http")) && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={faviconVal} alt="Favicon preview" className="w-5 h-5 object-contain rounded bg-white/5 p-0.5" />
                          <button type="button" onClick={() => setFaviconVal("/favicon.ico")} className="text-red-400 hover:text-red-300 font-semibold cursor-pointer">Reset default</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                      Active Website Theme Style
                    </label>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block capitalize">
                          {themeVal.replace("theme-", "").replace("dark", "Vibrant Sunset Dark").replace("light", "Light Minimalist")}
                        </span>
                        <span className="text-[10px] text-text-muted">Configure color palette and theme presets.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("theme")}
                        className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/25 border border-primary/20 hover:border-primary/40 text-primary hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Switch Theme Presets
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    SEO Meta Configurations
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                        Website Title
                      </label>
                      <input
                        type="text"
                        value={titleVal}
                        onChange={(e) => setTitleVal(e.target.value)}
                        placeholder="Platform Website Title"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                        Website Description
                      </label>
                      <textarea
                        value={descriptionVal}
                        onChange={(e) => setDescriptionVal(e.target.value)}
                        rows={3}
                        placeholder="Dynamic metadata site description details..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                          Meta SEO Title Override
                        </label>
                        <input
                          type="text"
                          value={metaTitleVal}
                          onChange={(e) => setMetaTitleVal(e.target.value)}
                          placeholder="Meta Title Tag"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                          Meta Keywords List
                        </label>
                        <input
                          type="text"
                          value={keywordsVal}
                          onChange={(e) => setKeywordsVal(e.target.value)}
                          placeholder="Comma-separated keywords"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                        Meta SEO Description Override
                      </label>
                      <textarea
                        value={metaDescriptionVal}
                        onChange={(e) => setMetaDescriptionVal(e.target.value)}
                        rows={3}
                        placeholder="SEO meta description snippet tag..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveCustomizer}
                    disabled={isSavingCustomizer}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/10 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingCustomizer ? "Saving Customizer..." : "Save Customizer Branding"}
                  </button>
                </div>
              </div>

              {/* SEO Live Preview Panel */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">SEO Google Search Card Preview</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase tracking-wider">Live</span>
                  </div>

                  <p className="text-[11px] text-text-muted">
                    This is how your platform is displayed in organic Google Search engine listings.
                  </p>

                  <div className="bg-[#17171a] p-4 rounded-xl border border-white/5 space-y-1.5">
                    {/* Google URL structure */}
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {faviconVal ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={faviconVal} alt="Favicon" className="w-2.5 h-2.5 error-fallback" onError={(e)=>{(e.target as HTMLElement).style.display='none'}} />
                        ) : (
                          <div className="w-2 h-2 rounded bg-primary" />
                        )}
                      </div>
                      <div className="truncate font-sans text-[11px] text-white/50">
                        https://creatorhub.com <span className="text-white/30">&rsaquo; search</span>
                      </div>
                    </div>

                    {/* Google Blue Link Title */}
                    <h3 className="text-[#8ab4f8] text-base font-medium leading-tight hover:underline cursor-pointer truncate">
                      {metaTitleVal || titleVal || "CreatorHub | Premium Creator Economy Platform"}
                    </h3>

                    {/* Google Snippet description */}
                    <p className="text-[#bdc1c6] text-[11.5px] leading-snug line-clamp-2">
                      {metaDescriptionVal || descriptionVal || "Monetize your content through subscriptions, locked posts, tips, and direct messaging."}
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Platform Branding Mockup</h4>
                  
                  <div className={`p-4 rounded-xl border transition-all ${themeVal === 'light' ? 'bg-white border-black/15 text-black' : 'bg-[#09090b] border-white/10 text-white'}`}>
                    <div className="flex items-center justify-between border-b border-current/10 pb-3 mb-3">
                      <span className="text-sm font-black tracking-wider uppercase text-gradient">{logoVal}</span>
                      <div className="flex gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-current/25" />
                        <span className="w-2.5 h-2.5 rounded-full bg-current/25" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-2/3 rounded bg-current/20" />
                      <div className="h-2 w-full rounded bg-current/10" />
                      <div className="h-2 w-4/5 rounded bg-current/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Website Themes Tab */}
        {activeTab === "theme" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Website Themes</h1>
              <p className="text-xs text-text-muted mt-1">Switch the entire website color style, accents, and default brand designs in one click</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Theme Grid */}
              <div className="lg:col-span-8 space-y-4">
                {[
                  {
                    id: "dark",
                    name: "Sunset Crimson (Default)",
                    desc: "The default luxury dark-theme featuring geometric 'Plus Jakarta Sans' typography, glowing pink-to-purple overlays, and vibrant gradient buttons.",
                    bg: "bg-[#09090b]",
                    primaryColor: "#FF4FA3",
                    secondaryColor: "#FF79C6",
                    textColor: "text-white",
                  },
                  {
                    id: "theme-glass-gradient",
                    name: "Premium Glass Gradient (Luxury)",
                    desc: "An ultra-premium glassmorphic layout style utilizing deep space radial gradients, frosted translucent panels, and vibrant rose/cyan accents.",
                    bg: "bg-gradient-to-br from-[#150d30] to-[#03020b]",
                    primaryColor: "#f43f5e",
                    secondaryColor: "#06b6d4",
                    textColor: "text-white",
                  },
                  {
                    id: "theme-cyberpunk",
                    name: "Cyberpunk Neon",
                    desc: "High-voltage cyberpunk theme featuring raw contrasting neon colors and dark electronic backgrounds.",
                    bg: "bg-[#0a0a03]",
                    primaryColor: "#f2e205",
                    secondaryColor: "#00f0ff",
                    textColor: "text-white",
                  },
                  {
                    id: "theme-emerald",
                    name: "Emerald Forest",
                    desc: "A calming organic theme with natural dark forest greens, clean emerald accents, and soft mint surfaces.",
                    bg: "bg-[#030806]",
                    primaryColor: "#10b981",
                    secondaryColor: "#34d399",
                    textColor: "text-white",
                  },
                  {
                    id: "theme-obsidian",
                    name: "Midnight Obsidian",
                    desc: "Absolute obsidian dark space theme with rich violet tones and clean futuristic typography.",
                    bg: "bg-[#030303]",
                    primaryColor: "#8b5cf6",
                    secondaryColor: "#ec4899",
                    textColor: "text-white",
                  },
                  {
                    id: "theme-rose",
                    name: "Rose Quartz",
                    desc: "Sleek dark-quartz theme with soft warm rose gradients, perfect for visual creators.",
                    bg: "bg-[#0b0709]",
                    primaryColor: "#f472b6",
                    secondaryColor: "#fda4af",
                    textColor: "text-white",
                  },
                  {
                    id: "theme-sapphire",
                    name: "Royal Sapphire",
                    desc: "A professional technology layout styling with dark space blues and electric sapphire accents.",
                    bg: "bg-[#020617]",
                    primaryColor: "#3b82f6",
                    secondaryColor: "#60a5fa",
                    textColor: "text-white",
                  },
                  {
                    id: "light",
                    name: "Light Minimalist",
                    desc: "The platform's minimalist clean light theme with standard zinc card configurations.",
                    bg: "bg-white",
                    primaryColor: "#FF4FA3",
                    secondaryColor: "#FF79C6",
                    textColor: "text-black",
                  },
                ].map((item) => {
                  const isActive = themeVal === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isActive
                          ? "bg-white/[0.03] border-primary shadow-[0_0_15px_rgba(255,79,163,0.1)]"
                          : "bg-card border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Color Swatches */}
                        <div className={`w-14 h-14 rounded-xl shrink-0 p-1.5 border border-white/10 ${item.bg} flex flex-wrap gap-1.5 items-center justify-center overflow-hidden shadow-inner`}>
                          <span className="w-4 h-4 rounded-full block border border-white/5" style={{ backgroundColor: item.primaryColor }} />
                          <span className="w-4 h-4 rounded-full block border border-white/5" style={{ backgroundColor: item.secondaryColor }} />
                          <span className={`text-[8px] font-black uppercase ${item.textColor}`}>Aa</span>
                        </div>
                        
                        <div>
                          <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                            {item.name}
                            {isActive && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold uppercase tracking-wider">Active</span>
                            )}
                          </h4>
                          <p className="text-xs text-text-muted mt-1 max-w-lg leading-relaxed">{item.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isApplyingTheme}
                        onClick={() => handleApplyTheme(item.id)}
                        className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-primary text-white pointer-events-none"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:scale-[1.02]"
                        }`}
                      >
                        {isActive ? "Active Theme" : "Apply Preset"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Preview */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-card border border-white/5 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Branding Preview</h4>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    This mockup demonstrates how the selected theme's header text, accent rings, and visual highlights look when applied.
                  </p>
                  
                  {/* Miniature Mockup */}
                  <div className="p-4 rounded-xl border border-white/5 bg-[#17171a] space-y-4">
                    {/* Header mock */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <span className="text-xs font-black tracking-wider uppercase" style={{ color: themeVal === 'light' ? '#FF4FA3' : 'var(--primary)' }}>
                        {logoVal}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      </div>
                    </div>
                    {/* Hero mock */}
                    <div className="space-y-2 text-center py-2">
                      <div className="h-1.5 w-1/2 rounded bg-white/20 mx-auto" />
                      <div className="h-3 w-4/5 rounded mx-auto" style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))' }} />
                      <div className="h-1 w-2/3 rounded bg-white/10 mx-auto" />
                    </div>
                    {/* Action buttons mock */}
                    <div className="flex gap-2">
                      <div className="h-5 flex-1 rounded" style={{ backgroundColor: 'var(--primary)' }} />
                      <div className="h-5 flex-1 rounded bg-white/5 border border-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cmdk Command Menu Dialog Modal */}
      {openCommand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setOpenCommand(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 p-4">
            <Command className="w-full text-white">
              <Command.Input
                placeholder="Type a command or search users..."
                className="w-full px-4 py-3 bg-white/5 border border-white/5 focus:outline-none text-sm text-white rounded-xl placeholder-text-muted"
              />
              <Command.List className="max-h-64 overflow-y-auto mt-3 space-y-1 scrollbar-none">
                <Command.Empty className="text-xs text-text-muted p-3">No results found.</Command.Empty>
                
                <Command.Group heading="Navigation Shortcuts" className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 py-1.5 block">
                  <Command.Item
                    onSelect={() => { setActiveTab("overview"); setOpenCommand(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                  >
                    Go to Dashboard Overview
                  </Command.Item>
                  <Command.Item
                    onSelect={() => { setActiveTab("users"); setOpenCommand(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                  >
                    Manage Users & Creators
                  </Command.Item>
                  <Command.Item
                    onSelect={() => { setActiveTab("customizer"); setOpenCommand(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                  >
                    Open Website Customizer
                  </Command.Item>
                  <Command.Item
                    onSelect={() => { setActiveTab("theme"); setOpenCommand(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                  >
                    Manage Website Themes
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Audit Actions" className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 py-1.5 block border-t border-white/5 mt-2 pt-2">
                  <Command.Item
                    onSelect={() => { setActiveTab("verifications"); setOpenCommand(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                  >
                    Verify Creator Badges
                  </Command.Item>
                  <Command.Item
                    onSelect={() => { setActiveTab("withdrawals"); setOpenCommand(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                  >
                    Audit Creator Payouts
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Quick User Action (Select to search/filter)" className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 py-1.5 block border-t border-white/5 mt-2 pt-2">
                  {usersList.slice(0, 10).map((u) => (
                    <Command.Item
                      key={u.id}
                      onSelect={() => {
                        setActiveTab("users");
                        setSearchQuery(u.email);
                        setOpenCommand(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        <span>{u.name || u.email}</span>
                      </div>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-text-muted font-mono uppercase tracking-wider">{u.role}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}
