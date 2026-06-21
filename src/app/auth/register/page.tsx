"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Mail, Lock, User, AlertCircle, ArrowRight, Compass, PenTool } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"fan" | "creator">("fan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await signUp.email({
        email,
        password,
        name,
        // Passing custom user attributes like role to Better Auth
        role,
        callbackURL: role === "creator" ? "/dashboard/creator/setup" : "/feed",
      } as any);

      if (response?.error) {
        setError(response.error.message || "Failed to create account");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-sm text-text-muted">Start interacting or monetize your passion today</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              I want to join as a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("fan")}
                className={`p-4 rounded-xl border text-left transition-all hover:border-primary/50 relative overflow-hidden group ${
                  role === "fan"
                    ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,79,163,0.1)]"
                    : "border-white/5 bg-white/5"
                }`}
              >
                <Compass className={`w-6 h-6 mb-2 ${role === "fan" ? "text-primary" : "text-text-muted"}`} />
                <h3 className="font-bold text-white text-sm">Fan / Subscriber</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Support creators, purchase locked posts, and chat.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`p-4 rounded-xl border text-left transition-all hover:border-primary/50 relative overflow-hidden group ${
                  role === "creator"
                    ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,79,163,0.1)]"
                    : "border-white/5 bg-white/5"
                }`}
              >
                <PenTool className={`w-6 h-6 mb-2 ${role === "creator" ? "text-primary" : "text-text-muted"}`} />
                <h3 className="font-bold text-white text-sm">Content Creator</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Monetize your content, create plans, and sell.
                </p>
              </button>
            </div>
          </div>

          <div className="floating-input-group">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="floating-input"
            />
            <User className="floating-input-icon text-text-muted" />
            <label className="floating-label">Full Name</label>
          </div>

          <div className="floating-input-group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="floating-input"
            />
            <Mail className="floating-input-icon text-text-muted" />
            <label className="floating-label">Email Address</label>
          </div>

          <div className="floating-input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="floating-input"
            />
            <Lock className="floating-input-icon text-text-muted" />
            <label className="floating-label">Password</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
