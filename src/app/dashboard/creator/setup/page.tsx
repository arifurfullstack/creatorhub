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
          <div className="floating-input-group">
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder=" "
              className="floating-input"
            />
            <User className="floating-input-icon text-text-muted" />
            <label className="floating-label">Creator Name (Display Name)</label>
          </div>

          <div>
            <div className="floating-input-group">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                placeholder=" "
                className="floating-input"
              />
              <AtSign className="floating-input-icon text-text-muted" />
              <label className="floating-label">Choose Handle (Username)</label>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 ml-1">
              Your profile link will be: creatorhub.com/creator/{username || "handle"}
            </p>
          </div>

          <div className="floating-input-group">
            <textarea
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder=" "
              rows={3}
              className="floating-textarea pl-[2.75rem]"
            />
            <FileText className="floating-input-icon text-text-muted" />
            <label className="floating-label">Bio</label>
          </div>

          <div className="floating-input-group">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder=" "
              className="floating-input"
            />
            <MapPin className="floating-input-icon text-text-muted" />
            <label className="floating-label">Location</label>
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
