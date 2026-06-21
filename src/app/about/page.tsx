import Link from "next/link";
import { Sparkles, Users, Award, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex-1 bg-[#09090b] flex flex-col justify-center items-center relative overflow-hidden pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full space-y-16 relative z-10">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none mt-2">
            Empowering <span className="text-gradient">Creative Independence</span>
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            CreatorHub is the premium SaaS platform built to help digital creators control their content, engage their communities, and monetize their passions directly—with zero middlemen.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Creators", value: "25,000+", sub: "Worldwide talent" },
            { label: "Community Fans", value: "2.4M+", sub: "Loyal supporters" },
            { label: "Commission Fee", value: "5%", sub: "Industry lowest" },
            { label: "Payout Speeds", value: "< 48h", sub: "Fast bank transfers" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-card/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl text-center shadow-lg hover:border-primary/20 transition-all duration-300">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">{stat.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Brand Mission & Values */}
        <div className="bg-card/45 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Our Mission</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
              We believe creators should own their audience, control their pricing, and keep the vast majority of their earnings. Other legacy networks take up to 20% commission rates while limiting direct fan interactions. CreatorHub charges just 5%, offering robust tools like dynamic subscription plans, lockable direct messaging media, custom user branding themes, and rapid financial payouts.
            </p>
          </div>

          <div className="border-t border-white/5 pt-8">
            <h3 className="text-base font-bold text-white mb-6">Core Values We Live By</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Creator Ownership",
                  desc: "Your content, your subscribers, and your media belong purely to you. Period.",
                },
                {
                  icon: Sparkles,
                  title: "UX Excellence",
                  desc: "A stunning, customisable glassmorphic design that matches premium branding aesthetics.",
                },
                {
                  icon: Heart,
                  title: "Fan Connection",
                  desc: "Direct private messaging and comments to foster authentic creative support.",
                },
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-white text-sm">{value.title}</h4>
                    <p className="text-xs text-text-muted leading-relaxed">{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/10 p-8 rounded-3xl space-y-5">
          <h2 className="text-xl sm:text-2xl font-black text-white">Ready to take control?</h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
            Join thousands of creators who are already scaling their audiences and building their micro-economies on CreatorHub.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white rounded-full text-xs font-black shadow-lg shadow-primary/15 transition-all flex items-center gap-1.5"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all border border-white/5"
            >
              Explore Channels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
