"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2, AlertTriangle, Lock, Unlock, Eye, Sparkles, Star } from "lucide-react";
import Link from "next/link";

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

export default function FeedClient({
  initialPosts,
  sessionUser,
}: {
  initialPosts: Post[];
  sessionUser: any;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeFeed, setActiveFeed] = useState<"for-you" | "following" | "latest" | "bookmarks">("for-you");
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [unlockedPosts, setUnlockedPosts] = useState<string[]>([]);
  const [subscribedCreators, setSubscribedCreators] = useState<string[]>([]);

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

  const handleShare = (username: string, postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/creator/${username}/post/${postId}`);
    alert("Post link copied to clipboard!");
  };

  const handleReport = () => {
    alert("Post has been reported to moderators. Thank you.");
  };

  // Content visibility gate
  const isPostUnlocked = (post: Post) => {
    if (post.visibility === "public") return true;
    if (post.visibility === "followers" && subscribedCreators.includes(post.creatorProfile.id)) return true;
    if (post.visibility === "subscribers" && subscribedCreators.includes(post.creatorProfile.id)) return true;
    if (post.visibility === "locked" && unlockedPosts.includes(post.id)) return true;
    return false;
  };

  // Filter posts based on active feed tab
  const getFilteredPosts = () => {
    if (activeFeed === "latest") {
      return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (activeFeed === "bookmarks") {
      return posts.filter((p) => bookmarkedPosts.includes(p.id));
    }
    if (activeFeed === "following") {
      // For demonstration, let's treat any creator we unlocked/subscribed to as followed
      return posts.filter((p) => subscribedCreators.includes(p.creatorProfile.id));
    }
    // "for-you" returns standard feed
    return posts;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Background glowing orb */}
      <div className="gradient-orb w-[250px] h-[250px] bg-primary/10 top-1/4 left-10" />

      {/* Feed Tabs Header */}
      <div className="flex border-b border-white/5 gap-6 mb-8 overflow-x-auto pb-px">
        {[
          { id: "for-you", label: "For You" },
          { id: "following", label: "Following" },
          { id: "latest", label: "Latest" },
          { id: "bookmarks", label: "Bookmarks" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFeed(tab.id as any)}
            className={`text-sm font-bold pb-4 border-b-2 capitalize transition-colors whitespace-nowrap ${
              activeFeed === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-6 max-w-2xl">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 glassmorphism rounded-2xl border border-white/5">
            <Eye className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-bold text-white text-base mb-1">No Posts Available</h3>
            <p className="text-xs text-text-muted">
              {activeFeed === "bookmarks"
                ? "You haven't bookmarked any posts yet."
                : activeFeed === "following"
                ? "You are not following any creators with active posts yet."
                : "Check back later for new posts."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likedPosts.includes(post.id);
            const isSaved = bookmarkedPosts.includes(post.id);
            const unlocked = isPostUnlocked(post);

            return (
              <div
                key={post.id}
                className="bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden"
              >
                {/* Creator Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creator/${post.creatorProfile.username}`}
                      className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-white/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.creatorProfile.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                        alt={post.creatorProfile.displayName}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/creator/${post.creatorProfile.username}`}
                          className="font-bold text-white text-sm hover:underline hover:text-primary transition-colors"
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

                  {/* Visibility Badge */}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 ${
                      unlocked
                        ? "bg-green-500/10 text-green-400"
                        : "bg-pink-500/10 text-primary"
                    }`}
                  >
                    {unlocked ? (
                      <>
                        <Unlock className="w-2.5 h-2.5" />
                        {post.visibility}
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5 animate-pulse" />
                        {post.visibility}
                      </>
                    )}
                  </span>
                </div>

                {/* Post Content Body */}
                {unlocked ? (
                  <div className="mb-6">
                    {post.content && (
                      <p className="text-sm text-white/90 leading-relaxed mb-4 whitespace-pre-line">
                        {post.content}
                      </p>
                    )}

                    {post.media.length > 0 && (
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-white/5 bg-[#121214]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.media[0].url}
                          alt="Media Content"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Locked Gating Visual Card */
                  <div className="relative p-8 rounded-xl bg-white/5 border border-white/5 text-center overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-[#18181b]/95 backdrop-blur-md flex flex-col justify-center items-center p-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="font-bold text-white text-sm mb-1">Locked Post</h4>
                      <p className="text-xs text-text-muted mb-4 max-w-sm leading-relaxed">
                        {post.visibility === "locked"
                          ? `Unlock this single locked file for $${post.price} to get permanent access.`
                          : `Subscribe to @${post.creatorProfile.username}'s premium tiers to access this post.`}
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
                          View Membership Plans
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Actions Footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 text-text-muted">
                  <div className="flex items-center gap-4 text-xs">
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
                      <span>{post.commentsCount}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`hover:text-primary transition-colors ${
                        isSaved ? "text-primary" : ""
                      }`}
                    >
                      <Bookmark className={`w-4.5 h-4.5 ${isSaved ? "fill-primary" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleShare(post.creatorProfile.username, post.id)}
                      className="hover:text-primary transition-colors"
                    >
                      <Share2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={handleReport}
                      className="hover:text-red-400 transition-colors"
                    >
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
