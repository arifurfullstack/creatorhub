import Link from "next/link";
import { Lock, Eye, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-[#09090b] relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-all font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        {/* Header Title */}
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-secondary shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold">
              Last Updated: June 22, 2026
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-card/45 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-white/90">
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-secondary" />
              1. Information We Collect
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              We collect information necessary to deliver the SaaS platform services, including:
            </p>
            <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
              <li><strong>Account Credentials:</strong> Name, email address, password hashes (secured via Better Auth security layers).</li>
              <li><strong>Billing & Payout Details:</strong> Stripe IDs, routing numbers, Wise emails, or payout methods. Card payments process securely via Stripe hosted checkout; we do not store raw credit cards.</li>
              <li><strong>Media Uploads:</strong> Photos, video streams, audio, and documents uploaded onto post feeds.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">2. How We Use Collected Data</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Your details are used strictly to:
            </p>
            <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
              <li>Authorize login sessions and guard role dashboards.</li>
              <li>Track fan subscriptions and credit corresponding creator payout balances.</li>
              <li>Perform real-time private message transmission and audit moderation flags.</li>
              <li>Optimize website theme profiles and branding preferences.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">3. Third Party Integrations</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              We share metadata with trusted service processors:
            </p>
            <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
              <li><strong>Stripe:</strong> Payment gateways and billing ledger accounting.</li>
              <li><strong>Better Auth:</strong> Session logs and user credentials encryption.</li>
              <li><strong>Cloudflare/AWS:</strong> Hosting platform assets and uploaded post media.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">4. Cookies & Persistent Tokens</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              CreatorHub sets cookies to authorize your session tokens. Disabling cookies will block you from staying logged in or accessing dashboards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">5. Data Deletion & Rights</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Under modern privacy standards, users can request full deletion of their account databases. Banned accounts or profiles holding audit records relating to pending financial withdrawals may have deletion requests delayed until transaction cycles clear. To request data deletion, contact us at <span className="text-secondary font-bold">privacy@creatorhub.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
