"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Shield, Zap, Sparkles, MessageSquare, CreditCard, Search, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

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
      desc: "Set up multiple tier subscriptions (Basic, Premium, VIP) and offer custom perks. Give your fans full access to your creations.",
      color: "text-pink-400 bg-pink-500/10",
      className: "md:col-span-2 md:row-span-2",
    },
    {
      icon: Zap,
      title: "Locked Premium Content",
      desc: "Sell exclusive posts, videos, or files directly with individual unlock pricing.",
      color: "text-purple-400 bg-purple-500/10",
      className: "md:col-span-2 md:row-span-1",
    },
    {
      icon: MessageSquare,
      title: "Direct Fan Messaging",
      desc: "Engage with VIP members. Offer locked direct messages.",
      color: "text-blue-400 bg-blue-500/10",
      className: "md:col-span-1 md:row-span-1",
    },
    {
      icon: Shield,
      title: "Commission Control",
      desc: "Fast and secure payouts with transparent minimal fees.",
      color: "text-green-400 bg-green-500/10",
      className: "md:col-span-1 md:row-span-1",
    },
  ];

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const scaleHover = {
    hover: { scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } },
    tap: { scale: 0.985 },
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#09090b] text-white">
      {/* Background Liquid Mesh Evolved */}
      <div className="liquid-mesh-container">
        <div className="liquid-mesh-blob liquid-mesh-blob-1" />
        <div className="liquid-mesh-blob liquid-mesh-blob-2" />
        <div className="liquid-mesh-blob liquid-mesh-blob-3" />
      </div>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="relative pt-36 md:pt-44 pb-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 z-10 lg:grid lg:grid-cols-12 lg:gap-12 items-center text-left"
      >
        {/* Left Column: Copywriting & Search */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            variants={fadeInUpVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/[0.03] border border-foreground/10 text-xs font-bold text-primary mb-2 hover:bg-foreground/[0.06] hover:border-primary/30 transition-all cursor-pointer shadow-sm relative group"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-secondary" />
            <span className="relative z-10 tracking-wide uppercase text-[10px] text-text-main font-bold">
              The Premium Creator Economy SaaS is Live
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUpVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] font-archivo"
          >
            Where Passion Meets <br />
            <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-purple-400 bg-clip-text text-transparent">
              Premium Value
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUpVariants}
            className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed"
          >
            Monetize your creative work, establish membership levels, lock exclusive files, and interact directly with your core fan community.
          </motion.p>

          {/* Global Search Bar */}
          <motion.div variants={fadeInUpVariants} className="max-w-xl pt-2">
            <div className="relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-r from-primary/30 to-secondary/30 focus-within:from-primary focus-within:to-secondary transition-all duration-500 shadow-xl shadow-black/10">
              <div className="flex items-center bg-[#09090b]/80 backdrop-blur-xl rounded-[15px] px-4 py-2">
                <Search className="w-5 h-5 text-text-muted mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators by username, category, tags..."
                  className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-white py-2 text-sm placeholder-text-muted/60"
                />
                <Link
                  href={`/explore?q=${searchQuery}`}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 shrink-0"
                >
                  Search
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={fadeInUpVariants}
            className="grid grid-cols-3 gap-6 max-w-md border-t border-white/5 pt-8 text-left"
          >
            {[
              { value: "50K+", label: "Creators" },
              { value: "$35M+", label: "Paid Out", color: "text-primary" },
              { value: "2.5M+", label: "Active Fans" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className={`text-2xl sm:text-3xl font-black ${stat.color || "text-white"}`}>{stat.value}</div>
                <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest leading-none">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Layered Floating Glass Showcase (Apple Spatial/VisionOS Style) */}
        <div className="lg:col-span-5 relative mt-16 lg:mt-0 h-[450px] w-full flex items-center justify-center">
          {/* Ambient Glow behind the cards */}
          <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[100px] -z-10 animate-pulse" />
          <div className="absolute w-72 h-72 rounded-full bg-secondary/5 blur-[120px] -z-10 animate-float translate-x-20 -translate-y-10" />

          {/* Card 1: Main Mock Creator Profile Card */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="absolute w-72 xs:w-80 glass-card-static rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-0 z-20 hover:border-primary/40 transition-colors"
          >
            {/* Banner Cover */}
            <div className="h-20 bg-gradient-to-r from-primary/20 via-secondary/20 to-purple-500/20 relative">
              <div className="absolute right-4 top-3 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider">
                Digital Art
              </div>
            </div>
            {/* Details */}
            <div className="px-5 pb-5 pt-8 relative">
              {/* Avatar overlay */}
              <div className="absolute top-[-24px] left-5 w-12 h-12 rounded-full border-2 border-background overflow-hidden shadow-lg bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                  alt="Aria Vance"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-sm text-white">Aria Vance</h4>
                <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />
              </div>
              <p className="text-[10px] text-text-muted mb-3">@ariavance</p>
              
              <div className="flex justify-between items-center bg-foreground/[0.03] border border-foreground/5 rounded-2xl p-2.5 mb-4 text-center">
                <div>
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Subscribers</p>
                  <p className="font-black text-xs text-white">4.2k</p>
                </div>
                <div className="w-[1px] h-6 bg-border/40" />
                <div>
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Monthly Tier</p>
                  <p className="font-black text-xs text-primary">$5/mo</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-[10px] font-black hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/20 cursor-pointer">
                  Subscribe VIP
                </button>
                <button className="px-3 py-2 bg-foreground/[0.05] hover:bg-foreground/[0.08] text-white border border-foreground/5 rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                  Chat
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Revenue Earnings Status Overlay */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-6 right-0 xs:right-4 w-48 glass-card-static rounded-2xl p-4 border border-white/10 shadow-2xl z-30 flex items-center gap-3 hover:border-green-500/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] text-text-muted font-bold uppercase tracking-wider leading-none">Monthly Payout</p>
              <p className="text-sm font-black text-white mt-1 leading-none">$14,890.00</p>
              <span className="text-[8px] text-green-400 font-bold mt-1 inline-block leading-none">+24.5% this mo.</span>
            </div>
          </motion.div>

          {/* Card 3: Interactive unlock notification */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: 1.2 }}
            className="absolute top-6 left-0 xs:left-4 w-52 glass-card-static rounded-2xl p-3.5 border border-white/10 shadow-2xl z-30 flex items-start gap-2.5 hover:border-secondary/40 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary text-[10px] font-black">
              KS
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold text-white leading-none">Kenji Sato</span>
                <span className="text-[7px] text-text-muted">Just now</span>
              </div>
              <p className="text-[8px] text-text-muted mt-1 leading-normal">
                Unlocked <span className="text-secondary font-black">Exclusive Beats 🎧</span> for <span className="text-white font-black">$15.00</span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Creators Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUpVariants}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Featured Creators</h2>
            <p className="text-xs text-text-muted">Discover top-tier profiles offering exclusive membership content</p>
          </div>
          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors uppercase tracking-wider"
          >
            Explore All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {mockCreators.map((creator) => (
            <motion.div
              key={creator.id}
              variants={fadeInUpVariants}
              whileHover="hover"
              whileTap="tap"
              className="glass-card-premium rounded-2xl overflow-hidden group"
            >
              {/* Cover Banner */}
              <div className="relative h-32 w-full overflow-hidden bg-white/[0.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={creator.banner}
                  alt={creator.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              </div>

              {/* Creator details */}
              <div className="p-5 relative pt-10">
                {/* Profile avatar overlapping cover */}
                <div className="absolute top-[-28px] left-5 w-16 h-16 rounded-full border-4 border-card bg-card overflow-hidden shadow-lg group-hover:scale-105 transition-all duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-bold text-white leading-none text-sm group-hover:text-primary transition-colors">{creator.name}</h3>
                  {creator.isVerified && <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />}
                </div>
                <p className="text-xs text-text-muted mb-4">@{creator.username}</p>
                <div className="inline-block px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-text-muted mb-4 uppercase tracking-wider">
                  {creator.category}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Subscribers</p>
                    <p className="font-extrabold text-white text-xs mt-0.5">{creator.subscribers}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Tiers From</p>
                    <p className="font-extrabold text-primary text-xs mt-0.5">{creator.minPrice}/mo</p>
                  </div>
                </div>

                <Link
                  href={`/creator/${creator.username}`}
                  className="w-full text-center block mt-5 py-3 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all duration-300"
                >
                  View Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-24 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 border-t border-white/5 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUpVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Everything You Need to Scale
          </h2>
          <p className="text-text-muted text-sm leading-relaxed max-w-2xl mx-auto">
            Our luxury setup removes complex steps to simplify creator monetization. Focus on creating value; we handle the subscriptions, gates, messaging, and withdrawals.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px] md:auto-rows-[240px]"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                variants={fadeInUpVariants}
                className={`glass-card-premium p-6 rounded-3xl relative group flex flex-col justify-between overflow-hidden ${feature.className}`}
              >
                {/* Visual mesh orb on corner */}
                <div className="absolute top-[-30px] right-[-30px] w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-125 transition-transform duration-700 blur-xl opacity-80" />
                
                <div className="relative z-10">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 ${feature.color}`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed max-w-sm">{feature.desc}</p>
                </div>
                <div className="text-[10px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity tracking-widest mt-4">
                  Learn More &rarr;
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Dynamic CTA Footer Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto text-center sm:px-6 lg:px-8 border-t border-white/5 relative z-10">
        <div className="gradient-orb w-[300px] h-[300px] bg-primary/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUpVariants}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to Monetize Your Influence?</h2>
          <p className="text-text-muted text-sm mb-10 max-w-lg mx-auto leading-relaxed">
            Join thousands of modern creators setting up membership programs, gating assets, and earning payouts directly into their accounts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <Link
              href="/auth/register?role=creator"
              className="px-8 py-3.5 btn-liquid text-white font-bold rounded-full shadow-lg shadow-primary/10 text-sm w-full sm:w-auto text-center"
            >
              Start Earning
            </Link>
            <Link
              href="/auth/register?role=fan"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-[0.98] font-bold rounded-full transition-all text-sm w-full sm:w-auto text-center backdrop-blur-md"
            >
              Join as a Fan
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-text-muted relative z-10 space-y-4">
        <div className="flex justify-center gap-6 text-[11px] font-semibold">
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} CreatorHub Inc. All rights reserved. Built with Next.js 16, React 19, and Better Auth.</p>
      </footer>
    </div>
  );
}
