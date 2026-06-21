"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { getUnreadNotificationsCount } from "@/app/actions/notification";
import { getCreatorUsername } from "@/app/actions/creator";
import {
  Menu,
  X,
  Bell,
  MessageSquare,
  Shield,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Compass,
  Sun,
  Moon,
  Home,
  Globe,
  Info,
  Mail,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  logoText?: string;
  defaultTheme?: string;
}

export default function Navbar({ logoText = "CREATORHUB", defaultTheme = "dark" }: NavbarProps) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Theme states
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creatorUsername, setCreatorUsername] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  // Track window scroll positioning for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch creator username dynamically if logged in as creator
  useEffect(() => {
    if (session?.user?.id && userRole === "creator") {
      getCreatorUsername()
        .then((username) => setCreatorUsername(username))
        .catch((err) => console.error("Error fetching creator username:", err));
    } else {
      setCreatorUsername(null);
    }
  }, [session, userRole]);

  // Sync theme preference on component mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    
    // Clear any previous theme classes from documentElement
    const customThemes = ["theme-cyberpunk", "theme-emerald", "theme-obsidian", "theme-rose", "theme-sapphire", "theme-glass-gradient"];
    customThemes.forEach((t) => document.documentElement.classList.remove(t));
    
    // If defaultTheme is a custom theme, add it
    if (defaultTheme.startsWith("theme-")) {
      document.documentElement.classList.add(defaultTheme);
    }
    
    const initialTheme = savedTheme || (defaultTheme === "light" ? "light" : "dark");
    setTheme(initialTheme as any);
    
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [defaultTheme]);

  // Fetch unread notifications count with periodic updates
  useEffect(() => {
    setDropdownOpen(false); // Close dropdown on navigation/path changes
    if (!session?.user?.id) {
      setUnreadCount(0);
      return;
    }
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 15000); // poll every 15 seconds
    return () => clearInterval(interval);
  }, [session, pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getRoleRing = (role: string) => {
    switch (role) {
      case "admin":
        return "ring-2 ring-purple-500 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(168,85,247,0.4)]";
      case "moderator":
        return "ring-2 ring-yellow-500 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(234,179,8,0.4)]";
      case "creator":
        return "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(255,79,163,0.4)]";
      case "fan":
      default:
        return "ring-2 ring-pink-400 ring-offset-2 ring-offset-background shadow-[0_0_12px_rgba(244,143,177,0.3)]";
    }
  };

  const profileLink = userRole === "creator"
    ? (creatorUsername ? `/creator/${creatorUsername}` : `/settings`)
    : `/settings`;

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    ...(!session
      ? [
          { label: "About", href: "/about", icon: Info },
          { label: "Contact", href: "/contact", icon: Mail },
        ]
      : []),
    ...(session
      ? [
          { label: "Feed", href: "/feed", icon: Globe },
          { label: "Messages", href: "/messages", icon: MessageSquare },
          ...(userRole === "creator"
            ? [{ label: "Creator Hub", href: "/dashboard/creator", icon: LayoutDashboard }]
            : []),
          ...(userRole === "fan"
            ? [{ label: "Fan Dashboard", href: "/dashboard/fan", icon: LayoutDashboard }]
            : []),
          ...(userRole === "admin"
            ? [{ label: "Admin Portal", href: "/dashboard/admin", icon: Shield }]
            : []),
          ...(userRole === "moderator"
            ? [{ label: "Moderator Panel", href: "/dashboard/moderator", icon: Shield }]
            : []),
        ]
      : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto transition-all duration-500 rounded-2xl navbar-liquid-glass ${
          scrolled
            ? "py-2 px-6 shadow-2xl"
            : "py-3.5 px-6 shadow-xl"
        }`}
      >
        <div className="w-full">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                {logoText.startsWith("/") || logoText.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoText}
                    alt="Logo"
                    className="h-8 max-w-[150px] object-contain group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <span className="text-xl font-black tracking-wider text-gradient group-hover:brightness-110 transition-all duration-300">
                    {logoText}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-xs font-bold tracking-wide transition-all py-2 px-4 rounded-full group flex items-center gap-1.5 ${
                      isActive ? "text-text-main" : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavLink"
                        className="absolute inset-0 bg-current/[0.06] border border-current/10 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 shrink-0 relative z-10" />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Action Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dynamic Theme Toggle (Desktop) */}
              <button
                onClick={toggleTheme}
                className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-muted border border-transparent hover:border-border transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {!mounted ? (
                  <div className="w-5 h-5 animate-pulse rounded bg-muted" />
                ) : theme === "light" ? (
                  <Moon className="w-5 h-5 text-indigo-500 animate-fadeIn" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500 animate-fadeIn" />
                )}
              </button>

              {isPending ? (
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              ) : session ? (
                <div className="flex items-center space-x-4">
                  {/* Notifications Link */}
                  <Link
                    href="/notifications"
                    className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-muted border border-transparent hover:border-border transition-all relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-background shadow-[0_0_10px_rgba(255,79,163,0.6)] animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Dropdown Profile Shortcut */}
                  <div className="relative">
                    {dropdownOpen && (
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setDropdownOpen(false)}
                      />
                    )}
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-0.5 rounded-full hover:brightness-110 active:scale-95 transition-all duration-300 relative z-50 cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white overflow-hidden transition-all ${getRoleRing(
                          userRole
                        )}`}
                      >
                        {userImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={userImage}
                            alt={userName || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (userName || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-3 w-64 rounded-3xl glass-card-static shadow-2xl p-3 z-50 flex flex-col gap-1.5"
                        >
                          {/* User Card Header */}
                          <Link
                            href={profileLink}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 p-2.5 border-b border-border/50 mb-1.5 hover:bg-white/[0.04] rounded-2xl transition-all"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white overflow-hidden shrink-0 ${getRoleRing(
                                userRole
                              )}`}
                            >
                              {userImage ? (
                                <img
                                  src={userImage}
                                  alt={userName || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (userName || "U").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-foreground truncate leading-tight">
                                {userName}
                              </p>
                              <p className="text-[10px] text-text-muted truncate leading-none mt-1">
                                {session?.user?.email}
                              </p>
                              <span
                                className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mt-2 ${
                                  userRole === "admin"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    : userRole === "moderator"
                                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                    : userRole === "creator"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-pink-400/10 text-pink-400 border-pink-400/20"
                                }`}
                              >
                                {userRole === "admin"
                                  ? "Admin"
                                  : userRole === "moderator"
                                  ? "Moderator"
                                  : userRole === "creator"
                                  ? "Creator"
                                  : "Subscriber"}
                              </span>
                            </div>
                          </Link>

                          {/* Menu items */}
                          <Link
                            href={profileLink}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all font-semibold animate-fadeIn"
                          >
                            <UserIcon className="w-4 h-4 shrink-0 text-text-muted" />
                            {userRole === "creator" ? "My Profile Channel" : "My Profile Settings"}
                          </Link>

                          {userRole === "creator" && (
                            <Link
                              href="/dashboard/creator"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all font-semibold animate-fadeIn"
                            >
                              <LayoutDashboard className="w-4 h-4 shrink-0 text-primary" />
                              Creator Hub
                            </Link>
                          )}

                          {userRole === "fan" && (
                            <Link
                              href="/dashboard/fan"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all font-semibold animate-fadeIn"
                            >
                              <LayoutDashboard className="w-4 h-4 shrink-0 text-primary" />
                              Fan Dashboard
                            </Link>
                          )}

                          {(userRole === "admin" || userRole === "moderator") && (
                            <Link
                              href={
                                userRole === "admin"
                                  ? "/dashboard/admin"
                                  : "/dashboard/moderator"
                              }
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all font-semibold animate-fadeIn"
                            >
                              <Shield className="w-4 h-4 shrink-0 text-purple-400" />
                              {userRole === "admin" ? "Admin Suite" : "Moderator Panel"}
                            </Link>
                          )}

                          <Link
                            href="/notifications"
                            onClick={() => setDropdownOpen(false)}
                            className="flex justify-between items-center px-3.5 py-2.5 text-xs text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all font-semibold animate-fadeIn"
                          >
                            <div className="flex items-center gap-3">
                              <Bell className="w-4 h-4 shrink-0 text-text-muted" />
                              <span>Notifications Feed</span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-primary text-[8px] font-black text-white">
                                {unreadCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/messages"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all font-semibold animate-fadeIn"
                          >
                            <MessageSquare className="w-4 h-4 shrink-0 text-text-muted" />
                            Direct Messages
                          </Link>

                          {/* Separator & Logout */}
                          <div className="border-t border-border my-1" />

                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-semibold text-left w-full cursor-pointer animate-fadeIn"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            Log Out Account
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="text-sm font-semibold text-text-muted hover:text-foreground transition-all px-4 py-2"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-xs font-bold bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white px-5 py-2.5 rounded-full shadow-lg shadow-primary/15 transition-all hover:scale-[1.01]"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions section */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Notifications Link (Mobile) */}
              {session && (
                <Link
                  href="/notifications"
                  className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-muted border border-transparent transition-all relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5.5 h-5.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white ring-2 ring-background shadow-[0_0_8px_rgba(255,79,163,0.6)] animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Dynamic Theme Toggle (Mobile) */}
              <button
                onClick={toggleTheme}
                className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-muted border border-transparent transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {!mounted ? (
                  <div className="w-5.5 h-5.5 animate-pulse rounded bg-muted" />
                ) : theme === "light" ? (
                  <Moon className="w-5.5 h-5.5 text-indigo-500" />
                ) : (
                  <Sun className="w-5.5 h-5.5 text-yellow-500" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-text-muted hover:text-foreground rounded-lg hover:bg-white/5 transition-all"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu Sheet */}
      <div
        className={`fixed inset-0 z-[60] md:hidden pointer-events-none transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500"
        />

        {/* Slide panel */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-72 glass-card-static border-l border-border/50 p-6 flex flex-col gap-6 shadow-2xl transition-transform duration-500 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            {logoText.startsWith("/") || logoText.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoText}
                alt="Logo"
                className="h-7 max-w-[130px] object-contain"
              />
            ) : (
              <span className="text-lg font-black tracking-wider text-gradient">{logoText}</span>
            )}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-muted border border-border transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links list */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-muted hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}

            {session && (
              <Link
                href="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex justify-between items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname === "/notifications"
                    ? "bg-primary text-white"
                    : "text-text-muted hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 shrink-0 text-text-muted" />
                  <span>Notifications Feed</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-background animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
          </nav>

          {/* Session settings */}
          {session ? (
            <div className="mt-auto border-t border-border pt-5 space-y-4">
              <Link
                href={profileLink}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 hover:bg-white/[0.04] p-1.5 rounded-2xl transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0 ${getRoleRing(
                    userRole
                  )}`}
                >
                  {userImage ? (
                    <img src={userImage} alt={userName || "User"} className="w-full h-full object-cover" />
                  ) : (
                    (userName || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-foreground truncate leading-none">{userName}</p>
                  <span className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5 block">
                    {userRole}
                  </span>
                </div>
              </Link>

              <div className="space-y-1">
                <Link
                  href={profileLink}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-text-muted hover:text-foreground hover:bg-muted rounded-xl transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  {userRole === "creator" ? "My Profile Channel" : "My Profile Settings"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/5 rounded-xl transition-all text-left mt-0.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-auto border-t border-border pt-5 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-text-muted hover:text-foreground bg-muted border border-border rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
