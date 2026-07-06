"use client";

import { useEffect, useState } from "react";

function getNextSundayMidnightUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const daysUntil = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntil,
    0, 0, 0, 0
  ));
}

function getTimeLeft() {
  const ms = getNextSundayMidnightUTC().getTime() - Date.now();
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
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
    <p className="text-xl font-bold font-mono tabular-nums text-gold-shimmer">
      {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
    </p>
  );
}
