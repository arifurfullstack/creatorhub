"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Star,
  Search,
  LayoutDashboard,
  Users,
  Compass,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ImageLightbox from "@/components/shared/image-lightbox";

interface PostMedia {
  id: string;
  type: string;
  url: string;
}

interface Post {
  id: string;
  title: string;
  content: string | null;
  visibility: string;
  price: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  creatorProfile: {
    id: string;
    username: string;
    displayName: string;
    isVerified: boolean;
    user: {
      image: string | null;
    };
  };
  media: PostMedia[];
}

interface RecommendedCreator {
  id: string;
  username: string;
  displayName: string;
  isVerified: boolean;
  bio: string;
  user: {
    image: string | null;
  };
}

export default function FeedClient({
  initialPosts,
  sessionUser,
  recommendedCreators,
}: {
  initialPosts: Post[];
  sessionUser: any;
  recommendedCreators: RecommendedCreator[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeFeed, setActiveFeed] = useState<"for-you" | "following" | "latest" | "bookmarks">("for-you");
  const [postSearch, setPostSearch] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState<string>("all");
  const [isTabLoading, setIsTabLoading] = useState(false);

  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [unlockedPosts, setUnlockedPosts] = useState<string[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);

  // Lightbox States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState<{ src: string; title?: string; description?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Simulation handlers
  const handleLike = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
      setPosts(posts.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount - 1 } : p)));
    } else {
      setLikedPosts([...likedPosts, postId]);
      setPosts(posts.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p)));
    }
  };

  const handleBookmark = (postId: string) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(bookmarkedPosts.filter((id) => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }
  };

  const handleUnlock = (postId: string, price: number) => {
    if (confirm(`Unlock this premium post for $${price}? (Simulated Payment)`)) {
      setUnlockedPosts([...unlockedPosts, postId]);
    }
  };

  const handleToggleFollow = (creatorId: string) => {
    if (followedCreators.includes(creatorId)) {
      setFollowedCreators(followedCreators.filter((id) => id !== creatorId));
    } else {
      setFollowedCreators([...followedCreators, creatorId]);
    }
  };

  const handleShare = (username: string, postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/creator/${username}/post/${postId}`);
    toast.success("Post link copied to clipboard!");
  };

  const handleReport = () => {
    toast.info("Post has been reported to moderators. Thank you.");
  };

  const isPostUnlocked = (post: Post) => {
    if (post.visibility === "public") return true;
    if (post.visibility === "followers" && (followedCreators.includes(post.creatorProfile.id) || post.creatorProfile.id === sessionUser?.creatorProfileId)) return true;
    if (post.visibility === "subscribers" && (followedCreators.includes(post.creatorProfile.id) || post.creatorProfile.id === sessionUser?.creatorProfileId)) return true;
    if (post.visibility === "locked" && (unlockedPosts.includes(post.id) || post.creatorProfile.id === sessionUser?.creatorProfileId)) return true;
    return false;
  };

  // Filter posts based on search text, active feed tabs, and visibility selectors
  const getFilteredPosts = () => {
    let result = [...posts];

    // 1. Tab filters
    if (activeFeed === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeFeed === "bookmarks") {
      result = result.filter((p) => bookmarkedPosts.includes(p.id));
    } else if (activeFeed === "following") {
      result = result.filter((p) => followedCreators.includes(p.creatorProfile.id));
    }

    // 2. Search Text
    if (postSearch.trim() !== "") {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
          (p.content && p.content.toLowerCase().includes(postSearch.toLowerCase())) ||
          p.creatorProfile.displayName.toLowerCase().includes(postSearch.toLowerCase())
      );
    }

    // 3. Visibility Selector
    if (selectedVisibility !== "all") {
      result = result.filter((p) => p.visibility === selectedVisibility);
    }

    return result;
  };

  const filteredPosts = getFilteredPosts();

  const getDashboardLink = () => {
    if (!sessionUser) return "/auth/login";
    switch (sessionUser.role) {
      case "creator":
        return "/dashboard/creator";
      case "admin":
        return "/dashboard/admin";
      case "moderator":
        return "/dashboard/moderator";
      case "fan":
      default:
        return "/dashboard/fan";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-36">
      {/* Ambient background blur circles */}
      <div className="gradient-orb w-[300px] h-[300px] bg-primary/10 top-1/4 left-12" />
      <div className="gradient-orb w-[250px] h-[250px] bg-secondary/5 bottom-1/3 right-12" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Main Feed Feed Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
          {/* Feed Header Navigation */}
          <div className="glass-card-static p-4 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="flex border-b border-white/5 gap-6 overflow-x-auto scrollbar-none pb-px">
              {[
                { id: "for-you", label: "For You" },
                { id: "following", label: "Following" },
                { id: "latest", label: "Latest" },
                { id: "bookmarks", label: "Saved Bookmarks" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (activeFeed !== tab.id) {
                      setIsTabLoading(true);
                      setTimeout(() => setIsTabLoading(false), 450);
                      setActiveFeed(tab.id as any);
                    }
                  }}
                  className={`relative text-xs sm:text-sm font-extrabold pb-3 capitalize transition-all whitespace-nowrap cursor-pointer px-1.5 ${
                    activeFeed === tab.id
                      ? "text-primary"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  {tab.label}
                  {activeFeed === tab.id && (
                    <motion.div
                      layoutId="activeFeedTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Sub Filter Controls (Search + Visibility Buttons) */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search text */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Filter posts by title or keywords..."
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs text-white"
                />
              </div>

              {/* Visibility selector */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto self-start sm:self-center">
                {[
                  { id: "all", label: "All" },
                  { id: "public", label: "Public" },
                  { id: "followers", label: "Followers" },
                  { id: "subscribers", label: "Gated" },
                  { id: "locked", label: "Locked" },
                ].map((vis) => (
                  <button
                    key={vis.id}
                    onClick={() => setSelectedVisibility(vis.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                      selectedVisibility === vis.id
                        ? "bg-primary text-white border-primary"
                        : "bg-white/5 text-text-muted hover:text-white border-white/5"
                    }`}
                  >
                    {vis.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Loop */}
          <div className="space-y-6">
            {isTabLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="glass-card-static rounded-3xl p-6 relative overflow-hidden shadow-lg animate-pulse">
                    <div className="flex gap-3 mb-5 items-center">
                      <div className="w-11 h-11 rounded-full bg-white/5 animate-shimmer" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3.5 bg-white/5 animate-shimmer rounded w-1/4" />
                        <div className="h-2.5 bg-white/5 animate-shimmer rounded w-1/6" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="h-3 bg-white/5 animate-shimmer rounded w-full" />
                      <div className="h-3 bg-white/5 animate-shimmer rounded w-5/6" />
                      <div className="h-3 bg-white/5 animate-shimmer rounded w-3/4" />
                    </div>
                    <div className="h-10 bg-white/5 animate-shimmer rounded-2xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 glass-card-static rounded-3xl shadow-xl">
                <Eye className="w-14 h-14 text-text-muted mx-auto mb-4 animate-pulse" />
                <h3 className="text-base font-bold text-white mb-1">No Posts Found</h3>
                <p className="text-xs text-text-muted max-w-xs mx-auto">
                  {activeFeed === "bookmarks"
                    ? "You haven't bookmarked any posts yet. Click the bookmark bookmark tag on cards to save content."
                    : activeFeed === "following"
                    ? "No posts from creators you currently follow match this filter query."
                    : "No posts match the active keywords search or visibility parameters."}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = likedPosts.includes(post.id);
                const isSaved = bookmarkedPosts.includes(post.id);
                const unlocked = isPostUnlocked(post);

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ type: "spring", mass: 0.8, stiffness: 120, damping: 14 }}
                    className="glass-card-premium rounded-3xl p-6 relative overflow-hidden"
                  >
                    {/* Header: User Avatar + Name + Gating indicator */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/creator/${post.creatorProfile.username}`}
                          className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/5 flex items-center justify-center shadow-md hover:scale-[1.02] transition-transform"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.creatorProfile.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                            alt={post.creatorProfile.displayName}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/creator/${post.creatorProfile.username}`}
                              className="font-extrabold text-white text-sm hover:underline hover:text-primary transition-colors"
                            >
                              {post.creatorProfile.displayName}
                            </Link>
                            {post.creatorProfile.isVerified && (
                              <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-muted">@{post.creatorProfile.username}</p>
                        </div>
                      </div>

                      {/* Visibility badge */}
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border ${
                          unlocked
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-pink-500/10 text-primary border-primary/20"
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

                    {/* Body contents */}
                    {unlocked ? (
                      <div className="mb-6 space-y-4">
                        <h4 className="font-extrabold text-white text-base leading-snug">{post.title}</h4>
                        {post.content && (
                          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>
                        )}

                        {post.media.length > 0 && (
                          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#121214]">
                            {post.media[0].type === "video" ? (
                              <div className="relative aspect-video w-full h-full bg-black">
                                <video
                                  src={post.media[0].url}
                                  controls
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : post.media[0].type === "audio" ? (
                              <div className="p-4 flex flex-col gap-2 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                                    <Volume2 className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">Audio Track</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">Media Attachment</p>
                                  </div>
                                </div>
                                <audio
                                  src={post.media[0].url}
                                  controls
                                  className="w-full mt-2"
                                />
                              </div>
                            ) : (
                              <div 
                                className="relative aspect-video w-full h-full cursor-zoom-in"
                                onClick={() => {
                                  const slides = post.media
                                    .filter((m) => m.type === "image" || m.type === "photo")
                                    .map((m) => ({
                                      src: m.url,
                                      title: post.title,
                                      description: post.content || undefined,
                                    }));
                                  if (slides.length > 0) {
                                    setLightboxSlides(slides);
                                    setLightboxIndex(0);
                                    setLightboxOpen(true);
                                  }
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={post.media[0].url}
                                  alt="Post media content"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Locked overlay box */
                      <div className="relative p-8 rounded-2xl bg-white/5 border border-white/5 text-center overflow-hidden mb-6">
                        <div className="absolute inset-0 bg-[#18181b]/95 backdrop-blur-md flex flex-col justify-center items-center p-6">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <Lock className="w-5 h-5 text-primary" />
                          </div>
                          <h4 className="font-bold text-white text-sm mb-1.5">Locked Post</h4>
                          <p className="text-xs text-text-muted mb-4 max-w-sm leading-relaxed">
                            {post.visibility === "locked"
                              ? `Unlock this gated file for $${post.price} to get lifetime access.`
                              : `Subscribe to @${post.creatorProfile.username}'s plans to unlock this premium content.`}
                          </p>

                          {post.visibility === "locked" ? (
                            <button
                              onClick={() => handleUnlock(post.id, post.price)}
                              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-primary/15"
                            >
                              Unlock for ${post.price}
                            </button>
                          ) : (
                            <Link
                              href={`/creator/${post.creatorProfile.username}`}
                              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-primary/15"
                            >
                              View Tiers Setup
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer buttons row */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-4 text-text-muted">
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-colors ${
                            isLiked ? "text-primary" : "hover:text-red-400"
                          }`}
                        >
                          <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-primary" : ""}`} />
                          <span>{post.likesCount}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                          <MessageCircle className="w-4.5 h-4.5" />
                          <span>{post.commentsCount} Comments</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`hover:text-primary transition-colors ${
                            isSaved ? "text-primary" : ""
                          }`}
                          title="Save Bookmark"
                        >
                          <Bookmark className={`w-4.5 h-4.5 ${isSaved ? "fill-primary" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleShare(post.creatorProfile.username, post.id)}
                          className="hover:text-primary transition-colors"
                          title="Copy Link"
                        >
                          <Share2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={handleReport}
                          className="hover:text-red-400 transition-colors"
                          title="Report Post"
                        >
                          <AlertTriangle className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Widget Column (Span 1, hidden on mobile/tablet) */}
        <div className="hidden lg:flex flex-col gap-6 lg:col-span-1 sticky top-24 order-2 lg:order-1">
          {/* User Widget */}
          {sessionUser && (
            <div className="glass-card-static p-5 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white overflow-hidden shadow border border-white/10 shrink-0">
                  {sessionUser.image ? (
                    <img src={sessionUser.image} alt={sessionUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (sessionUser.name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <h4 className="font-extrabold text-white text-sm truncate leading-snug">{sessionUser.name}</h4>
                  <p className="text-xs text-text-muted capitalize">{sessionUser.role}</p>
                </div>
              </div>

              <Link
                href={getDashboardLink()}
                className="w-full py-2.5 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-center block transition-all flex items-center justify-center gap-1.5 border border-white/5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* recommended creators List */}
          <div className="glass-card-static p-5 rounded-3xl shadow-xl space-y-4">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-3">
              <Users className="w-4 h-4 text-primary" />
              Recommended Creators
            </h4>

            <div className="space-y-4">
              {recommendedCreators.map((creator) => {
                const isFollowing = followedCreators.includes(creator.id);
                return (
                  <div key={creator.id} className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Link
                        href={`/creator/${creator.username}`}
                        className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-white/5 border border-white/10"
                      >
                        <img
                          src={creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt={creator.displayName}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/creator/${creator.username}`}
                            className="font-bold text-white text-xs hover:underline hover:text-primary transition-colors truncate block leading-none"
                          >
                            {creator.displayName}
                          </Link>
                          {creator.isVerified && (
                            <Star className="w-3 h-3 fill-primary text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">@{creator.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(creator.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shrink-0 cursor-pointer ${
                        isFollowing
                          ? "bg-white/5 text-text-muted hover:text-white"
                          : "bg-primary text-white hover:bg-primary-hover shadow shadow-primary/10"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>

            <Link
              href="/explore"
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold text-center block transition-all border border-white/5"
            >
              Explore All Creators
            </Link>
          </div>
        </div>
      </div>

      <ImageLightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />
    </div>
  );
}
