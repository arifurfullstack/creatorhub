"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Shield, Zap, Sparkles, MessageSquare, CreditCard, Search, ArrowRight, Star } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockCreators = [
    {
      id: "creator-1",
      name: "Aria Vance",
      username: "ariavance",
      category: "Digital Art & 3D",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
      subscribers: "4.2k",
      minPrice: "$5",
      isVerified: true,
    },
    {
      id: "creator-2",
      name: "Marcus Cole",
      username: "marcusmusic",
      category: "Music & Beats",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      banner: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600",
      subscribers: "1.8k",
      minPrice: "$8",
      isVerified: true,
    },
    {
      id: "creator-3",
      name: "Elena Rostova",
      username: "elenafit",
      category: "Fitness & Nutrition",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      banner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
      subscribers: "12.5k",
      minPrice: "$12",
      isVerified: true,
    },
    {
      id: "creator-4",
      name: "Kenji Sato",
      username: "kenji3d",
      category: "Architecture & Design",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
      banner: "https://images.unsplash.com/photo-1503387762-592edd58f4e8?auto=format&fit=crop&q=80&w=600",
      subscribers: "920",
      minPrice: "$15",
      isVerified: false,
    },
  ];

  const features = [
    {
      icon: CreditCard,
      title: "Monthly Memberships",
      desc: "Set up multiple tier subscriptions (Basic, Premium, VIP) and offer custom perks.",
      color: "text-pink-400 bg-pink-500/10",
    },
    {
      icon: Zap,
      title: "Locked Premium Content",
      desc: "Sell exclusive posts, videos, or files directly with individual unlock pricing.",
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      icon: MessageSquare,
      title: "Direct Fan Messaging",
      desc: "Engage with VIP members. Offer locked direct messages that require payments to open.",
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      icon: Shield,
      title: "Commission Control",
      desc: "Fast and secure payouts with transparent minimal fees. Monitor earnings easily.",
      color: "text-green-400 bg-green-500/10",
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Glowing Ambient Orbs */}
      <div className="gradient-orb w-[450px] h-[450px] bg-primary/25 top-[-100px] right-[-100px]" />
      <div className="gradient-orb w-[450px] h-[450px] bg-secondary/15 bottom-[-100px] left-[-100px]" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 max-w-7xl mx-auto text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary mb-6 hover:bg-white/10 transition-colors cursor-pointer">
          <Sparkles className="w-3.5 h-3.5" />
          The Premium Creator Economy SaaS is Live
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-none">
          Where Passion Meets <br />
          <span className="text-gradient">Premium Value</span>
        </h1>

        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Monetize your creative work, establish membership levels, lock exclusive files, and interact directly with your core fan community.
        </p>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative gradient-border p-[1px]">
            <div className="flex items-center bg-card rounded-xl px-4 py-1.5">
              <Search className="w-5 h-5 text-text-muted mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by username, category, tags..."
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-white py-2"
              />
              <Link
                href={`/search?q=${searchQuery}`}
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shrink-0"
              >
                Search
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto border-t border-white/5 pt-10 text-center">
          <div>
            <div className="text-3xl font-black text-white">50K+</div>
            <div className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">Creators</div>
          </div>
          <div>
            <div className="text-3xl font-black text-primary">$35M+</div>
            <div className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">Paid Out</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">2.5M+</div>
            <div className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">Active Fans</div>
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Featured Creators</h2>
            <p className="text-sm text-text-muted">Discover top-tier profiles offering exclusive membership content</p>
          </div>
          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Explore All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCreators.map((creator) => (
            <div
              key={creator.id}
              className="bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group"
            >
              {/* Cover Banner */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={creator.banner}
                alt={creator.name}
                className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />

              {/* Creator details */}
              <div className="p-5 relative pt-10">
                {/* Profile avatar overlapping cover */}
                <div className="absolute top-[-28px] left-5 w-16 h-16 rounded-full border-4 border-card bg-card overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-bold text-white leading-none text-base">{creator.name}</h3>
                  {creator.isVerified && <Star className="w-4 h-4 fill-primary text-primary shrink-0" />}
                </div>
                <p className="text-xs text-text-muted mb-4">@{creator.username}</p>
                <div className="inline-block px-2.5 py-1 bg-white/5 rounded-full text-xs font-semibold text-text-muted mb-4">
                  {creator.category}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase">Subscribers</p>
                    <p className="font-bold text-white text-sm">{creator.subscribers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase">Tiers From</p>
                    <p className="font-bold text-primary text-sm">{creator.minPrice}/mo</p>
                  </div>
                </div>

                <Link
                  href={`/creator/${creator.username}`}
                  className="w-full text-center block mt-5 py-2.5 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-text-muted text-base leading-relaxed">
            Our luxury setup removes complex steps to simplify creator monetization. Focus on creating value; we handle the subscriptions, gates, messaging, and withdrawals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-card border border-white/5 p-6 rounded-2xl relative hover:border-white/10 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dynamic CTA Footer Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center sm:px-6 lg:px-8 border-t border-white/5 relative">
        <div className="gradient-orb w-[250px] h-[250px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Monetize Your Influence?</h2>
          <p className="text-text-muted text-base mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of modern creators setting up membership programs, gating assets, and earning payouts directly into their accounts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/auth/register?role=creator"
              className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white font-bold rounded-full shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] w-full sm:w-auto"
            >
              Start Earning
            </Link>
            <Link
              href="/auth/register?role=fan"
              className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-full transition-all w-full sm:w-auto"
            >
              Join as a Fan
            </Link>
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-text-muted">
        <p>&copy; {new Date().getFullYear()} CreatorHub Inc. All rights reserved. Built with Next.js 16, React 19, and Better Auth.</p>
      </footer>
    </div>
  );
}
