"use client";

import { Bell, Star, Crown, Trophy, RefreshCw, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type NotifType = "achievement" | "leaderboard" | "info" | "reset" | "league";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

const TYPE_META: Record<
  NotifType,
  { Icon: React.ElementType; color: string; bg: string; label: string }
> = {
  achievement: { Icon: Star,      color: "var(--gold)",  bg: "rgba(201,168,76,0.12)",  label: "Achievement" },
  leaderboard: { Icon: Crown,     color: "#a78bfa",       bg: "rgba(167,139,250,0.12)", label: "Leaderboard" },
  league:      { Icon: Trophy,    color: "#60a5fa",       bg: "rgba(96,165,250,0.12)",  label: "League"      },
  reset:       { Icon: RefreshCw, color: "#34d399",       bg: "rgba(52,211,153,0.12)",  label: "Reset"       },
  info:        { Icon: Info,      color: "var(--text-2)", bg: "rgba(180,180,180,0.08)", label: "Notice"      },
};

function getTypeMeta(type: string) {
  return TYPE_META[type as NotifType] ?? TYPE_META.info;
}

type Props = { userId: string | null };

export default function NavNotifications({ userId }: Props) {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNew,        setHasNew]        = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setNotifications(data as Notification[]);
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHasNew(false);
  }

  useEffect(() => { fetchNotifications(); }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`nav-notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setHasNew(true);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  }

  function formatTime(ts: string) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60)    return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger */}
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150"
        style={{
          background: open ? "var(--gold-glow)" : "transparent",
          border:     open ? "1px solid var(--gold-border)" : "1px solid transparent",
          color:      open ? "var(--gold)" : "var(--text-3)",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.border = "1px solid var(--border-mid)";
            e.currentTarget.style.color  = "var(--text-2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.border = "1px solid transparent";
            e.currentTarget.style.color  = "var(--text-3)";
          }
        }}
      >
        {/* Pulse ring when new notification arrives */}
        {hasNew && !open && (
          <motion.span
            className="absolute inset-0 rounded-xl"
            style={{ border: "1px solid var(--gold)" }}
            animate={{ opacity: [0.8, 0], scale: [1, 1.5] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }}
          />
        )}
        <Bell size={15} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full font-mono font-bold text-[9px] px-1"
            style={{ background: "var(--gold)", color: "#0a0800" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-[340px] rounded-xl overflow-hidden z-50 flex flex-col"
            style={{
              background:  "var(--surface)",
              border:      "1px solid var(--border-mid)",
              boxShadow:   "0 12px 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={13} style={{ color: "var(--gold)" }} />
                <span className="font-mono text-xs font-bold tracking-[0.15em] uppercase" style={{ color: "var(--text-1)" }}>
                  Notifications
                </span>
              </div>
              {notifications.length > 0 && (
                <span className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                  {notifications.length} total
                </span>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell size={22} className="mx-auto mb-2.5 opacity-20" style={{ color: "var(--text-3)" }} />
                  <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
                    No notifications yet
                  </p>
                  <p className="font-mono text-[10px] mt-1" style={{ color: "var(--text-3)", opacity: 0.6 }}>
                    Achievements &amp; rank updates appear here
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const meta = getTypeMeta(n.type);
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 transition-colors"
                      style={{
                        borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
                        background:   n.read ? "transparent" : `${meta.bg}`,
                      }}
                    >
                      {/* Type icon */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(() => { const I = meta.Icon as any; return <I size={13} style={{ color: meta.color }} strokeWidth={1.5} />; })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Category + time row */}
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="font-mono text-[8px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded"
                            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33` }}
                          >
                            {meta.label}
                          </span>
                          <span className="font-mono text-[9px]" style={{ color: "var(--text-3)", opacity: 0.6 }}>
                            {formatTime(n.created_at)}
                          </span>
                        </div>

                        <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-1)" }}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--text-3)" }}>
                            {n.body}
                          </p>
                        )}
                      </div>

                      {!n.read && (
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                          style={{ background: "var(--gold)" }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
