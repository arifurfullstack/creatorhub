"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await signIn.email({
        email,
        password,
        callbackURL: "/feed",
      });
      
      if (response?.error) {
        setError(response.error.message || "Failed to log in");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await signIn.social({
        provider,
        callbackURL: "/feed",
      });
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background glowing orbs */}
      <div className="gradient-orb w-[300px] h-[300px] bg-primary top-10 left-10" />
      <div className="gradient-orb w-[300px] h-[300px] bg-secondary bottom-10 right-10" />

      <div className="w-full max-w-md glassmorphism rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-text-muted">Enter your details to access your account</p>
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

          <div className="relative">
            <div className="floating-input-group">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="floating-input pr-16"
              />
              <Lock className="floating-input-icon text-text-muted" />
              <label className="floating-label">Password</label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="absolute right-3.5 top-[17px] text-xs text-primary hover:underline font-semibold z-10"
            >
              Forgot?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging In..." : "Log In"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative px-3 bg-[#18181b] text-xs text-text-muted uppercase tracking-wider font-semibold">
            Or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] text-white"
          >
            <svg className="w-4 h-4 fill-current text-red-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.535 0-6.403-2.868-6.403-6.4s2.868-6.4 6.403-6.4c1.582 0 3.02.574 4.136 1.518l2.915-2.915C19.08 2.44 15.9 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.96 0 11.57-4.89 11.57-11.79 0-.795-.07-1.575-.195-2.285H12.24z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("github")}
            className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] text-white"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </button>
        </div>

        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
