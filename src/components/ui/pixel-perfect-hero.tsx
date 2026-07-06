"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WebGLShader } from "@/components/ui/web-gl-shader";

/* -----------------------------------------------------------------------------
 * PIXEL HERO — Papyrus-themed cinematic hero
 * Background is an animated WebGL sine-wave shader, tinted to the theme accent
 * (gold in dark mode, blue in light). The band stays dark in both themes and
 * fades into the page below, so the content uses light-on-dark styling.
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

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full min-h-[calc(100dvh-3.5rem)] flex flex-col justify-center gap-7 py-12 px-4 sm:px-6 overflow-hidden select-none isolate"
      style={{ background: "#05060a" }}
    >
      {/* Shader background + readability vignette + fade into the page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <WebGLShader />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at center, transparent 28%, rgba(0,0,0,0.55) 100%)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, var(--base))" }}
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
          <span className="font-display italic font-medium text-gold-gradient">{word1}</span>
          <span className="font-display font-semibold tracking-tight text-gold-shimmer">{word2}</span>
        </h1>

        <p
          className="text-sm sm:text-lg md:text-xl font-light max-w-[92%] sm:max-w-xl mt-6 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.82)" }}
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
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.88)" }}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        )}

        {footnote && (
          <p className="font-mono text-[10px] tracking-wider mt-5" style={{ color: "rgba(255,255,255,0.5)" }}>
            {footnote}
          </p>
        )}
      </div>
    </div>
  );
}
