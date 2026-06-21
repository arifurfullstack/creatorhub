"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { LucideIcon, Menu, X, Bell, MessageSquare, Shield, LayoutDashboard, User as UserIcon, LogOut, Compass } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = (session?.user as any)?.role;
  const userId = session?.user?.id;
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Explore", href: "/", icon: Compass },
    ...(session
      ? [
          { label: "Feed", href: "/feed", icon: Compass },
          { label: "Messages", href: "/messages", icon: MessageSquare },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glassmorphism border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-gradient">
                CREATORHUB
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                    isActive ? "text-primary" : "text-text-muted hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isPending ? (
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Link */}
                <Link
                  href="/notifications"
                  className="p-2 text-text-muted hover:text-white rounded-full hover:bg-white/5 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background" />
                </Link>

                {/* Dashboard / Moderation Shortcuts */}
                {userRole === "creator" && (
                  <Link
                    href="/dashboard/creator"
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Creator Hub
                  </Link>
                )}

                {userRole === "moderator" && (
                  <Link
                    href="/dashboard/moderator"
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Moderator
                  </Link>
                )}

                {userRole === "admin" && (
                  <Link
                    href="/dashboard/admin"
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-purple-500/50 text-purple-500 hover:bg-purple-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Portal
                  </Link>
                )}

                {/* User Dropdown Profile Shortcut */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-all">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-white/10">
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

                  {/* Simple Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-white/5 shadow-2xl p-2 hidden group-hover:block hover:block transition-all">
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <p className="text-sm font-semibold truncate">{userName}</p>
                      <p className="text-xs text-text-muted truncate capitalize">{userRole}</p>
                    </div>

                    <Link
                      href={userRole === "creator" ? `/creator/${userId}` : `/settings`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 hover:text-primary rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-text-muted hover:text-white transition-colors px-3 py-1.5"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white px-5 py-2 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile hamburger menu toggle for small screens */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-muted hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-card/95 backdrop-blur-xl px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-text-muted truncate capitalize">{userRole}</p>
              </div>
              {userRole === "creator" && (
                <Link
                  href="/dashboard/creator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Creator Dashboard
                </Link>
              )}
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 text-base font-medium text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/5 flex flex-col space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-3 py-2 text-base font-medium text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-3 py-2 text-base font-semibold bg-gradient-to-r from-primary to-secondary text-white rounded-full transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
