"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Star, MapPin, User, Mail, Grid, Heart, Calendar, Lock, Unlock, Eye, Sparkles, Check, Send } from "lucide-react";
import Link from "next/link";

interface PostMedia {
  id: string;
  type: string;
  url: string;
  previewUrl: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string | null;
  visibility: string;
  price: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  media: PostMedia[];
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  benefits: string[];
}

interface CreatorProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  coverImage: string | null;
  followerCount: number;
  subscriberCount: number;
  postCount: number;
  isVerified: boolean;
  createdAt: string;
  plans: Plan[];
  posts: Post[];
  user: {
    image: string | null;
  };
}

export default function ProfileClient({ creator }: { creator: CreatorProfileData }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "plans" | "about">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(creator.followerCount);
  const [purchasedPosts, setPurchasedPosts] = useState<string[]>([]);
  const [subscribedPlans, setSubscribedPlans] = useState<string[]>([]);

  // Simulation handlers
  const handleFollow = () => {
    if (isFollowing) {
      setFollowers((prev) => prev - 1);
    } else {
      setFollowers((prev) => prev + 1);
    }
    setIsFollowing(!isFollowing);
  };

  const handleSubscribe = (planId: string, planName: string) => {
    if (subscribedPlans.includes(planId)) {
      setSubscribedPlans(subscribedPlans.filter((id) => id !== planId));
      alert(`Unsubscribed from ${planName}`);
    } else {
      setSubscribedPlans([...subscribedPlans, planId]);
      alert(`Subscribed to ${planName}! (Simulated Payment Complete)`);
    }
  };

  const handleUnlockPost = (postId: string, price: number) => {
    if (confirm(`Unlock this premium post for $${price}? (Simulated Payment)`)) {
      setPurchasedPosts([...purchasedPosts, postId]);
    }
  };

  // Visibility logic
  const isPostUnlocked = (post: Post) => {
    if (post.visibility === "public") return true;
    if (post.visibility === "followers" && (isFollowing || subscribedPlans.length > 0)) return true;
    if (post.visibility === "subscribers" && subscribedPlans.length > 0) return true;
    if (post.visibility === "locked" && purchasedPosts.includes(post.id)) return true;
    return false;
  };

  const mediaPosts = creator.posts.filter((p) => p.media.length > 0);

  return (
    <div className="min-h-screen pb-16 bg-[#09090b]">
      {/* Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={creator.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"}
          alt="Creator cover"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
        {/* Header Area */}
        <div className="bg-card/70 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card bg-card overflow-hidden shrink-0 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                  alt={creator.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{creator.displayName}</h1>
                  {creator.isVerified && <Star className="w-5 h-5 fill-primary text-primary shrink-0" />}
                </div>
                <p className="text-sm text-text-muted mb-3">@{creator.username}</p>

                {creator.location && (
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <MapPin className="w-3.5 h-3.5" />
                    {creator.location}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={handleFollow}
                className={`flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.01] ${
                  isFollowing
                    ? "border border-white/10 text-white bg-white/5 hover:bg-white/10"
                    : "bg-white text-[#09090b] hover:bg-white/90"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              <Link
                href={`/messages?chat=${creator.id}`}
                className="p-2.5 text-text-muted hover:text-white rounded-full bg-white/5 border border-white/15 transition-all hover:scale-[1.02]"
              >
                <Send className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 mt-6 pt-6 text-center max-w-sm">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase">Followers</p>
              <p className="font-extrabold text-white text-base mt-0.5">{followers}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase">Subscribers</p>
              <p className="font-extrabold text-white text-base mt-0.5">{creator.subscriberCount}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase">Posts</p>
              <p className="font-extrabold text-white text-base mt-0.5">{creator.posts.length}</p>
            </div>
          </div>

          {/* Bio Description */}
          {creator.bio && (
            <p className="text-sm text-text-muted mt-6 leading-relaxed border-t border-white/5 pt-6">
              {creator.bio}
            </p>
          )}
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-white/5 gap-6 mb-8 overflow-x-auto pb-px">
          {["posts", "media", "plans", "about"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-sm font-bold pb-4 border-b-2 capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-white"
              }`}
            >
              {tab === "posts"
                ? "Posts"
                : tab === "media"
                ? "Photos & Videos"
                : tab === "plans"
                ? "Memberships"
                : "About"}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "posts" && (
          <div className="space-y-6 max-w-3xl">
            {creator.posts.length === 0 ? (
              <div className="text-center py-12 glassmorphism rounded-2xl border border-white/5">
                <Grid className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Posts Yet</h3>
                <p className="text-xs text-text-muted">This creator has not published any posts.</p>
              </div>
            ) : (
              creator.posts.map((post) => {
                const unlocked = isPostUnlocked(post);
                return (
                  <div
                    key={post.id}
                    className="bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">{post.title}</h3>
                        <p className="text-xs text-text-muted">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Visibility Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 ${
                          post.visibility === "public"
                            ? "bg-green-500/10 text-green-400"
                            : post.visibility === "followers"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-pink-500/10 text-primary"
                        }`}
                      >
                        {unlocked ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            {post.visibility}
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 animate-pulse" />
                            {post.visibility}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Post Content */}
                    {unlocked ? (
                      <div>
                        {post.content && (
                          <p className="text-sm text-white/90 mb-5 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>
                        )}

                        {post.media.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {post.media.map((med) => (
                              <div
                                key={med.id}
                                className="relative rounded-xl overflow-hidden aspect-video border border-white/5 bg-[#121214]"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={med.url}
                                  alt="Media"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Locked Post Overlay */
                      <div className="relative p-8 rounded-xl bg-white/5 border border-white/5 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[#18181b]/90 backdrop-blur-md flex flex-col justify-center items-center p-6">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="font-bold text-white text-base mb-1.5">Locked Premium Post</h4>
                          <p className="text-xs text-text-muted mb-5 max-w-sm leading-relaxed">
                            {post.visibility === "followers"
                              ? "Become a follower or join a membership plan to unlock this post."
                              : post.visibility === "subscribers"
                              ? "Subscribe to a membership plan to access this exclusive post."
                              : `Purchase this locked content post individually for $${post.price}.`}
                          </p>

                          {post.visibility === "locked" ? (
                            <button
                              onClick={() => handleUnlockPost(post.id, post.price)}
                              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-primary/15"
                            >
                              Unlock Post for ${post.price}
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTab("plans")}
                              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-primary/15"
                            >
                              View Membership Plans
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-5 mt-6 border-t border-white/5 pt-4 text-text-muted text-xs">
                      <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                        <Heart className="w-4 h-4" />
                        {post.likesCount}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Mail className="w-4 h-4" />
                        {post.commentsCount} Comments
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-6">
            {mediaPosts.length === 0 ? (
              <div className="text-center py-12 glassmorphism rounded-2xl border border-white/5">
                <Eye className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Photos or Videos</h3>
                <p className="text-xs text-text-muted">This creator has not uploaded any posts containing media files.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaPosts.map((post) => {
                  const unlocked = isPostUnlocked(post);
                  return (
                    <div
                      key={post.id}
                      className="relative group rounded-xl overflow-hidden aspect-square border border-white/5 bg-[#121214] cursor-pointer"
                      onClick={() => {
                        if (!unlocked) {
                          if (post.visibility === "locked") {
                            handleUnlockPost(post.id, post.price);
                          } else {
                            setActiveTab("plans");
                          }
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.media[0].url}
                        alt={post.title}
                        className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 ${
                          !unlocked ? "filter blur-lg brightness-50" : ""
                        }`}
                      />
                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "plans" && (
          <div>
            {creator.plans.length === 0 ? (
              <div className="text-center py-12 glassmorphism rounded-2xl border border-white/5 max-w-3xl">
                <Sparkles className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Membership Tiers Configured</h3>
                <p className="text-xs text-text-muted">This creator has not set up any subscription packages yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
                {creator.plans.map((plan) => {
                  const isSubbed = subscribedPlans.includes(plan.id);
                  return (
                    <div
                      key={plan.id}
                      className={`bg-card border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
                        isSubbed ? "border-primary" : "border-white/5"
                      }`}
                    >
                      {isSubbed && (
                        <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-extrabold uppercase px-3.5 py-1.5 rounded-bl-xl tracking-wider">
                          Active Member
                        </div>
                      )}

                      <h3 className="font-extrabold text-white text-xl mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="text-2xl font-black text-primary">${plan.price}</span>
                        <span className="text-xs text-text-muted font-semibold">/ month</span>
                      </div>

                      {plan.description && (
                        <p className="text-xs text-text-muted leading-relaxed mb-6 border-b border-white/5 pb-4">
                          {plan.description}
                        </p>
                      )}

                      <ul className="space-y-3 mb-8">
                        {plan.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-tight">
                            <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubscribe(plan.id, plan.name)}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
                          isSubbed
                            ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                            : "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/10"
                        }`}
                      >
                        {isSubbed ? "Cancel Membership" : "Join Membership Tier"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-3xl glassmorphism rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold text-white text-lg mb-4">About Creator</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              {creator.bio || "No information details added."}
            </p>
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-xs text-text-muted">
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-text-muted">Location</p>
                <p className="text-white text-sm mt-1">{creator.location || "Not specified"}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-text-muted">Member Since</p>
                <p className="text-white text-sm mt-1">
                  {new Date(creator.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
