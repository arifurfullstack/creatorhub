"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  cancelFanSubscription,
  unfollowCreator,
  removeBookmark,
  updateFanProfile,
} from "@/app/actions/fan";
import {
  Heart,
  Bookmark,
  Compass,
  CreditCard,
  Settings,
  DollarSign,
  Users,
  CheckCircle,
  Calendar,
  MapPin,
  Sparkles,
  Trash2,
  Search,
  ArrowUpRight,
  User as UserIcon,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface SubscriptionItem {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    creatorProfile: {
      id: string;
      username: string;
      displayName: string;
    };
  };
}

interface FollowItem {
  id: string;
  createdAt: string;
  creatorProfile: {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    location: string;
    coverImage: string;
    followerCount: number;
  };
}

interface BookmarkItem {
  id: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    visibility: string;
    price: number;
    creatorProfile: {
      id: string;
      username: string;
      displayName: string;
    };
  };
}

interface PurchaseItem {
  id: string;
  amount: number;
  itemName: string;
  creatorName: string;
  creatorUsername: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

export default function FanDashboardClient({
  user,
  subscriptions: initialSubscriptions,
  follows: initialFollows,
  bookmarks: initialBookmarks,
  purchases: initialPurchases,
}: {
  user: UserProfile;
  subscriptions: SubscriptionItem[];
  follows: FollowItem[];
  bookmarks: BookmarkItem[];
  purchases: PurchaseItem[];
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "memberships" | "follows" | "bookmarks" | "purchases" | "settings"
  >("overview");

  // Local state for interactive operations
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(initialSubscriptions);
  const [follows, setFollows] = useState<FollowItem[]>(initialFollows);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks);
  const [purchases] = useState<PurchaseItem[]>(initialPurchases);

  // Settings states
  const [displayName, setDisplayName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.image);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // Subscriptions filtering & search
  const [subsSearch, setSubsSearch] = useState("");
  const filteredSubs = subscriptions.filter((sub) =>
    sub.plan.creatorProfile.displayName.toLowerCase().includes(subsSearch.toLowerCase())
  );

  // Follows search
  const [followsSearch, setFollowsSearch] = useState("");
  const filteredFollows = follows.filter((f) =>
    f.creatorProfile.displayName.toLowerCase().includes(followsSearch.toLowerCase())
  );

  // Bookmarks search
  const [bookmarksSearch, setBookmarksSearch] = useState("");
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.post.title.toLowerCase().includes(bookmarksSearch.toLowerCase()) ||
      b.post.creatorProfile.displayName.toLowerCase().includes(bookmarksSearch.toLowerCase())
  );

  // Total spent calculation
  const totalSpent = purchases.reduce((acc, curr) => acc + curr.amount, 0);

