"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const divRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -1000, y: -1000 });
  const current = useRef({ x: -1000, y: -1000 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      // Smooth lerp — adjust 0.07 to change lag (lower = more lag)
      current.current.x += (target.current.x - current.current.x) * 0.07;
      current.current.y += (target.current.y - current.current.y) * 0.07;

      const { x, y } = current.current;
      el.style.background = [
        `radial-gradient(800px circle at ${x}px ${y}px,`,
        `  rgba(201,168,76,0.07) 0%,`,
        `  rgba(201,168,76,0.02) 30%,`,
        `  transparent 70%`,
        `)`,
      ].join(" ");

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
