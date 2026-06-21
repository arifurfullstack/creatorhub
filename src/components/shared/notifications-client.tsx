"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle,
  Trash2,
  User,
  Heart,
  MessageSquare,
  CreditCard,
  Megaphone,
  ArrowRight,
  Sparkles,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "@/app/actions/notification";

interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const getNotificationStyles = (type: string) => {
  switch (type) {
    case "new_subscriber":
      return {
        icon: Sparkles,
        color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
        label: "New Subscriber",
      };
    case "new_follower":
      return {
        icon: User,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        label: "New Follower",
      };
    case "like":
      return {
        icon: Heart,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        label: "Like",
      };
    case "comment":
      return {
        icon: MessageSquare,
        color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
        label: "Comment",
      };
    case "purchase":
      return {
        icon: CreditCard,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        label: "Purchase",
      };
    case "message":
      return {
        icon: MessageSquare,
        color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
        label: "Message",
      };
    case "announcement":
    default:
      return {
        icon: Megaphone,
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        label: "System Announcement",
      };
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "system" | "activity">("all");
  const [loading, setLoading] = useState(false);

  const hasUnread = notifications.some((n) => !n.isRead);

  // Grouping notifications helper
  const groupNotificationsByDate = (items: NotificationItem[]) => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const older: NotificationItem[] = [];

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    items.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

      if (itemDay.getTime() === todayDate.getTime()) {
        today.push(item);
      } else if (itemDay.getTime() === yesterdayDate.getTime()) {
        yesterday.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, older };
  };

  // Filter actions
  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "system") return item.type === "announcement";
    if (filter === "activity") return item.type !== "announcement";
    return true;
  });

  const grouped = groupNotificationsByDate(filteredNotifications);

  // Event handlers
  const handleMarkAsRead = async (id: string, link: string | null) => {
    try {
      const target = notifications.find((n) => n.id === id);
      if (target && !target.isRead) {
        // Optimistic UI updates
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        await markNotificationAsRead(id);
      }
      
      if (link) {
        window.location.href = link;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notification as read");
      // Rollback optimistic update
      setNotifications(initialNotifications);
    }
  };

  const handleMarkAllRead = async () => {
    if (!hasUnread) return;
    setLoading(true);
    try {
      // Optimistic update
      const cached = [...notifications];
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      
      const res = await markAllNotificationsAsRead();
      if (res.success) {
        toast.success("All notifications marked as read");
      } else {
        setNotifications(cached);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (
      !confirm(
        "Are you sure you want to delete all notifications? This action cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await clearAllNotifications();
      if (res.success) {
        setNotifications([]);
        toast.success("Notifications inbox cleared");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to clear notifications");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 110, damping: 15 } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Notifications</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Stay updated with subscriptions, actions, and transactions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={!hasUnread || loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/5 hover:border-white/10 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0 || loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500/10 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-500/10 text-red-400 hover:text-white border border-red-500/10 hover:border-transparent rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear inbox
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-2 scrollbar-none">
        {[
          { id: "all", label: "All notifications" },
          { id: "unread", label: "Unread" },
          { id: "system", label: "System updates" },
          { id: "activity", label: "Social & Earnings" },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/15"
                  : "text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
              {tab.id === "unread" && hasUnread && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-black text-white">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="flex-1 flex flex-col gap-6">
        {filteredNotifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center glassmorphism rounded-3xl border border-white/5 bg-card/25 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-base font-extrabold text-white">Inbox is quiet</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
              {filter === "unread"
                ? "No unread notifications right now. Excellent job keeping up!"
                : filter === "system"
                ? "No platform announcements are posted at the moment."
                : "You don't have any notifications under this section."}
            </p>
            <Link
              href="/feed"
              className="mt-6 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white rounded-full text-xs font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]"
            >
              Back to Newsfeed
            </Link>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {/* TODAY SECTION */}
              {grouped.today.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted pl-1">
                    Today
                  </h4>
                  <div className="space-y-2.5">
                    {grouped.today.map((item) => (
                      <NotificationCard
                        key={item.id}
                        item={item}
                        onMarkRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* YESTERDAY SECTION */}
              {grouped.yesterday.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted pl-1">
                    Yesterday
                  </h4>
                  <div className="space-y-2.5">
                    {grouped.yesterday.map((item) => (
                      <NotificationCard
                        key={item.id}
                        item={item}
                        onMarkRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* OLDER SECTION */}
              {grouped.older.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted pl-1">
                    Older Notifications
                  </h4>
                  <div className="space-y-2.5">
                    {grouped.older.map((item) => (
                      <NotificationCard
                        key={item.id}
                        item={item}
                        onMarkRead={handleMarkAsRead}
                      />
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Single Card Subcomponent
function NotificationCard({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead: (id: string, link: string | null) => void;
}) {
  const styles = getNotificationStyles(item.type);
  const Icon = styles.icon;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 110, damping: 15 } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      layoutId={item.id}
      onClick={() => onMarkRead(item.id, item.link)}
      className={`group relative p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer overflow-hidden ${
        item.isRead
          ? "bg-card/25 hover:bg-card/45 border-white/5 hover:border-white/10"
          : "bg-primary/5 hover:bg-primary/10 border-primary/15 hover:border-primary/25 shadow-lg shadow-primary/5"
      }`}
    >
      {/* Dynamic Background Glow for Unread Items */}
      {!item.isRead && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      )}

      {/* Category Icon */}
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${styles.color}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
            {styles.label}
          </span>
          <span className="text-[10px] text-text-muted shrink-0">
            {formatTimeAgo(item.createdAt)}
          </span>
        </div>

        <h3
          className={`text-sm font-extrabold leading-snug mt-1 truncate ${
            item.isRead ? "text-white/80" : "text-white"
          }`}
        >
          {item.title}
        </h3>
        <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
          {item.content}
        </p>

        {item.link && (
          <div className="flex items-center gap-1 text-[10px] text-primary font-extrabold mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Unread Glowing Dot indicator */}
      {!item.isRead && (
        <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full ring-2 ring-primary/20 shadow-[0_0_8px_#FF4FA3]" />
      )}
    </motion.div>
  );
}
