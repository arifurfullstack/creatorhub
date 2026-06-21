import Link from "next/link";
import { Scale, ShieldAlert, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex-1 bg-[#09090b] relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-all font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        {/* Header Title */}
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary shadow-lg">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Terms of Service</h1>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold">
              Last Updated: June 22, 2026
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-card/45 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-white/90">
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">1. Acceptance of Terms</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              By accessing or using the CreatorHub SaaS Platform ("Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">2. User Accounts & Registration</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              To utilize certain features, including content subscription, tipping, locked post messaging, or creator dashboards, you must create a secure account. You are solely responsible for maintaining credentials confidentiality and for all activities that occur under your account. You agree to provide accurate information and immediately report any security breaches.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">3. Creator Monetization, Subscriptions & Fees</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Creators on CreatorHub can monetize content through monthly memberships, tips, and locked media posts/messages. By launching a monetized channel, you agree to:
            </p>
            <ul className="list-disc pl-5 text-xs text-text-muted space-y-2 leading-relaxed">
              <li>Keep billing tiers structured fairly according to values specified in plans.</li>
              <li>Acknowledge that CreatorHub deducts a <strong>5% platform commission fee</strong> from gross transaction volumes, passing the remaining 95% directly to your creator balance (less Stripe/payout processing fees).</li>
              <li>Maintain minimum withdrawal limits as audited by administrator configs (default limit is $50.00).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">4. Content Rules & Copyright Policy</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              You retain all rights to the media (images, video, audio) you upload. However, you grant CreatorHub a limited license to host and distribute the media to authorized subscribers. Content that contains illegal material, harassment, copyright infringement (DMCA violations), or unauthorized commercial ads is strictly prohibited and subject to immediate deletion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">5. Account Bans & Content Moderation</h2>
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 leading-relaxed">
                <strong>Important Notice:</strong> Platform moderators and administrators hold the right to suspend, ban, or terminate user profiles found in violation of our content rules. Creators banned for malicious activity forfeit remaining pending balances.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">6. Refunds & Cancellations</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Fans may cancel their monthly subscription plans at any time directly through the Fan Dashboard. Cancelled plans will remain active until the end of the current billing cycle. Due to the digital nature of instant content unlock releases, all tips and locked-post unlocks are strictly non-refundable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white">7. Governing Law</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              These terms are governed by and construed in accordance with the laws of the State of California, without regard to conflict of law principles. Any legal actions must be resolved in San Francisco County courts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
