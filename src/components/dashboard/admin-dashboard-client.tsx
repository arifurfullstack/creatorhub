"use client";

import { useState } from "react";
import {
  updatePlatformSetting,
  changeUserRole,
  toggleUserStatus,
  handleVerificationRequest,
  handleWithdrawalRequest,
} from "@/app/actions/admin";
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
  FileText
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
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "verifications" | "withdrawals" | "settings">("overview");

  // Local state for lists
  const [usersList, setUsersList] = useState<UserData[]>(data.users);
  const [verifications, setVerifications] = useState<CreatorRequest[]>(data.pendingVerifications);
  const [withdrawals, setWithdrawals] = useState<PayoutRequest[]>(data.pendingWithdrawals);
  const [settings, setSettings] = useState<SystemSetting[]>(data.settings);
  const [searchQuery, setSearchQuery] = useState("");

  // Loading indicator states
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Settings states
  const commissionSetting = settings.find((s) => s.key === "commission_rate");
  const minWithdrawSetting = settings.find((s) => s.key === "min_withdrawal_amount");
  const [commissionVal, setCommissionVal] = useState(commissionSetting?.value || "10");
  const [minWithdrawVal, setMinWithdrawVal] = useState(minWithdrawSetting?.value || "50");

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await updatePlatformSetting(key, value);
      if (res.success && res.setting) {
        setSettings(settings.map((s) => (s.key === key ? { ...s, value: res.setting.value } : s)));
        alert(`Platform setting ${key} updated successfully!`);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update setting");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await changeUserRole(userId, newRole);
      if (res.success && res.user) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u)));
        alert("User role updated successfully!");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to change user role");
    }
  };

  const handleUserStatus = async (userId: string, ban: boolean) => {
    const actionLabel = ban ? "ban" : "unban";
    if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) return;
    try {
      const res = await toggleUserStatus(userId, ban);
      if (res.success && res.user) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u)));
        alert(`User has been ${ban ? "banned" : "unbanned"} successfully.`);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to modify user status");
    }
  };

  const handleVerify = async (creatorProfileId: string, approve: boolean) => {
    setLoadingId(creatorProfileId);
    try {
      const res = await handleVerificationRequest(creatorProfileId, approve);
      if (res.success) {
        setVerifications(verifications.filter((v) => v.id !== creatorProfileId));
        alert(`Verification request ${approve ? "approved" : "rejected"}!`);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to moderate verification");
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
        alert(`Withdrawal request has been marked as ${status}.`);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to process withdrawal");
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
    <div className="min-h-screen bg-[#09090b] flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 bg-card border-r border-white/5 p-6 shrink-0">
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
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
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
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-3xl font-extrabold text-white">Dashboard Overview</h1>
              <p className="text-xs text-text-muted mt-1">Platform analytics and administrative status</p>
            </div>

            {/* Platform statistics widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Platform Revenue", value: `$${data.platformRevenue.toFixed(2)}`, sub: "Total commission fees", color: "text-primary" },
                { label: "Active Subscriptions", value: data.activeSubsCount, sub: "Memberships monthly renewal", color: "text-white" },
                { label: "Registered Users", value: data.totalUsers, sub: "Fans, creators, admins", color: "text-white" },
                { label: "Creator Profiles", value: data.totalCreators, sub: "Verified + unverified", color: "text-white" },
              ].map((card, i) => (
                <div key={i} className="bg-card border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl font-black mt-2 ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] text-text-muted mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions / Highlights */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Verifications indicator */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl">
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
              <div className="bg-card border border-white/5 p-6 rounded-2xl">
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
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
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
      </main>
    </div>
  );
}
