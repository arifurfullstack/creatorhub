"use client";

import { useState } from "react";
import { 
  User, 
  Settings, 
  CreditCard, 
  Globe, 
  Calendar, 
  Check, 
  AlertCircle, 
  Trash2, 
  Camera, 
  Save, 
  Link as LinkIcon, 
  TrendingUp, 
  MapPin, 
  FileText 
} from "lucide-react";
import { toast } from "sonner";
import { updateFanProfile, cancelFanSubscription, unfollowCreator } from "@/app/actions/fan";
import { updateCreatorProfileSettings, updatePaymentSettings } from "@/app/actions/creator-settings";
import { useRouter } from "next/navigation";

interface SerializedUser {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

interface SerializedCreator {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  coverImage: string;
  stripeAccountId: string;
  paypalEmail: string;
  wiseEmail: string;
  bankDetails: string;
  socialLinks: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  creatorProfile: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface SerializedSubscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

interface SerializedFollow {
  id: string;
  creatorProfile: {
    id: string;
    username: string;
    displayName: string;
    coverImage: string;
    followerCount: number;
  };
}

interface SerializedPurchase {
  id: string;
  amount: number;
  itemName: string;
  creatorName: string;
  creatorUsername: string;
  createdAt: string;
}

interface SettingsProps {
  user: SerializedUser;
  creatorProfile: SerializedCreator | null;
  subscriptions: SerializedSubscription[];
  follows: SerializedFollow[];
  purchases: SerializedPurchase[];
}

type TabType = "profile" | "subscriptions" | "payment" | "billing";

export default function SettingsClient({
  user,
  creatorProfile,
  subscriptions,
  follows,
  purchases,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Form states
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.image);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Creator specific form states
  const [displayName, setDisplayName] = useState(creatorProfile?.displayName || "");
  const [username, setUsername] = useState(creatorProfile?.username || "");
  const [bio, setBio] = useState(creatorProfile?.bio || "");
  const [location, setLocation] = useState(creatorProfile?.location || "");
  const [coverImage, setCoverImage] = useState(creatorProfile?.coverImage || "");

  // Social Links state
  let initialSocials = { twitter: "", instagram: "", github: "", behance: "" };
  if (creatorProfile?.socialLinks) {
    try {
      const parsed = JSON.parse(creatorProfile.socialLinks);
      initialSocials = { ...initialSocials, ...parsed };
    } catch (e) {
      console.error(e);
    }
  }
  const [socials, setSocials] = useState(initialSocials);

  // Payments fields state
  const [stripeAccountId, setStripeAccountId] = useState(creatorProfile?.stripeAccountId || "");
  const [paypalEmail, setPaypalEmail] = useState(creatorProfile?.paypalEmail || "");
  const [wiseEmail, setWiseEmail] = useState(creatorProfile?.wiseEmail || "");
  const [bankDetails, setBankDetails] = useState(creatorProfile?.bankDetails || "");

  // Data lists states (for live updates in client component)
  const [liveSubscriptions, setLiveSubscriptions] = useState(subscriptions);
  const [liveFollows, setLiveFollows] = useState(follows);

  // Tab configurations
  const menuItems = [
    { id: "profile", label: "Profile Details", icon: User },
    { id: "subscriptions", label: "Subscriptions & Follows", icon: CreditCard },
    ...(user.role === "creator" ? [{ id: "payment", label: "Payout Gateways", icon: Globe }] : []),
    { id: "billing", label: "Billing & Purchases", icon: FileText },
  ] as { id: TabType; label: string; icon: any }[];

  // Form saving handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update general fan profile
      const userRes = await updateFanProfile({ name, image: avatar });
      if (!userRes.success) throw new Error("Could not update main user profile");

      // 2. If creator, update creator profile settings
      if (user.role === "creator" && creatorProfile) {
        const creatorRes = await updateCreatorProfileSettings({
          displayName,
          username,
          bio,
          location,
          coverImage,
          socialLinks: JSON.stringify(socials),
        });
        if (!creatorRes.success) throw new Error("Could not update creator settings");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updatePaymentSettings({
        stripeAccountId,
        paypalEmail,
        wiseEmail,
        bankDetails,
      });

      if (!res.success) throw new Error("Failed to update payout gateways");
      toast.success("Payout credentials updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Could not save payment setup.");
    } finally {
      setIsSaving(false);
    }
  };

