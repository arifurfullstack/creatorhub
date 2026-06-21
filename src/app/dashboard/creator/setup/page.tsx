"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCreatorProfile } from "@/app/actions/creator";
import { AtSign, User, FileText, MapPin, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function CreatorSetupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createCreatorProfile({
        displayName,
        username,
        bio,
        location,
      });

      if (result.success) {
        // Redirect to creator dashboard
        router.push("/dashboard/creator");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong while setting up your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background glowing orbs */}
      <div className="gradient-orb w-[300px] h-[300px] bg-primary top-10 left-10" />
      <div className="gradient-orb w-[300px] h-[300px] bg-secondary bottom-10 right-10" />

      <div className="w-full max-w-lg glassmorphism rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Step 2: Customize Profile
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Setup Creator Profile</h1>
          <p className="text-sm text-text-muted">Tell your fans who you are and launch your monetization tiers</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Creator Name (Display Name)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-text-muted" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Aria Vance"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white placeholder-white/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Choose Handle (Username)
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3.5 w-5 h-5 text-text-muted" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                placeholder="ariavance"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white placeholder-white/20"
              />
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 ml-1">
              Your profile link will be: creatorhub.com/creator/{username || "handle"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Bio
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-5 h-5 text-text-muted" />
              <textarea
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Digital artist creating 3D environments and shader assets. Subscribe for weekly workflow breakdowns."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white placeholder-white/20 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, NY"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white placeholder-white/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Initializing..." : "Launch Profile"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
