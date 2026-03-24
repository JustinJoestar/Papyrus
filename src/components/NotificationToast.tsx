"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Star, Bell, RefreshCw, Crown, X } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type NotifType = "achievement" | "leaderboard" | "info" | "reset" | "league";

interface ToastItem {
  id: string;
  type: NotifType;
  title: string;
  body: string | null;
  created_at: string;
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 5500;

// ─── Type config ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotifType,
  { label: string; Icon: React.ElementType; accentColor: string; bgGlow: string; iconBg: string }
> = {
  achievement: {
    label: "Achievement Unlocked",
    Icon: Star,
    accentColor: "var(--gold)",
    bgGlow: "rgba(201,168,76,0.12)",
    iconBg: "rgba(201,168,76,0.15)",
  },
  leaderboard: {
    label: "Leaderboard",
    Icon: Crown,
    accentColor: "#a78bfa",
    bgGlow: "rgba(167,139,250,0.1)",
    iconBg: "rgba(167,139,250,0.15)",
  },
  league: {
    label: "League Update",
    Icon: Trophy,
    accentColor: "#60a5fa",
    bgGlow: "rgba(96,165,250,0.1)",
    iconBg: "rgba(96,165,250,0.15)",
  },
  reset: {
    label: "Weekly Reset",
    Icon: RefreshCw,
    accentColor: "#34d399",
    bgGlow: "rgba(52,211,153,0.1)",
    iconBg: "rgba(52,211,153,0.15)",
  },
  info: {
    label: "Notice",
    Icon: Bell,
    accentColor: "var(--text-2)",
    bgGlow: "rgba(180,180,180,0.06)",
    iconBg: "rgba(180,180,180,0.1)",
  },
};

// ─── Single toast ────────────────────────────────────────────────────────────

function Toast({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[item.type as NotifType] ?? TYPE_CONFIG.info;

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0, scale: 0.92 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 120, opacity: 0, scale: 0.92, transition: { duration: 0.25, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="relative w-80 rounded-xl overflow-hidden select-none"
      style={{
        background: "var(--surface)",
        border: `1px solid ${cfg.accentColor}44`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px ${cfg.accentColor}22, inset 0 0 40px ${cfg.bgGlow}`,
      }}
    >
      {/* Top accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.accentColor}cc 30%, ${cfg.accentColor} 50%, ${cfg.accentColor}cc 70%, transparent)`,
        }}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 30%, ${cfg.bgGlow.replace("0.1", "0.15")} 50%, transparent 70%)`,
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
      />

      <div className="relative flex items-start gap-3 px-4 pt-3 pb-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: cfg.iconBg, border: `1px solid ${cfg.accentColor}44` }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(() => { const I = cfg.Icon as any; return <I size={18} style={{ color: cfg.accentColor }} strokeWidth={1.5} />; })()}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-mono text-[9px] tracking-[0.2em] uppercase mb-0.5"
            style={{ color: cfg.accentColor, opacity: 0.85 }}
          >
            {cfg.label}
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-1)" }}>
            {item.title}
          </p>
          {item.body && (
            <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--text-3)" }}>
              {item.body}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onDismiss(item.id)}
          className="w-5 h-5 flex items-center justify-center rounded-md transition-colors shrink-0 mt-0.5"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <X size={12} />
        </button>
      </div>

      {/* Drain progress bar */}
      <motion.div
        className="h-[2px]"
        style={{ background: cfg.accentColor, opacity: 0.6, transformOrigin: "left" }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: AUTO_DISMISS_MS / 1000 - 0.5, ease: "linear" }}
      />
    </motion.div>
  );
}

// ─── Toast container ─────────────────────────────────────────────────────────

export default function NotificationToast({ userId }: { userId: string | null }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const supabase = createClient();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const timer = setTimeout(() => dismiss(oldest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toasts, dismiss]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`toasts:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload.new as ToastItem;
          setToasts((prev) => {
            const next = [n, ...prev];
            // Keep max toasts
            return next.slice(0, MAX_TOASTS);
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="fixed top-20 right-6 z-[200] flex flex-col gap-2.5 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast item={t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
