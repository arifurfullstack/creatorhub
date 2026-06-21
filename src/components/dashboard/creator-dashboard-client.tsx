"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/post";
import { createPlan } from "@/app/actions/plan";
import { createWithdrawalRequest } from "@/app/actions/withdrawal";
import { BarChart3, Plus, CreditCard, Send, Settings, BookOpen, UserCheck, RefreshCcw, DollarSign, ListFilter, Trash2, CheckCircle, Image as ImageIcon } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  benefits: string[];
}

interface Post {
  id: string;
  title: string;
  visibility: string;
  price: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface CreatorProfileData {
  id: string;
  username: string;
  displayName: string;
  plans: Plan[];
  posts: Post[];
  withdrawals: Withdrawal[];
}

export default function CreatorDashboardClient({
  creator,
}: {
  creator: CreatorProfileData;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "membership" | "payouts">("overview");

  // Post form state
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState("public");
  const [postPrice, setPostPrice] = useState(0);
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");

  // Plan form state
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(0);
  const [planDescription, setPlanDescription] = useState("");
  const [planBenefits, setPlanBenefits] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");

  // Withdrawal form state
  const [wAmount, setWAmount] = useState(0);
  const [wMethod, setWMethod] = useState("bank_transfer");
  const [wDetails, setWDetails] = useState("");
  const [wLoading, setWLoading] = useState(false);
  const [wError, setWError] = useState("");

  // Simulated list states (for instant feedback without reloading)
  const [localPosts, setLocalPosts] = useState<Post[]>(creator.posts);
  const [localPlans, setLocalPlans] = useState<Plan[]>(creator.plans);
  const [localWithdrawals, setLocalWithdrawals] = useState<Withdrawal[]>(creator.withdrawals);

  // Handlers
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostLoading(true);
    setPostError("");

    try {
      const response = await createPost({
        title: postTitle,
        content: postContent,
        visibility: postVisibility,
        price: postPrice,
        mediaUrl: postMediaUrl || undefined,
      });

      if (response.success) {
        // Add locally to list for display
        const newPost: Post = {
          id: Math.random().toString(),
          title: postTitle,
          visibility: postVisibility,
          price: postVisibility === "locked" ? postPrice : 0,
          likesCount: 0,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
        };
        setLocalPosts([newPost, ...localPosts]);
        
        // Reset form
        setPostTitle("");
        setPostContent("");
        setPostVisibility("public");
        setPostPrice(0);
        setPostMediaUrl("");
        alert("Post published successfully!");
      }
    } catch (err: any) {
      setPostError(err?.message || "Failed to create post");
    } finally {
      setPostLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanError("");

    try {
      const benefitsArray = planBenefits.split("\n").filter((b) => b.trim() !== "");
      const response = await createPlan({
        name: planName,
        price: planPrice,
        description: planDescription,
        benefits: benefitsArray,
      });

      if (response.success && response.plan) {
        setLocalPlans([...localPlans, response.plan as any]);
        setPlanName("");
        setPlanPrice(0);
        setPlanDescription("");
        setPlanBenefits("");
        alert("Membership Plan Tier created successfully!");
      }
    } catch (err: any) {
      setPlanError(err?.message || "Failed to create plan");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleCreateWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWLoading(true);
    setWError("");

    try {
      const response = await createWithdrawalRequest({
        amount: wAmount,
        method: wMethod,
        details: wDetails,
      });

      if (response.success && response.request) {
        setLocalWithdrawals([response.request as any, ...localWithdrawals]);
        setWAmount(0);
        setWDetails("");
        alert("Payout request submitted successfully!");
      }
    } catch (err: any) {
      setWError(err?.message || "Failed to request payout");
    } finally {
      setWLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <aside className="w-full md:w-64 bg-card border-r border-white/5 p-6 shrink-0">
        <div className="mb-8">
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Workspace</p>
          <h2 className="text-lg font-extrabold text-white mt-1">{creator.displayName}</h2>
          <p className="text-xs text-primary font-medium mt-0.5">@{creator.username}</p>
        </div>

        <nav className="space-y-1.5">
          {[
            { id: "overview", label: "Overview & Stats", icon: BarChart3 },
            { id: "content", label: "Content Manager", icon: BookOpen },
            { id: "membership", label: "Membership Tiers", icon: UserCheck },
            { id: "payouts", label: "Payouts & History", icon: CreditCard },
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

      {/* Main Workspace Panels */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-x-hidden">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analytics Overview</h1>
                <p className="text-xs text-text-muted mt-1">Real-time stats from memberships and sales</p>
              </div>
              <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors">
                <RefreshCcw className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Earnings", value: "$340.00", sub: "+12% vs yesterday", color: "text-primary" },
                { label: "Monthly Income", value: "$4,820.00", sub: "Est. renewal rate 94%", color: "text-white" },
                { label: "Active Members", value: "148", sub: "+4 new this week", color: "text-white" },
                { label: "Unlock Purchases", value: "32", sub: "$10.00 average price", color: "text-white" },
              ].map((card, i) => (
                <div key={i} className="bg-card border border-white/5 p-5 rounded-2xl">
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{card.label}</p>
                  <p className={`text-2xl font-black mt-2 ${card.color}`}>{card.value}</p>
                  <p className="text-[10px] text-text-muted mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Simulated bar graph */}
            <div className="bg-card border border-white/5 p-6 rounded-2xl">
              <h3 className="font-bold text-white text-base mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Revenue Analytics (Last 6 Months)
              </h3>
              <div className="h-64 flex items-end justify-between gap-2.5 pt-4 px-2">
                {[
                  { month: "Jan", amount: 2100, height: "35%" },
                  { month: "Feb", amount: 2800, height: "45%" },
                  { month: "Mar", amount: 3500, height: "55%" },
                  { month: "Apr", amount: 3100, height: "50%" },
                  { month: "May", amount: 4200, height: "70%" },
                  { month: "Jun", amount: 4820, height: "80%" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-pointer">
                    <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      ${bar.amount}
                    </div>
                    <div
                      style={{ height: bar.height }}
                      className="w-full bg-gradient-to-t from-secondary to-primary rounded-t-lg group-hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,79,163,0.15)]"
                    />
                    <div className="text-xs text-text-muted font-semibold">{bar.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Manager Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Content Hub</h1>
                <p className="text-xs text-text-muted mt-1">Publish new public or gated posts</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Upload form */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl lg:col-span-1">
                <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Publish Post
                </h3>

                {postError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {postError}
                  </div>
                )}

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Post Title
                    </label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Workflow Breakdown"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Description / Body
                    </label>
                    <textarea
                      required
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your markdown description..."
                      rows={4}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-sm text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Media Attachment (URL)
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={postMediaUrl}
                        onChange={(e) => setPostMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Visibility
                      </label>
                      <select
                        value={postVisibility}
                        onChange={(e) => setPostVisibility(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#222226] border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white"
                      >
                        <option value="public">Public</option>
                        <option value="followers">Followers</option>
                        <option value="subscribers">Subscribers</option>
                        <option value="locked">Locked (Paid)</option>
                      </select>
                    </div>

                    {postVisibility === "locked" && (
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Price (USD)
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={postPrice}
                          onChange={(e) => setPostPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={postLoading}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all mt-2"
                  >
                    {postLoading ? "Publishing..." : "Publish Post"}
                  </button>
                </form>
              </div>

              {/* Posts List */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-4">
                <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-primary" />
                  Your Published Posts ({localPosts.length})
                </h3>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {localPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="truncate">
                        <h4 className="font-bold text-white text-sm truncate">{post.title}</h4>
                        <p className="text-[10px] text-text-muted mt-1">
                          {new Date(post.createdAt).toLocaleDateString()} &bull;{" "}
                          <span className="capitalize">{post.visibility}</span>{" "}
                          {post.price > 0 && `($${post.price})`}
                        </p>
                      </div>

                      <button className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Membership Plan Manager */}
        {activeTab === "membership" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Memberships Manager</h1>
                <p className="text-xs text-text-muted mt-1">Configure subscriber levels and pricing tiers</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Add plan tier form */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl lg:col-span-1">
                <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add Plan Tier
                </h3>

                {planError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {planError}
                  </div>
                )}

                <form onSubmit={handleCreatePlan} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Tier Name
                    </label>
                    <input
                      type="text"
                      required
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="e.g. VIP Backstage"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Monthly Price (USD)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planPrice}
                      onChange={(e) => setPlanPrice(Number(e.target.value))}
                      placeholder="15"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="Access to premium files and priority DMs"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Tier Benefits (One per line)
                    </label>
                    <textarea
                      required
                      value={planBenefits}
                      onChange={(e) => setPlanBenefits(e.target.value)}
                      placeholder="Download files (.blend/.psd)&#10;Direct priority messaging&#10;Monthly video live call"
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-xs text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={planLoading}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all mt-2"
                  >
                    {planLoading ? "Saving..." : "Create Plan"}
                  </button>
                </form>
              </div>

              {/* Tiers List */}
              <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                {localPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-card border border-white/5 p-6 rounded-2xl relative"
                  >
                    <h4 className="font-extrabold text-white text-base mb-1">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-lg font-black text-primary">${plan.price}</span>
                      <span className="text-[10px] text-text-muted">/month</span>
                    </div>

                    {plan.description && (
                      <p className="text-xs text-text-muted mb-4 border-b border-white/5 pb-3">
                        {plan.description}
                      </p>
                    )}

                    <ul className="space-y-2">
                      {plan.benefits.map((ben, idx) => (
                        <li key={idx} className="text-xs text-white/90 flex items-start gap-1.5">
                          <span className="text-green-400 shrink-0">&#10003;</span>
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Withdrawal Requests</h1>
                <p className="text-xs text-text-muted mt-1">Submit earnings withdrawal requests</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Request form */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl lg:col-span-1">
                <h3 className="font-bold text-white text-base mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Request Payout
                </h3>

                {wError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {wError}
                  </div>
                )}

                <form onSubmit={handleCreateWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Withdrawal Amount (Min. $50)
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={wAmount}
                      onChange={(e) => setWAmount(Number(e.target.value))}
                      placeholder="100"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none transition-all text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Method
                    </label>
                    <select
                      value={wMethod}
                      onChange={(e) => setWMethod(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#222226] border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="wise">Wise Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Payment Account Details
                    </label>
                    <textarea
                      required
                      value={wDetails}
                      onChange={(e) => setWDetails(e.target.value)}
                      placeholder="IBAN / Account Number / Wise Email Address..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={wLoading}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all mt-2"
                  >
                    {wLoading ? "Submitting..." : "Submit Payout Request"}
                  </button>
                </form>
              </div>

              {/* History list */}
              <div className="bg-card border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-4">
                <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Payout Requests History
                </h3>

                <div className="space-y-3">
                  {localWithdrawals.length === 0 ? (
                    <p className="text-xs text-text-muted py-6 text-center">No withdrawal requests found.</p>
                  ) : (
                    localWithdrawals.map((w) => (
                      <div
                        key={w.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">${w.amount}</p>
                          <p className="text-[10px] text-text-muted mt-1 uppercase">
                            Method: {w.method.replace("_", " ")} &bull;{" "}
                            {new Date(w.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            w.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : w.status === "approved"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
