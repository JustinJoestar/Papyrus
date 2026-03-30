"use client";

import { useEffect, useState } from "react";

function getTimeLeft() {
  const now = new Date();
  const msPerInterval = 5 * 60 * 1000;
  const ms = msPerInterval - (now.getTime() % msPerInterval);
  return {
    days:    0,
    hours:   0,
    minutes: Math.floor(ms / (1000 * 60)),
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
