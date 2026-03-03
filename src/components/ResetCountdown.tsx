"use client";

import { useEffect, useState } from "react";

function getTimeLeft() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntil = (1 - day + 7) % 7;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntil);
  next.setUTCHours(5, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 7);
  const ms = next.getTime() - now.getTime();
  return {
    days:    Math.floor(ms / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((ms % (1000 * 60)) / 1000),
  };
}

export default function ResetCountdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <p
      className="text-xl font-bold font-mono tabular-nums text-gold-shimmer"
    >
      {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
    </p>
  );
}
