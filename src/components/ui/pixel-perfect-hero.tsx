"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* -----------------------------------------------------------------------------
 * CANVAS STAGGERED PHYSICS ENGINE
 * Outward-expanding ripple of pixels. Colors are passed in so the hero can
 * source them from the active Papyrus theme (gold + neutrals, light or dark).
 * -------------------------------------------------------------------------- */

type Pixel = {
  x: number; y: number; color: string; ctx: CanvasRenderingContext2D;
  speed: number; size: number; sizeStep: number; minSize: number;
  maxSizeInt: number; maxSize: number; delay: number; counter: number;
  counterStep: number; isIdle: boolean; isReverse: boolean; isShimmer: boolean;
  draw: () => void; appear: () => void; disappear: () => void; shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number, y: number, color: string, baseSpeed: number, delay: number
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0,
    sizeStep: rand(0.12, 0.28),
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false, isReverse: false, isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) { p.counter += p.counterStep; return; }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer();
      else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false;
      p.counter = 0;
      if (p.size <= 0) { p.isIdle = true; return; }
      p.size -= 0.1;
      p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed;
      else p.size += p.speed;
    },
  };

  return p;
}

function PixelCanvas({ colors, gap = 6, speed = 30 }: { colors: string[]; gap?: number; speed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || colors.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    canvas.width = w; canvas.height = h;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;

    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }
    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;
    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);
      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();
      if (pixels.every((pp) => pp.isIdle)) cancelAnimationFrame(animationRef.current);
    };
    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();
    const resizeObserver = new ResizeObserver(() => init());
    if (wrapRef.current) resizeObserver.observe(wrapRef.current);
    animate("appear");
    return () => { resizeObserver.disconnect(); cancelAnimationFrame(animationRef.current); };
  }, [init, animate]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * PIXEL HERO — Papyrus-themed
 * -------------------------------------------------------------------------- */

type Cta = { label: string; href: string } | null;

interface PixelHeroProps {
  chipLabel?: string;
  word1: string;
  word2: string;
  description: string;
  primary?: Cta;
  secondary?: Cta;
  footnote?: string;
  children?: React.ReactNode; // e.g. countdown
}

export function PixelHero({
  chipLabel, word1, word2, description, primary, secondary, footnote, children,
}: PixelHeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeColors, setThemeColors] = useState<string[]>([]);

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const muted  = cs.getPropertyValue("--text-3").trim()       || "#909090";
      const bright = cs.getPropertyValue("--border-bright").trim() || "#363636";
      const gold   = cs.getPropertyValue("--gold").trim()          || "#c9a84c";
      // Mostly neutral pixels with occasional gold accent
      setThemeColors([muted, muted, bright, muted, gold]);
    };
    read();
    // Recolor when the light/dark toggle flips data-theme
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const t = setTimeout(() => setIsLoaded(true), 50);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <div className="relative w-full min-h-[calc(100dvh-3.5rem)] bg-background flex flex-col justify-center gap-7 py-12 px-4 sm:px-6 overflow-hidden select-none isolate">
      {/* Pixel canvas background, vignetted into the page background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {themeColors.length > 0 && <PixelCanvas colors={themeColors} gap={6} speed={30} />}
        <div
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{ background: "radial-gradient(circle at center, transparent 0%, var(--background) 100%)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        {chipLabel && (
          <span
            className="inline-block font-mono text-[10px] tracking-[0.28em] px-3 py-1 rounded-full mb-7"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            {chipLabel}
          </span>
        )}

        <h1 className="flex flex-row items-baseline justify-center gap-2 sm:gap-4 px-1 w-full flex-wrap text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.95]">
          <span className="font-playfair italic font-medium text-gold-gradient">{word1}</span>
          <span className="font-sans font-extrabold tracking-tighter text-gold-shimmer">{word2}</span>
        </h1>

        <p
          className="text-sm sm:text-lg md:text-xl font-light max-w-[92%] sm:max-w-xl mt-6 leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          {description}
        </p>

        {children && <div className="mt-9">{children}</div>}

        {/* CTAs */}
        {(primary || secondary) && (
          <div
            className={`flex flex-row items-center justify-center gap-3 mt-9 transition-all duration-1000 transform ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "300ms" }}
          >
            {primary && (
              <Link
                href={primary.href}
                className="relative inline-flex h-11 md:h-12 items-center justify-center gap-2 rounded-xl px-6 md:px-8 text-xs md:text-sm font-bold font-mono tracking-[0.08em] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                  color: "#0a0800",
                  boxShadow: "var(--primary-glow)",
                }}
              >
                {primary.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="relative inline-flex h-11 md:h-12 items-center justify-center gap-2 rounded-xl px-6 md:px-8 text-xs md:text-sm font-semibold font-mono tracking-[0.08em] backdrop-blur-md transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: "var(--card-bg)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}

        {footnote && (
          <p className="font-mono text-[10px] tracking-wider mt-5" style={{ color: "var(--text-3)" }}>
            {footnote}
          </p>
        )}
      </div>
    </div>
  );
}
