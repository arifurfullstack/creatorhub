"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { 
  Star, 
  MapPin, 
  User, 
  Mail, 
  Grid, 
  Heart, 
  Calendar, 
  Lock, 
  Unlock, 
  Eye, 
  Sparkles, 
  Check, 
  Send, 
  Volume2, 
  Laptop, 
  Award, 
  Cpu, 
  Layers, 
  Globe, 
  ExternalLink, 
  ArrowRight, 
  X, 
  MessageSquare,
  DollarSign,
  Share2,
  FileText,
  Camera,
  Save
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import ImageLightbox from "@/components/shared/image-lightbox";
import VideoPlayer from "@/components/shared/video-player";

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

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface Project {
  title: string;
  description: string;
  role: string;
  skills: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
}

interface CreatorProfileData {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  coverImage: string | null;
  socialLinks: string | null;
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

interface CommentEntry {
  id: string;
  user: string;
  text: string;
  date: string;
}

export default function ProfileClient({
  creator,
  initialIsFollowing = false,
}: {
  creator: CreatorProfileData;
  initialIsFollowing?: boolean;
}) {
  const { data: sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "plans" | "about" | "portfolio">("posts");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Profile Photo Edit States
  const [avatarImage, setAvatarImage] = useState(creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(avatarImage);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isOwner = sessionData?.user?.id === creator.userId;

  // Sync state if the user updates it from settings or other places
  useEffect(() => {
    if (creator.user.image) {
      setAvatarImage(creator.user.image);
      setTempAvatar(creator.user.image);
    }
  }, [creator.user.image]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setTempAvatar(localUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image.");
      }

      const data = await response.json();
      if (data.success && data.url) {
        setTempAvatar(data.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Invalid response from upload server.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error uploading file.");
      setTempAvatar(avatarImage);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  const handleSaveAvatar = async () => {
    if (isUploading) {
      toast.warning("Please wait for the image upload to complete.");
      return;
    }
    setIsSaving(true);
    try {
      const { updateFanProfile } = await import("@/app/actions/fan");
      const res = await updateFanProfile({
        name: sessionData?.user?.name || creator.displayName,
        image: tempAvatar
      });
      if (res.success) {
        setAvatarImage(tempAvatar);
        setAvatarModalOpen(false);
        toast.success("Profile photo updated successfully!");
      } else {
        throw new Error("Could not update profile photo.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile photo.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Simulated Interactive States
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followers, setFollowers] = useState(creator.followerCount);
  const [purchasedPosts, setPurchasedPosts] = useState<string[]>([]);
  const [subscribedPlans, setSubscribedPlans] = useState<string[]>([]);
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({});
  
  // Instagram Lightbox State
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);

  // Fullscreen Image Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string; title?: string; description?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Interactive Comments State
  const [postComments, setPostComments] = useState<Record<string, CommentEntry[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Initialize likes states for all posts
  useEffect(() => {
    const initialLikes: Record<string, { count: number; liked: boolean }> = {};
    creator.posts.forEach((post) => {
      initialLikes[post.id] = { count: post.likesCount, liked: false };
    });
    setLikesState(initialLikes);

    // Initial mock comments for engagement simulation
    const initialComments: Record<string, CommentEntry[]> = {};
    creator.posts.forEach((post, idx) => {
      initialComments[post.id] = [
        { id: `c-1-${post.id}`, user: "Alex Mercer", text: "This looks absolutely premium! 🔥", date: "2h ago" },
        { id: `c-2-${post.id}`, user: "Jessica Miller", text: "Stunning colors and layouts here.", date: "1h ago" }
      ];
    });
    setPostComments(initialComments);
  }, [creator.posts]);

  // Simulation handlers
  const handleFollow = async () => {
    if (!sessionData?.user) {
      toast.error("You must be logged in to follow a creator");
      return;
    }

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowers((prev) => (nextState ? prev + 1 : prev - 1));

    try {
      const { followCreator, unfollowCreator } = await import("@/app/actions/fan");
      if (isFollowing) {
        const res = await unfollowCreator(creator.id);
        if (res.success) {
          toast.info(`You unfollowed ${creator.displayName}`);
        } else {
          throw new Error("Failed to unfollow");
        }
      } else {
        const res = await followCreator(creator.id);
        if (res.success) {
          toast.success(`You followed ${creator.displayName}!`);
        } else {
          throw new Error("Failed to follow");
        }
      }
    } catch (err) {
      // Revert optimistic update
      setIsFollowing(isFollowing);
      setFollowers((prev) => (isFollowing ? prev + 1 : prev - 1));
      const errMsg = err instanceof Error ? err.message : "An error occurred";
      toast.error(errMsg);
    }
  };

  const handleSubscribe = (planId: string, planName: string) => {
    if (subscribedPlans.includes(planId)) {
      setSubscribedPlans(subscribedPlans.filter((id) => id !== planId));
      toast.info(`Unsubscribed from ${planName}`);
    } else {
      setSubscribedPlans([...subscribedPlans, planId]);
      toast.success(`Subscribed to ${planName}! (Simulated Payment Complete)`);
    }
  };

  const handleUnlockPost = (postId: string, price: number) => {
    if (confirm(`Unlock this premium post for $${price}? (Simulated Payment)`)) {
      setPurchasedPosts([...purchasedPosts, postId]);
      toast.success("Content unlocked successfully!");
    }
  };

  const handleLikePost = (postId: string) => {
    const postLike = likesState[postId] || { count: 0, liked: false };
    if (postLike.liked) {
      setLikesState({
        ...likesState,
        [postId]: { count: postLike.count - 1, liked: false }
      });
    } else {
      setLikesState({
        ...likesState,
        [postId]: { count: postLike.count + 1, liked: true }
      });
    }
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment: CommentEntry = {
      id: Math.random().toString(),
      user: sessionData?.user?.name || "Anonymous Fan",
      text: commentInput,
      date: "Just now",
    };
    const current = postComments[postId] || [];
    setPostComments({ ...postComments, [postId]: [...current, newComment] });
    setCommentInput("");
    toast.success("Comment posted!");
  };

  // Visibility checks
  const isPostUnlocked = (post: Post) => {
    if (isOwner) return true;
    if (post.visibility === "public") return true;
    if (post.visibility === "followers" && (isFollowing || subscribedPlans.length > 0)) return true;
    if (post.visibility === "subscribers" && subscribedPlans.length > 0) return true;
    if (post.visibility === "locked" && purchasedPosts.includes(post.id)) return true;
    return false;
  };

  // Parse social links, skills, and projects
  let parsedSocial: {
    github?: string;
    twitter?: string;
    dribbble?: string;
    behance?: string;
    skills?: Skill[];
    projects?: Project[];
  } = {};

  if (creator.socialLinks) {
    try {
      parsedSocial = JSON.parse(creator.socialLinks);
    } catch (e) {
      console.error("Error parsing socialLinks JSON", e);
    }
  }

  const hasPortfolio = !!(parsedSocial.skills?.length || parsedSocial.projects?.length);
  
  // Tab configuration
  const tabs = [
    { id: "posts", label: "Timeline Feed", icon: FileText },
    { id: "media", label: "Media Grid", icon: Grid },
    { id: "plans", label: "Memberships", icon: Award },
    { id: "about", label: "Info & Socials", icon: Eye },
    ...(hasPortfolio ? [{ id: "portfolio", label: "Portfolio & Skills", icon: Laptop }] : [])
  ] as { id: typeof activeTab; label: string; icon: any }[];

  const mediaPosts = creator.posts.filter((p) => p.media.length > 0);
  
  // Find cheapest plan to drive OnlyFans-style sidebar CTAs
  const cheapestPlan = creator.plans.length > 0
    ? creator.plans.reduce((prev, curr) => prev.price < curr.price ? prev : curr)
    : null;

  return (
    <div className="min-h-screen pb-16 bg-[#09090b] relative overflow-hidden">
      {/* Background Liquid Mesh Evolved */}
      <div className="liquid-mesh-container">
        <div className="liquid-mesh-blob liquid-mesh-blob-1" />
        <div className="liquid-mesh-blob liquid-mesh-blob-2" />
        <div className="liquid-mesh-blob liquid-mesh-blob-3" />
      </div>

      {/* Facebook-Style Wide Header Cover Banner */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden border-b border-white/5">
        <motion.img
          initial={{ scale: 1.05, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src={creator.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"}
          alt="Creator cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/40" />
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24">
        {/* OnlyFans-Style Split Header Area (Grid 12 cols) */}
        <div className="glass-card-static p-6 sm:p-8 rounded-3xl shadow-2xl mb-8 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Header area (8 cols): Info, Avatar, Bios, Stats */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                {/* Avatar wrapper for absolute badge positioning */}
                <div className="relative shrink-0 select-none">
                  <div 
                    onClick={() => isOwner && setAvatarModalOpen(true)}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card bg-card overflow-hidden shadow-2xl -mt-16 sm:-mt-20 relative group transition-all ${
                      isOwner ? "cursor-pointer hover:border-primary/50" : ""
                    }`}
                    title={isOwner ? "Change profile photo" : undefined}
                  >
                    <img
                      src={avatarImage}
                      alt={creator.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isOwner && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setAvatarModalOpen(true)}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary-hover border-2 border-card flex items-center justify-center text-white shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95 z-20"
                      title="Change profile photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">{creator.displayName}</h1>
                    {creator.isVerified && <Star className="w-5 h-5 fill-primary text-primary shrink-0" />}
                  </div>
                  <p className="text-sm font-semibold text-text-muted mb-3">@{creator.username}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-muted">
                    {creator.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {creator.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(creator.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Counters Strip (Instagram/OnlyFans Style) */}
              <div className="flex justify-center sm:justify-start gap-8 border-t border-b border-white/5 py-4 text-center sm:text-left">
                <div>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-wider">Posts</p>
                  <p className="font-extrabold text-white text-base mt-0.5">{creator.posts.length}</p>
                </div>
                <div className="h-8 w-[1px] bg-white/5 self-center" />
                <div>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-wider">Followers</p>
                  <p className="font-extrabold text-white text-base mt-0.5">{followers}</p>
                </div>
                <div className="h-8 w-[1px] bg-white/5 self-center" />
                <div>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-wider">Subscribers</p>
                  <p className="font-extrabold text-white text-base mt-0.5">{creator.subscriberCount}</p>
                </div>
              </div>

              {/* Biography Description */}
              {creator.bio && (
                <div className="text-sm text-white/90 leading-relaxed pt-2">
                  <p className="whitespace-pre-line">{creator.bio}</p>
                </div>
              )}

              {/* Action pills follow/message/settings */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isOwner ? (
                  <>
                    <Link
                      href="/settings"
                      className="px-6 py-2.5 bg-white text-[#09090b] hover:bg-white/90 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-[0.98]"
                    >
                      Edit Profile Settings
                    </Link>
                    <Link
                      href="/dashboard/creator"
                      className="px-6 py-2.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-white border border-white/10 rounded-xl text-xs font-black transition-all"
                    >
                      Creator Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none active:scale-[0.98] ${
                        isFollowing
                          ? "border border-white/10 text-white bg-white/5 hover:bg-white/10"
                          : "bg-white text-[#09090b] hover:bg-white/90"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow Profile"}
                    </button>
                    <Link
                      href={`/messages?chat=${creator.userId}`}
                      className="px-6 py-2.5 bg-foreground/[0.04] hover:bg-foreground/[0.08] text-white border border-white/10 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-text-muted" />
                      Message
                    </Link>
                    <button 
                      onClick={() => toast.success("Tip sent! (Simulated payment)")}
                      className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Send Tip
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Header Area (4 cols): OnlyFans-Style Subscribe Call-to-action or Creator Control Widget */}
            <div className="lg:col-span-4 w-full lg:sticky lg:top-24">
              {isOwner ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">Channel Owner</span>
                      <h4 className="font-extrabold text-white text-base mt-2">Your Profile Channel</h4>
                    </div>
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    This is how your profile appears to the public. You can manage your posts, subscribers, and details from your creator console.
                  </p>

                  <Link
                    href="/dashboard/creator"
                    className="block w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 cursor-pointer text-center animate-glow"
                  >
                    Go to Creator Console
                  </Link>
                </div>
              ) : cheapestPlan ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">VIP Access</span>
                      <h4 className="font-extrabold text-white text-base mt-2">Subscribe to Access</h4>
                    </div>
                    <Award className="w-6 h-6 text-primary animate-pulse" />
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">${cheapestPlan.price}</span>
                    <span className="text-xs text-text-muted">/ month</span>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Unlock all premium posts, high-resolution media galleries, and priority direct chats.
                  </p>

                  <button
                    onClick={() => {
                      if (subscribedPlans.length > 0) {
                        setActiveTab("plans");
                      } else {
                        handleSubscribe(cheapestPlan.id, cheapestPlan.name);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 cursor-pointer text-center"
                  >
                    {subscribedPlans.includes(cheapestPlan.id) ? "Active VIP Member" : "Join Channel for Subscription"}
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 text-center">
                  <Sparkles className="w-6 h-6 text-secondary mx-auto" />
                  <h4 className="font-bold text-white text-sm">Free Account</h4>
                  <p className="text-xs text-text-muted">Follow to get alerts whenever this creator publishes new public posts.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection Row (OnlyFans/Instagram Icon Style) */}
        <div className="flex border-b border-white/5 gap-6 mb-8 overflow-x-auto pb-px scrollbar-none justify-start sm:justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative text-xs sm:text-sm font-black pb-4 transition-colors whitespace-nowrap px-3 flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeProfileTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CORE CONTENTS */}
        
        {/* TAB 1: OnlyFans-Style Timeline Feed */}
        {activeTab === "posts" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {creator.posts.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-white/5">
                <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Posts Yet</h3>
                <p className="text-xs text-text-muted">This creator has not published any feed items.</p>
              </div>
            ) : (
              creator.posts.map((post) => {
                const unlocked = isPostUnlocked(post);
                const postLikes = likesState[post.id] || { count: post.likesCount, liked: false };
                const comments = postComments[post.id] || [];

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-static rounded-2xl p-5 border border-white/10 space-y-4 hover:border-white/15 transition-all shadow-xl"
                  >
                    {/* Post Card Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-card">
                          <img
                            src={creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50"}
                            alt={creator.displayName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-white text-xs leading-none">{creator.displayName}</span>
                            {creator.isVerified && <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />}
                          </div>
                          <span className="text-[10px] text-text-muted">
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Visibility lock tag */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                        post.visibility === "public"
                          ? "bg-green-500/10 text-green-400 border border-green-500/15"
                          : post.visibility === "followers"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                          : "bg-primary/10 text-primary border border-primary/15"
                      }`}>
                        {unlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {post.visibility}
                      </span>
                    </div>

                    {/* Post Description & Media */}
                    {unlocked ? (
                      <div className="space-y-4">
                        {post.content && (
                          <p className="text-xs leading-relaxed text-white/90 whitespace-pre-wrap">{post.content}</p>
                        )}
                        {post.media.length > 0 && (
                          <div className="grid grid-cols-1 gap-3 rounded-2xl overflow-hidden border border-white/5 max-h-[450px]">
                            {post.media.map((med) => (
                              <div key={med.id} className="relative w-full h-full bg-[#0a0a0c] flex items-center justify-center overflow-hidden">
                                {med.type === "video" ? (
                                  <VideoPlayer src={med.url} />
                                ) : med.type === "audio" ? (
                                  <div className="p-4 w-full bg-white/[0.02] flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-white"><Volume2 className="w-4 h-4 text-primary animate-pulse" /> Audio Track</div>
                                    <audio src={med.url} controls className="w-full" />
                                  </div>
                                ) : (
                                  <div 
                                    className="w-full h-full cursor-zoom-in"
                                    onClick={() => {
                                      const slides = post.media
                                        .filter((m) => m.type === "image" || m.type === "photo")
                                        .map((m) => ({
                                          src: m.url,
                                          title: post.title,
                                          description: post.content || undefined,
                                        }));
                                      if (slides.length > 0) {
                                        const idx = slides.findIndex((s) => s.src === med.url);
                                        setLightboxSlides(slides);
                                        setLightboxIndex(idx >= 0 ? idx : 0);
                                        setLightboxOpen(true);
                                      }
                                    }}
                                  >
                                    <img src={med.url} alt="Post content" className="w-full h-full object-cover max-h-[400px]" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* OnlyFans-style Frosted lock placeholder overlay */
                      <div className="relative py-12 px-6 rounded-2xl bg-[#09090b]/80 backdrop-blur-md border border-dashed border-white/10 flex flex-col justify-center items-center text-center shadow-inner overflow-hidden min-h-[220px]">
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-extrabold text-white text-sm mb-1.5">Exclusive Content Locked</h4>
                        <p className="text-xs text-text-muted mb-5 max-w-sm leading-relaxed">
                          {post.visibility === "followers"
                            ? "Become a follower of this page to view this post."
                            : post.visibility === "subscribers"
                            ? "Subscribe to a membership plan to unlock access."
                            : `Unlock this premium post for a single charge of $${post.price}.`}
                        </p>
                        {post.visibility === "locked" ? (
                          <button
                            onClick={() => handleUnlockPost(post.id, post.price)}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black tracking-wide shadow-lg shadow-primary/15 transition-all cursor-pointer select-none active:scale-[0.98]"
                          >
                            Unlock Post for ${post.price}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (cheapestPlan) {
                                handleSubscribe(cheapestPlan.id, cheapestPlan.name);
                              } else {
                                setActiveTab("plans");
                              }
                            }}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black tracking-wide shadow-lg shadow-primary/15 transition-all cursor-pointer select-none active:scale-[0.98]"
                          >
                            Join Membership Plan
                          </button>
                        )}
                      </div>
                    )}

                    {/* Post Card Footer Actions */}
                    <div className="flex items-center gap-5 pt-3 border-t border-white/5 text-text-muted text-xs">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${postLikes.liked ? "text-red-400 font-extrabold" : "hover:text-red-400"}`}
                      >
                        <Heart className={`w-4 h-4 ${postLikes.liked ? "fill-red-400" : ""}`} />
                        {postLikes.count}
                      </button>
                      <button 
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {comments.length} Comments
                      </button>
                    </div>

                    {/* Collapsible comment section drawer */}
                    <AnimatePresence>
                      {activeCommentPostId === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden pt-3 border-t border-white/5 space-y-4"
                        >
                          <div className="max-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-none">
                            {comments.map((comment) => (
                              <div key={comment.id} className="flex gap-2.5 items-start text-xs bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
                                  {comment.user.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between text-[10px] font-semibold text-text-muted mb-0.5">
                                    <span>{comment.user}</span>
                                    <span>{comment.date}</span>
                                  </div>
                                  <p className="text-white/90 leading-tight text-[11px]">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder="Write a comment..."
                              className="flex-1 bg-[#09090b]/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted/40 focus:outline-none focus:border-primary/50"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                            >
                              Send
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Instagram-Style 3-Column Media Grid */}
        {activeTab === "media" && (
          <div className="space-y-6">
            {mediaPosts.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-white/5 max-w-2xl mx-auto">
                <Eye className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Photos or Videos</h3>
                <p className="text-xs text-text-muted">This creator has not uploaded any posts containing media files.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {mediaPosts.map((post) => {
                  const unlocked = isPostUnlocked(post);
                  const firstMedia = post.media[0];
                  const likes = likesState[post.id]?.count || post.likesCount;
                  const comments = postComments[post.id] || [];

                  return (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      className="relative group rounded-xl overflow-hidden aspect-square border border-white/5 bg-[#121214] cursor-pointer"
                      onClick={() => {
                        if (unlocked) {
                          setSelectedMediaPost(post);
                        } else {
                          if (post.visibility === "locked") {
                            handleUnlockPost(post.id, post.price);
                          } else {
                            if (cheapestPlan) {
                              handleSubscribe(cheapestPlan.id, cheapestPlan.name);
                            } else {
                              setActiveTab("plans");
                            }
                          }
                        }
                      }}
                    >
                      <img
                        src={firstMedia?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400"}
                        alt={post.title}
                        className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 ${
                          !unlocked ? "filter blur-lg brightness-50" : ""
                        }`}
                      />

                      {/* Instagram style grid overlays on hover */}
                      {unlocked ? (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 sm:gap-6 text-white text-xs font-black">
                          <span className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 fill-white" />
                            {likes}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 fill-white" />
                            {comments.length}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Membership subscription tiers list */}
        {activeTab === "plans" && (
          <div>
            {creator.plans.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.01] rounded-3xl border border-white/5 max-w-3xl mx-auto">
                <Sparkles className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-bold text-white text-base mb-1">No Memberships Configured</h3>
                <p className="text-xs text-text-muted">This creator has not configured any subscriptions tiers yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {creator.plans.map((plan) => {
                  const isSubbed = subscribedPlans.includes(plan.id);
                  return (
                    <div
                      key={plan.id}
                      className={`glass-card-premium rounded-2xl p-6 relative overflow-hidden border border-white/5 hover:border-white/10 transition-all ${
                        isSubbed ? "border-primary !border-primary" : ""
                      }`}
                    >
                      {isSubbed && (
                        <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                          Active Member
                        </div>
                      )}

                      <h3 className="font-extrabold text-white text-lg mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="text-2xl font-black text-primary">${plan.price}</span>
                        <span className="text-[10px] text-text-muted font-bold">/ month</span>
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
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.98] ${
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

        {/* TAB 4: Info and Social Link listings */}
        {activeTab === "about" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-card-static rounded-3xl p-6 border border-white/10 space-y-6">
              <div>
                <h3 className="font-bold text-white text-base mb-3">About Creator</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {creator.bio || "No information details added by the creator."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-xs">
                <div>
                  <p className="font-black uppercase tracking-wider text-[9px] text-text-muted">Origin Location</p>
                  <p className="text-white text-sm mt-1">{creator.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="font-black uppercase tracking-wider text-[9px] text-text-muted">Member Since</p>
                  <p className="text-white text-sm mt-1">
                    {new Date(creator.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Social networks links card */}
            <div className="glass-card-static rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm">Explore Social Connections</h4>
                <p className="text-xs text-text-muted mt-0.5">Connect with their updates on design and code platforms.</p>
              </div>

              <div className="flex items-center gap-3">
                {parsedSocial.dribbble && (
                  <a
                    href={parsedSocial.dribbble}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-[#ea4c89]/10 border border-white/10 hover:border-[#ea4c89]/30 text-text-muted hover:text-[#ea4c89] rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.37c-.382-1.077-1.748-2.127-3.793-2.923a18.232 18.232 0 0 0-3.32-.888c.677-1.636 1.34-3.332 1.942-5.013 1.94.757 3.328 1.927 4.1 3.447.886 1.742.92 3.633.072 5.377zm-2.023-6.938c-.642-1.282-1.764-2.28-3.376-2.997a14.28 14.28 0 0 0-1.777 4.708 26.657 26.657 0 0 1 5.153-1.711zM12 2.1c4.542 0 8.35 3.03 9.544 7.159A11.116 11.116 0 0 0 17.5 5.922a10.963 10.963 0 0 0-3.522-2.735 15.342 15.342 0 0 0-1.978-1.087zm-3.033.456a15.702 15.702 0 0 1 1.97 1.096c.866.57 1.636 1.22 2.308 1.943a12.35 12.35 0 0 1-4.223 8.34C9 13.918 8.892 13.9 8.784 13.9c-2.483 0-4.845.546-7.054 1.616-.27-.8-.43-1.65-.43-2.516 0-3.955 2.502-7.307 6.002-8.544a13.376 13.376 0 0 1 1.665-1.9zm-7.618 13.4a15.65 15.65 0 0 1 6.84-1.576c.154 0 .307.006.46.012a20.088 20.088 0 0 0 1.93 5.485C6.014 22.183 2.97 19.345 1.349 15.956zm9.29 5.86a17.822 17.822 0 0 1-1.946-5.418c2.1-.25 4.398-.22 6.814.1 1.696.223 3.018.528 3.992.9a9.893 9.893 0 0 1-8.86 4.418z" /></svg>
                  </a>
                )}
                {parsedSocial.behance && (
                  <a
                    href={parsedSocial.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-[#0057ff]/10 border border-white/10 hover:border-[#0057ff]/30 text-text-muted hover:text-[#0057ff] rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zM8.35 15.86c-1.34 0-1.84-.71-1.84-2.14V9.66c0-1.43.5-2.14 1.84-2.14s1.85.71 1.85 2.14v4.06c0 1.43-.51 2.14-1.85 2.14zm4.6-2.14c0 1.43-.5 2.14-1.85 2.14s-1.85-.71-1.85-2.14V9.66c0-1.43.5-2.14 1.85-2.14s1.85.71 1.85 2.14v4.06zM9.4 9.66c0-.44-.12-.66-.45-.66s-.45.22-.45.66v4.06c0 .44.12.66.45.66s.45-.22.45-.66V9.66zm3.15 0c0-.44-.12-.66-.45-.66s-.45.22-.45.66v4.06c0 .44.12.66.45.66s.45-.22.45-.66V9.66zM18.8 8h-3v1h3V8zm-3 4.5h3v-2.5h-3v2.5zm0 1.7h3v-.7h-3v.7z" /></svg>
                  </a>
                )}
                {parsedSocial.github && (
                  <a
                    href={parsedSocial.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-text-muted hover:text-white rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </a>
                )}
                {parsedSocial.twitter && (
                  <a
                    href={parsedSocial.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-text-muted hover:text-white rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Portfolio and design skills (Creator dynamic feature) */}
        {activeTab === "portfolio" && hasPortfolio && (
          <div className="space-y-12 max-w-4xl mx-auto">
            {/* Design Skills Showcase Section */}
            {parsedSocial.skills && parsedSocial.skills.length > 0 && (
              <div className="glass-card-static p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10">
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                  <Award className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-white text-lg">UI/UX Design Skills Matrix</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {Object.entries(
                    parsedSocial.skills.reduce((acc, skill) => {
                      if (!acc[skill.category]) acc[skill.category] = [];
                      acc[skill.category].push(skill);
                      return acc;
                    }, {} as Record<string, Skill[]>)
                  ).map(([category, skills]) => (
                    <div key={category} className="space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                        {category === "Core Design" ? (
                          <Layers className="w-3.5 h-3.5" />
                        ) : category === "Development" ? (
                          <Cpu className="w-3.5 h-3.5" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5" />
                        )}
                        {category}
                      </h4>

                      <div className="space-y-4">
                        {skills.map((skill, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-white/90">{skill.name}</span>
                              <span className="font-bold text-primary">{skill.level}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Projects Grid Section */}
            {parsedSocial.projects && parsedSocial.projects.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Grid className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-white text-lg">Featured Design Projects</h3>
                  </div>
                  <p className="text-xs text-text-muted">{parsedSocial.projects.length} Showcase Items</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parsedSocial.projects.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="glass-card-premium rounded-2xl overflow-hidden group flex flex-col justify-between border border-white/5"
                    >
                      <div>
                        {/* Project cover preview */}
                        <div className="relative aspect-video w-full overflow-hidden bg-white/[0.02]">
                          <img
                            src={project.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Project detail info */}
                        <div className="p-5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {project.role}
                          </span>
                          <h4 className="font-bold text-white text-base mt-3 group-hover:text-primary transition-colors">
                            {project.title}
                          </h4>
                          <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {project.skills.map((s, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-text-muted"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          View Case Study
                        </button>
                        
                        {(project.demoUrl || project.githubUrl) && (
                          <a
                            href={project.demoUrl || project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INSTAGRAM-STYLE INTERACTIVE FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedMediaPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            {/* Close button */}
            <button
              onClick={() => setSelectedMediaPost(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-white transition-colors cursor-pointer z-50"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]"
            >
              {/* Left Column (70%): Media Container */}
              <div className="md:w-3/5 bg-black flex items-center justify-center relative overflow-hidden h-1/2 md:h-full">
                {selectedMediaPost.media[0]?.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <VideoPlayer src={selectedMediaPost.media[0].url} />
                  </div>
                ) : (
                  <div 
                    className="w-full h-full cursor-zoom-in flex items-center justify-center"
                    onClick={() => {
                      const slides = selectedMediaPost.media
                        .filter((m) => m.type === "image" || m.type === "photo")
                        .map((m) => ({
                          src: m.url,
                          title: selectedMediaPost.title,
                          description: selectedMediaPost.content || undefined,
                        }));
                      if (slides.length > 0) {
                        setLightboxSlides(slides);
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }
                    }}
                  >
                    <img
                      src={selectedMediaPost.media[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"}
                      alt={selectedMediaPost.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Right Column (40%): Sidebar Comments & Details */}
              <div className="md:w-2/5 flex flex-col justify-between border-l border-white/10 h-1/2 md:h-full bg-[#111113]">
                {/* Header info */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-card">
                      <img
                        src={creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50"}
                        alt={creator.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs leading-none mb-1 flex items-center gap-1">
                        {creator.displayName}
                        {creator.isVerified && <Star className="w-3 h-3 fill-primary text-primary shrink-0" />}
                      </h4>
                      <p className="text-[9px] text-text-muted">@{creator.username}</p>
                    </div>
                  </div>

                  <span className="text-[8px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {selectedMediaPost.visibility}
                  </span>
                </div>

                {/* Description & Interactive Comments Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Post details */}
                  <div className="space-y-1 bg-white/[0.01] p-3 rounded-2xl border border-white/5">
                    <h5 className="font-bold text-white text-xs leading-tight">{selectedMediaPost.title}</h5>
                    {selectedMediaPost.content && (
                      <p className="text-[11px] text-text-muted leading-relaxed mt-1">{selectedMediaPost.content}</p>
                    )}
                  </div>

                  {/* Comments lists */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Comments</p>
                    {(postComments[selectedMediaPost.id] || []).length === 0 ? (
                      <p className="text-xs text-text-muted italic">No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                      (postComments[selectedMediaPost.id] || []).map((comment) => (
                        <div key={comment.id} className="flex gap-2 items-start text-xs">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
                            {comment.user.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[9px] font-semibold text-text-muted mb-0.5">
                              <span>{comment.user}</span>
                              <span>{comment.date}</span>
                            </div>
                            <p className="text-white/90 leading-tight text-[11px]">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer inputs and likes panel */}
                <div className="p-4 border-t border-white/5 space-y-3 bg-[#0c0c0e] shrink-0">
                  <div className="flex items-center justify-between text-xs">
                    <button 
                      onClick={() => handleLikePost(selectedMediaPost.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        likesState[selectedMediaPost.id]?.liked ? "text-red-400 font-extrabold" : "text-text-muted hover:text-red-400"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likesState[selectedMediaPost.id]?.liked ? "fill-red-400" : ""}`} />
                      {likesState[selectedMediaPost.id]?.count || selectedMediaPost.likesCount}
                    </button>
                    <span className="text-[9px] text-text-muted font-bold uppercase">
                      Released {new Date(selectedMediaPost.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-[#09090b]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted/40 focus:outline-none focus:border-primary/50"
                    />
                    <button
                      onClick={() => handleAddComment(selectedMediaPost.id)}
                      className="px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Case Study Fullscreen Modal (Projects showcase) */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#18181b] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {selectedProject.role}
                </span>
                <h3 className="font-extrabold text-white text-2xl sm:text-3xl mt-4 leading-tight">
                  {selectedProject.title}
                </h3>
              </div>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-4 text-sm leading-relaxed text-white/95">
                <div className="md:col-span-2 space-y-5">
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-1">
                      <Star className="w-4.5 h-4.5 text-primary shrink-0" />
                      1. The Design Challenge
                    </h4>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      {selectedProject.description} The task was to build a visually engaging, responsive, and performance-optimized experience that remains lightweight while delivering highly customized interactive UI elements.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-1 space-y-5 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
                  <div>
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-primary">Role</h5>
                    <p className="text-xs text-text-muted mt-1 font-semibold">{selectedProject.role}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-primary">Skills Applied</h5>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedProject.skills?.map((s, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-bold bg-white/5 border border-white/5 px-2.5 py-0.5 rounded text-white"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Avatar customization Modal */}
      <AnimatePresence>
        {avatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111113] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 relative"
            >
              {/* Close */}
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <h3 className="font-extrabold text-white text-base">Update Profile Photo</h3>
                <p className="text-xs text-text-muted mt-1">Upload a local file, select a premium preset, or paste a custom URL.</p>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full border-2 border-primary bg-card overflow-hidden shadow-lg">
                  <img src={tempAvatar} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Local file uploader (React Dropzone with premium glass styles) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">Upload Image File</label>
                <div
                  {...getRootProps()}
                  className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-white/10 bg-[#09090b]/40 hover:border-white/20 hover:bg-[#09090b]/60"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:text-white transition-colors">
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </div>
                    {isUploading ? (
                      <p className="text-xs text-primary font-bold">Uploading to server...</p>
                    ) : isDragActive ? (
                      <p className="text-xs text-primary font-bold">Drop the image here...</p>
                    ) : (
                      <>
                        <p className="text-xs text-white font-bold">Drag & drop or click to upload</p>
                        <p className="text-[10px] text-text-muted">Supports JPG, PNG, WEBP (Max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">Or Paste Custom Image URL</label>
                <input
                  type="text"
                  value={tempAvatar}
                  onChange={(e) => setTempAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Presets options */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-text-muted tracking-wider block">Or Choose From Presets</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                  ].map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTempAvatar(url)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                        tempAvatar === url ? "border-primary scale-105" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setAvatarModalOpen(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  disabled={isSaving || isUploading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-xs text-white font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-primary/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageLightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  );
}
