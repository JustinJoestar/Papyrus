"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

type Props = { userId: string | null };

export default function NavNotifications({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Realtime: new notifications appear instantly
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
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
          border: open ? "1px solid var(--gold-border)" : "1px solid transparent",
          color: open ? "var(--gold)" : "var(--text-3)",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.border = "1px solid var(--border-mid)";
            e.currentTarget.style.color = "var(--text-2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.border = "1px solid transparent";
            e.currentTarget.style.color = "var(--text-3)";
          }
        }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full font-mono font-bold text-[9px] px-1"
            style={{ background: "var(--gold)", color: "#0a0800" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50 flex flex-col"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span
              className="font-mono text-xs font-bold tracking-[0.15em] uppercase"
              style={{ color: "var(--text-1)" }}
            >
              Notifications
            </span>
            {notifications.length > 0 && (
              <span className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                {notifications.length} total
              </span>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={22} className="mx-auto mb-2.5 opacity-20" style={{ color: "var(--text-3)" }} />
                <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
                  No notifications yet
                </p>
                <p className="font-mono text-[10px] mt-1" style={{ color: "var(--text-3)", opacity: 0.6 }}>
                  Achievements will appear here
                </p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
                    background: n.read ? "transparent" : "rgba(201,168,76,0.04)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold leading-snug"
                      style={{ color: "var(--text-1)" }}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p
                        className="text-xs mt-0.5 leading-snug"
                        style={{ color: "var(--text-3)" }}
                      >
                        {n.body}
                      </p>
                    )}
                    <p
                      className="font-mono text-[10px] mt-1"
                      style={{ color: "var(--text-3)", opacity: 0.7 }}
                    >
                      {formatTime(n.created_at)}
                    </p>
                  </div>
                  {!n.read && (
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1"
                      style={{ background: "var(--gold)" }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