  // Live action handlers (subscription cancellation / unfollowing)
  const handleCancelSub = async (subId: string, planName: string) => {
    if (confirm(`Are you sure you want to cancel your subscription to ${planName}?`)) {
      try {
        const res = await cancelFanSubscription(subId);
        if (res.success) {
          toast.success("Subscription canceled successfully.");
          setLiveSubscriptions(
            liveSubscriptions.map((sub) =>
              sub.id === subId
                ? { ...sub, status: "canceled", cancelAtPeriodEnd: true }
                : sub
            )
          );
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel subscription.");
      }
    }
  };

  const handleUnfollow = async (creatorId: string, displayName: string) => {
    if (confirm(`Unfollow ${displayName}?`)) {
      try {
        const res = await unfollowCreator(creatorId);
        if (res.success) {
          toast.success(`You unfollowed ${displayName}`);
          setLiveFollows(liveFollows.filter((f) => f.creatorProfile.id !== creatorId));
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to unfollow creator.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-text-muted mt-1">Configure profile details, subscriptions, payout methods, and billing receipt logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (lg:col-span-3) */}
        <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-lg shadow-primary/15"
                    : "text-text-muted hover:text-white bg-foreground/[0.02] border border-white/5 hover:border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Pane content (lg:col-span-9) */}
        <div className="lg:col-span-9">
          {/* PROFILE DETAILS TAB */}
          {activeTab === "profile" && (
            <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-8">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white">Profile Details</h3>
                <p className="text-xs text-text-muted">Manage your public information details and user representations.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Visual Avatar Grid */}
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-foreground/[0.01] p-5 rounded-2xl border border-white/5">
                  <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border border-white/10 bg-muted relative group cursor-pointer">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingAvatar(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: formData });
                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          if (data.success && data.url) {
                            setAvatar(data.url);
                            toast.success("Avatar uploaded successfully!");
                          }
                        } catch (err) {
                          toast.error("Failed to upload avatar");
                        } finally {
                          setIsUploadingAvatar(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <img 
                      src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
                      alt="Avatar" 
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isUploadingAvatar ? "filter blur-sm brightness-50" : ""}`} 
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-15">
                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-xs font-black uppercase text-text-muted tracking-wider">Profile Photo Avatar</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        readOnly
                        value={avatar}
                        placeholder="No custom photo uploaded yet"
                        className="w-full bg-foreground/[0.02] border border-white/5 text-text-muted/60 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed truncate"
                      />
                      <button
                        type="button"
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer relative border border-white/10 whitespace-nowrap"
                      >
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingAvatar(true);
                            try {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch("/api/upload", { method: "POST", body: formData });
                              if (!res.ok) throw new Error("Upload failed");
                              const data = await res.json();
                              if (data.success && data.url) {
                                setAvatar(data.url);
                                toast.success("Avatar uploaded successfully!");
                              }
                            } catch (err) {
                              toast.error("Failed to upload avatar");
                            } finally {
                              setIsUploadingAvatar(false);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-30"
                        />
                        {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Core parameters fields */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-muted tracking-wider">Account Display Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Hux"
                      className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-muted tracking-wider">Registered Email</label>
                    <input 
                      type="email" 
                      disabled
                      value={user.email}
                      className="w-full bg-foreground/[0.02] border border-white/5 text-text-muted/60 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Creator Specific Sections */}
                {user.role === "creator" && creatorProfile && (
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="border-b border-white/5 pb-3">
                      <h4 className="text-sm font-bold text-primary">Creator Profile Settings</h4>
                      <p className="text-[11px] text-text-muted">Configure bio elements, custom covers, handles, and category specs.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-text-muted tracking-wider">Profile Headline / Display Name</label>
                        <input 
                          type="text" 
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Sarah Hux"
                          className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-text-muted tracking-wider">Platform Username Handle</label>
                        <input 
                          type="text" 
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="sarahux"
                          className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-text-muted tracking-wider">Creator Cover Banner Image</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            readOnly
                            value={coverImage}
                            placeholder="No cover banner uploaded yet"
                            className="w-full bg-foreground/[0.02] border border-white/5 text-text-muted/60 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed truncate"
                          />
                          <button
                            type="button"
                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer relative border border-white/10 whitespace-nowrap"
                          >
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingCover(true);
                                try {
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  const res = await fetch("/api/upload", { method: "POST", body: formData });
                                  if (!res.ok) throw new Error("Upload failed");
                                  const data = await res.json();
                                  if (data.success && data.url) {
                                    setCoverImage(data.url);
                                    toast.success("Cover image uploaded successfully!");
                                  }
                                } catch (err) {
                                  toast.error("Failed to upload cover image");
                                } finally {
                                  setIsUploadingCover(false);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer z-30"
                            />
                            {isUploadingCover ? "Uploading..." : "Upload Cover"}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-text-muted tracking-wider">Base Location</label>
                        <input 
                          type="text" 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="New York, USA"
                          className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-text-muted tracking-wider">About/Biography Description</label>
                      <textarea 
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write something about your creative journey..."
                        className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Social links handles */}
                    <div className="space-y-4 pt-4">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5 text-primary" />
                        External Portfolio & Social Links
                      </h5>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {["twitter", "instagram", "github", "behance"].map((platform) => (
                          <div key={platform} className="space-y-1">
                            <label className="text-[10px] font-semibold text-text-muted uppercase capitalize">{platform}</label>
                            <input 
                              type="text" 
                              value={(socials as any)[platform]}
                              onChange={(e) => setSocials({ ...socials, [platform]: e.target.value })}
                              placeholder={`URL handle or username`}
                              className="w-full bg-[#09090b]/60 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary/40"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-primary/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving Settings..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUBSCRIPTIONS & FOLLOWS TAB */}
          {activeTab === "subscriptions" && (
            <div className="space-y-8">
              {/* Memberships segment */}
              <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-lg font-bold text-white">Active Memberships</h3>
                  <p className="text-xs text-text-muted">Manage your paid monthly subscription levels and access tiers.</p>
                </div>

                {liveSubscriptions.length === 0 ? (
                  <div className="text-center py-8 bg-foreground/[0.01] rounded-2xl border border-dashed border-white/5">
                    <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-xs text-text-muted">You do not have any active memberships.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveSubscriptions.map((sub) => (
                      <div 
                        key={sub.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-foreground/[0.02] border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary tracking-wider">
                            {sub.plan.name} Tier
                          </span>
                          <h4 className="font-bold text-white text-sm">
                            {sub.plan.creatorProfile.displayName} 
                            <span className="text-xs text-text-muted font-normal"> (@{sub.plan.creatorProfile.username})</span>
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <span>Price: ${sub.plan.price}/mo</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <span>Expires: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div>
                          {sub.status === "canceled" || sub.cancelAtPeriodEnd ? (
                            <span className="text-xs text-yellow-500 font-bold bg-yellow-500/10 px-3.5 py-1.5 rounded-xl border border-yellow-500/20">
                              Cancelling at end of bill cycle
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCancelSub(sub.id, sub.plan.name)}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              Cancel Subscription
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Follows segment */}
              <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-lg font-bold text-white">Creators Followed</h3>
                  <p className="text-xs text-text-muted">Explore updates and notifications from creator profiles you follow.</p>
                </div>

                {liveFollows.length === 0 ? (
                  <div className="text-center py-8 bg-foreground/[0.01] rounded-2xl border border-dashed border-white/5">
                    <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-xs text-text-muted">You do not follow any creators yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {liveFollows.map((f) => (
                      <div 
                        key={f.id}
                        className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-foreground/[0.02] border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white/5">
                            <img 
                              src={f.creatorProfile.coverImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} 
                              alt={f.creatorProfile.displayName} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-xs truncate leading-none mb-1">{f.creatorProfile.displayName}</h4>
                            <p className="text-[10px] text-text-muted leading-none">@{f.creatorProfile.username}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnfollow(f.creatorProfile.id, f.creatorProfile.displayName)}
                          className="p-2 text-text-muted hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all cursor-pointer"
                          title="Unfollow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYOUT GATEWAYS TAB */}
          {activeTab === "payment" && user.role === "creator" && (
            <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white">Payout Gateways</h3>
                <p className="text-xs text-text-muted">Configure Stripe, PayPal, Wise, or Direct Bank setups to withdraw your net earnings.</p>
              </div>

              <form onSubmit={handleSavePayments} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-muted tracking-wider">Stripe Account ID</label>
                    <input 
                      type="text" 
                      value={stripeAccountId}
                      onChange={(e) => setStripeAccountId(e.target.value)}
                      placeholder="acct_1..."
                      className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-text-muted tracking-wider">PayPal Email Address</label>
                    <input 
                      type="email" 
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="paypal@yourdomain.com"
                      className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-muted tracking-wider">Wise Account Email</label>
                  <input 
                    type="email" 
                    value={wiseEmail}
                    onChange={(e) => setWiseEmail(e.target.value)}
                    placeholder="wise@yourdomain.com"
                    className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-muted tracking-wider">Direct Bank Routing Details</label>
                  <textarea 
                    rows={4}
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder="Bank Name: Chase Bank&#10;Routing Number: 123456789&#10;Account Number: 987654321"
                    className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-primary/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving credentials..." : "Update Gateways"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BILLING & PURCHASES TAB */}
          {activeTab === "billing" && (
            <div className="glass-card-static p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white">Purchase & Billing History</h3>
                <p className="text-xs text-text-muted">Auditing log list of all direct content unlocks, subscriptions bills, and creator tips.</p>
              </div>

              {purchases.length === 0 ? (
                <div className="text-center py-8 bg-foreground/[0.01] rounded-2xl border border-dashed border-white/5">
                  <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-xs text-text-muted">You do not have any past purchases recorded on your profile.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-wider">
                        <th className="py-3 px-4">Item Details</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4">Receipt Date</th>
                        <th className="py-3 px-4 text-right">Charged Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/90">
                      {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-3.5 px-4 font-bold">{p.itemName}</td>
                          <td className="py-3.5 px-4">
                            {p.creatorUsername ? (
                              <span>{p.creatorName} <span className="text-[10px] text-text-muted font-normal">(@{p.creatorUsername})</span></span>
                            ) : (
                              <span>{p.creatorName}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-right font-black text-primary">${p.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
