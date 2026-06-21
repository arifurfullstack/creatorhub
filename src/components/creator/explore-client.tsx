"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, Users, Compass, DollarSign, CheckCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface Creator {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  coverImage: string;
  isVerified: boolean;
  followerCount: number;
  subscriberCount: number;
  postCount: number;
  user: {
    image: string | null;
  };
  plans: Plan[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ExploreClient({
  creators,
  categories,
}: {
  creators: Creator[];
  categories: Category[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Client side search and filters
  const filteredCreators = creators.filter((creator) => {
    // 1. Search text check
    const matchesSearch =
      creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.location.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category tab check
    // Seed script generates mock bios or categories. In seed data, we put categories in bios or match them.
    // Let's check if the bio includes category name or we match categories.
    const matchesCategory =
      selectedCategory === "all" ||
      creator.bio.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      // Some seeded creators match hardcoded mappings:
      (selectedCategory === "art-3d" && creator.username === "ariavance") ||
      (selectedCategory === "music-beats" && creator.username === "marcusmusic") ||
      (selectedCategory === "fitness" && creator.username === "elenafit") ||
      (selectedCategory === "design" && creator.username === "kenji3d");

    // 3. Verification toggle check
    const matchesVerified = !onlyVerified || creator.isVerified;

    return matchesSearch && matchesCategory && matchesVerified;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-36 relative">
      {/* Background Liquid Mesh Evolved */}
      <div className="liquid-mesh-container">
        <div className="liquid-mesh-blob liquid-mesh-blob-1" />
        <div className="liquid-mesh-blob liquid-mesh-blob-2" />
        <div className="liquid-mesh-blob liquid-mesh-blob-3" />
      </div>

      {/* Hero Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Discover <span className="text-gradient">Premium Creators</span>
        </h1>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed">
          Search and connect with artists, musicians, coaches, and designers offering exclusive gated content and custom membership tiers.
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="glass-card-static p-6 rounded-2xl mb-10 relative z-10 space-y-5">
        <div className="grid md:grid-cols-3 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3.5 w-4.5 h-4.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by display name, username handle, or location..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:outline-none text-xs sm:text-sm text-white"
            />
          </div>

          {/* Toggle verified switch */}
          <div className="flex items-center justify-end">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">
                Only Show Verified Creators
              </span>
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4.5 h-4.5 accent-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Category horizontal filters */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-white/5 text-text-muted hover:text-white hover:bg-white/10"
              }`}
            >
              All Categories
            </button>
            {[
              { slug: "art-3d", name: "Art & 3D" },
              { slug: "music-beats", name: "Music & Audio" },
              { slug: "fitness", name: "Fitness & Wellness" },
              { slug: "design", name: "Architecture & Design" },
            ].map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-primary text-white"
                    : "bg-white/5 text-text-muted hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Creators Catalog Grid */}
      <div className="relative z-10">
        {filteredCreators.length === 0 ? (
          <div className="text-center py-20 glass-card-static rounded-3xl">
            <Compass className="w-16 h-16 text-text-muted mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">No Creators Found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              We couldn't find any creator profile matching your current search parameters. Try expanding your filters.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => {
              const cheapestPlan = creator.plans.length > 0 ? creator.plans[0].price : null;

              return (
                <div
                  key={creator.id}
                  className="glass-card-premium rounded-3xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Photo */}
                    <div className="h-32 w-full relative bg-gradient-to-r from-primary/30 to-secondary/30 overflow-hidden">
                      {creator.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={creator.coverImage}
                          alt="Cover Banner"
                          className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>

                    {/* Header info card */}
                    <div className="p-6 relative pt-10 flex-1">
                      {/* Avatar */}
                      <div className="absolute top-[-36px] left-6 w-16 h-16 rounded-full border-4 border-card bg-card overflow-hidden shadow-lg shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={creator.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt={creator.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-extrabold text-white text-base leading-none group-hover:text-primary transition-colors truncate pr-2">
                          {creator.displayName}
                        </h3>
                        {creator.isVerified && (
                          <Star className="w-4 h-4 fill-primary text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted">@{creator.username}</p>

                      {creator.location && (
                        <div className="flex items-center gap-1 text-[10px] text-text-muted mt-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {creator.location}
                        </div>
                      )}

                      <p className="text-xs text-text-muted mt-4 line-clamp-2 leading-relaxed h-10">
                        {creator.bio || "No information details added."}
                      </p>
                    </div>
                  </div>

                  {/* Footer statistics info */}
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center text-xs">
                      <div>
                        <span className="block text-[9px] text-text-muted font-bold uppercase tracking-wider">
                          Followers
                        </span>
                        <span className="font-bold text-white mt-0.5 block">
                          {creator.followerCount}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-text-muted font-bold uppercase tracking-wider">
                          Posts
                        </span>
                        <span className="font-bold text-white mt-0.5 block">
                          {creator.postCount}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-text-muted font-bold uppercase tracking-wider">
                          Membership
                        </span>
                        <span className="font-bold text-primary mt-0.5 block">
                          {cheapestPlan !== null ? `$${cheapestPlan}/mo` : "Free"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/creator/${creator.username}`}
                      className="w-full text-center block mt-6 py-3 bg-white/5 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 rounded-xl text-xs font-bold transition-all"
                    >
                      View Channel Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