  // Handlers
  const handleCancelSubscription = async (subId: string, creatorName: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel your subscription to ${creatorName}? You will lose access at the end of the billing period.`
      )
    ) {
      return;
    }

    try {
      const res = await cancelFanSubscription(subId);
      if (res.success) {
        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === subId ? { ...sub, status: "canceled", cancelAtPeriodEnd: true } : sub
          )
        );
        alert(`Successfully canceled subscription to ${creatorName}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to cancel subscription");
    }
  };

  const handleUnfollow = async (creatorId: string, creatorName: string) => {
    if (!confirm(`Unfollow ${creatorName}?`)) {
      return;
    }

    try {
      const res = await unfollowCreator(creatorId);
      if (res.success) {
        setFollows(follows.filter((f) => f.creatorProfile.id !== creatorId));
        alert(`You are no longer following ${creatorName}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to unfollow creator");
    }
  };

  const handleRemoveBookmark = async (postId: string, postTitle: string) => {
    try {
      const res = await removeBookmark(postId);
      if (res.success) {
        setBookmarks(bookmarks.filter((b) => b.post.id !== postId));
        alert(`Removed "${postTitle}" from bookmarks`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove bookmark");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError("");

    try {
      const res = await updateFanProfile({
        name: displayName,
        image: avatarUrl,
      });

      if (res.success) {
        alert("Fan profile updated successfully!");
      }
    } catch (err: any) {
      setSettingsError(err.message || "Failed to update profile settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-transparent flex flex-col md:flex-row gap-8 relative overflow-hidden pt-24 md:pt-28">
      {/* Background Liquid Mesh Evolved */}
      <div className="liquid-mesh-container">
        <div className="liquid-mesh-blob liquid-mesh-blob-1" />
        <div className="liquid-mesh-blob liquid-mesh-blob-2" />
        <div className="liquid-mesh-blob liquid-mesh-blob-3" />
      </div>

      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 glass-card-static p-6 shrink-0 rounded-2xl relative z-10">
        <div className="mb-8 border-b border-white/5 pb-5">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Fan Account
          </p>
          <h2 className="text-lg font-extrabold text-white mt-1 truncate">{displayName}</h2>
          <p className="text-xs text-primary font-medium mt-0.5">{user.email}</p>
        </div>

        <nav className="space-y-1.5">
          {[
            { id: "overview", label: "Overview & Stats", icon: Sparkles },
            { id: "memberships", label: "My Memberships", icon: CreditCard },
            { id: "follows", label: "Followed Creators", icon: Users },
            { id: "bookmarks", label: "Saved Bookmarks", icon: Bookmark },
            { id: "purchases", label: "Purchase History", icon: DollarSign },
            { id: "settings", label: "Account Settings", icon: Settings },
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
                      layoutId="activeFanDashTab"
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

      {/* Content Panels */}
      <main className="flex-1 space-y-6">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome, {displayName}!</h1>
              <p className="text-xs text-text-muted mt-1">Manage your creator support, bookmarks, and subscriptions.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Memberships", value: subscriptions.filter(s => s.status === "active").length, sub: "Supporting Tiers", icon: CreditCard },
                { label: "Followed Creators", value: follows.length, sub: "Content channels", icon: Users },
                { label: "Saved Bookmarks", value: bookmarks.length, sub: "Gated/Public posts", icon: Bookmark },
                { label: "Total Support", value: `$${totalSpent.toFixed(2)}`, sub: "All-time tips/sub fees", icon: DollarSign },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="glass-card-premium p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-xl font-black text-white mt-1">{stat.value}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{stat.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Bookmarks and Memberships */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column: Subscribed Creators */}
              <div className="glass-card-premium p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard className="w-4.5 h-4.5 text-primary" />
                  Your Active Tiers
                </h3>
                <div className="space-y-3">
                  {subscriptions.filter(s => s.status === "active").length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-text-muted">No active memberships.</p>
                      <Link href="/" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">
                        Explore Creators
                      </Link>
                    </div>
                  ) : (
                    subscriptions.filter(s => s.status === "active").slice(0, 3).map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-white text-sm">
                            {sub.plan.creatorProfile.displayName}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {sub.plan.name} &bull; ${sub.plan.price}/mo
                          </p>
                        </div>
                        <Link
                          href={`/creator/${sub.plan.creatorProfile.username}`}
                          className="p-1.5 bg-white/5 text-text-muted hover:text-white rounded-lg transition-colors border border-white/5"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Recent Bookmarks */}
              <div className="glass-card-premium p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Bookmark className="w-4.5 h-4.5 text-primary" />
                  Recently Bookmarked
                </h3>
                <div className="space-y-3">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-text-muted">No bookmarks saved yet.</p>
                      <Link href="/feed" className="inline-block mt-3 text-xs text-primary font-bold hover:underline">
                        Go to Feed
                      </Link>
                    </div>
                  ) : (
                    bookmarks.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center"
                      >
                        <div className="truncate pr-4">
                          <p className="font-bold text-white text-sm truncate">{b.post.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5 truncate">
                            By {b.post.creatorProfile.displayName} &bull;{" "}
                            <span className="capitalize">{b.post.visibility}</span>
                          </p>
                        </div>
                        <Link
                          href={`/creator/${b.post.creatorProfile.username}`}
                          className="p-1.5 bg-white/5 text-text-muted hover:text-white rounded-lg transition-colors border border-white/5 shrink-0"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MEMBERSHIPS */}
        {activeTab === "memberships" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Creator Memberships</h1>
              <p className="text-xs text-text-muted mt-1">Manage active content billing subscriptions.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
              <input
                type="text"
                value={subsSearch}
                onChange={(e) => setSubsSearch(e.target.value)}
                placeholder="Search by creator name..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
              />
            </div>

            {/* Memberships Table */}
            <div className="glass-card-premium rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-white/5 text-text-muted uppercase font-bold tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4">Creator</th>
                    <th className="p-4">Membership Level</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Renewal / End Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/95">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted">
                        No subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">
                          <Link
                            href={`/creator/${sub.plan.creatorProfile.username}`}
                            className="hover:text-primary transition-colors"
                          >
                            {sub.plan.creatorProfile.displayName}
                          </Link>
                          <span className="block text-[10px] text-text-muted font-normal mt-0.5">
                            @{sub.plan.creatorProfile.username}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-primary">{sub.plan.name}</td>
                        <td className="p-4">${sub.plan.price.toFixed(2)}/mo</td>
                        <td className="p-4 text-text-muted">
                          {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                              sub.status === "active"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {sub.status === "active" ? (
                            <button
                              onClick={() =>
                                handleCancelSubscription(sub.id, sub.plan.creatorProfile.displayName)
                              }
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg text-[10px] font-bold transition-all border border-red-500/20"
                            >
                              Cancel Plan
                            </button>
                          ) : (
                            <span className="text-[10px] text-text-muted font-medium">
                              Access ends soon
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: FOLLOWS */}
        {activeTab === "follows" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Followed Creators</h1>
              <p className="text-xs text-text-muted mt-1">Directory of creators you follow.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
              <input
                type="text"
                value={followsSearch}
                onChange={(e) => setFollowsSearch(e.target.value)}
                placeholder="Search followed creators..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
              />
            </div>

            {/* Creators Grid */}
            {filteredFollows.length === 0 ? (
              <div className="text-center py-12 glassmorphism rounded-2xl border border-white/5">
                <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Creators Followed</h3>
                <p className="text-xs text-text-muted">Explore home or search pages to follow profiles.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFollows.map((f) => (
                  <div
                    key={f.id}
                    className="glass-card-premium rounded-2xl overflow-hidden relative group flex flex-col justify-between"
                  >
                    {/* Cover Header */}
                    <div className="h-16 w-full relative bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
                      {f.creatorProfile.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.creatorProfile.coverImage}
                          alt="Cover"
                          className="w-full h-full object-cover opacity-60"
                        />
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Profile Info */}
                        <div className="flex justify-between items-start -mt-9 mb-3 relative z-10">
                          <div className="w-12 h-12 rounded-full border-2 border-card bg-card overflow-hidden shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`}
                              alt={f.creatorProfile.displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <h4 className="font-extrabold text-white text-base leading-tight">
                          {f.creatorProfile.displayName}
                        </h4>
                        <p className="text-[11px] text-primary font-medium mt-0.5">
                          @{f.creatorProfile.username}
                        </p>

                        {f.creatorProfile.location && (
                          <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {f.creatorProfile.location}
                          </div>
                        )}

                        <p className="text-xs text-text-muted mt-3 line-clamp-2 leading-relaxed">
                          {f.creatorProfile.bio || "No information details added."}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
                        <Link
                          href={`/creator/${f.creatorProfile.username}`}
                          className="flex-1 py-2 text-center bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5"
                        >
                          View Channel
                        </Link>
                        <button
                          onClick={() => handleUnfollow(f.creatorProfile.id, f.creatorProfile.displayName)}
                          className="px-3 py-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: BOOKMARKS */}
        {activeTab === "bookmarks" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Saved Bookmarks</h1>
              <p className="text-xs text-text-muted mt-1">Quick links to your saved creator posts.</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-text-muted" />
              <input
                type="text"
                value={bookmarksSearch}
                onChange={(e) => setBookmarksSearch(e.target.value)}
                placeholder="Search bookmarked post title or creator..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-sm text-white"
              />
            </div>

            {/* Bookmarks Grid */}
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12 glassmorphism rounded-2xl border border-white/5">
                <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Bookmarks Saved</h3>
                <p className="text-xs text-text-muted">Click the bookmark icon on feed posts to save them here.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredBookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="glass-card-premium p-5 rounded-2xl flex flex-col justify-between h-40"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-extrabold uppercase border border-primary/20">
                          {b.post.visibility}
                        </span>
                        <p className="text-[10px] text-text-muted">
                          Saved: {new Date(b.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <h4 className="font-bold text-white text-sm truncate mt-3 leading-snug">
                        {b.post.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 truncate">
                        By {b.post.creatorProfile.displayName} (@{b.post.creatorProfile.username})
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                      <Link
                        href={`/creator/${b.post.creatorProfile.username}`}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        View Post
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleRemoveBookmark(b.post.id, b.post.title)}
                        className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PURCHASES */}
        {activeTab === "purchases" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Purchase History</h1>
              <p className="text-xs text-text-muted mt-1">Audit trail of billing support, tips, and unlocks.</p>
            </div>

            {/* Ledger Grid */}
            <div className="glass-card-premium rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-white/5 text-text-muted uppercase font-bold tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4">Billing Item / Transaction</th>
                    <th className="p-4">Paid To</th>
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4 text-right">Gross Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/95">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-muted">
                        No payment transactions loaded.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">{p.itemName}</td>
                        <td className="p-4">
                          {p.creatorUsername ? (
                            <Link
                              href={`/creator/${p.creatorUsername}`}
                              className="hover:text-primary transition-colors font-semibold"
                            >
                              {p.creatorName}
                            </Link>
                          ) : (
                            <span className="font-semibold">{p.creatorName}</span>
                          )}
                        </td>
                        <td className="p-4 text-text-muted">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right font-black text-green-400">
                          +${p.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account Settings</h1>
              <p className="text-xs text-text-muted mt-1">Update display name and user avatar profiles.</p>
            </div>

            <div className="glass-card-premium p-6 rounded-2xl max-w-xl">
              <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Customize Profile
              </h3>

              {settingsError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-pulse">
                  {settingsError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alice Fan"
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Avatar Link / URL
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-2.5 top-3.5 w-4.5 h-4.5 text-text-muted" />
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 mt-4 shadow-lg shadow-primary/10"
                >
                  <CheckCircle className="w-4 h-4" />
                  {settingsLoading ? "Saving..." : "Save Settings Changes"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
