"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const BRONZE_BG = "linear-gradient(150deg, var(--gold-bright) 0%, var(--gold) 45%, var(--gold-dim) 130%)";

interface GoldShimmerCtaProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function GoldShimmerCta({ href, children, className }: GoldShimmerCtaProps) {
  return (
    <Link
      href={href}
      style={{
        "--spread": "90deg",
        "--shimmer-color": "rgba(255,255,255,0.5)",
        "--speed": "3s",
        "--cut": "0.05em",
        color: "var(--ink-on-gold)",
        background: BRONZE_BG,
        boxShadow: "var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.28)",
      } as CSSProperties}
      className={cn(
        "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
        "font-mono font-bold text-sm tracking-[0.06em] px-7 py-3 rounded-[10px]",
        "border border-white/15",
        "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
        className,
      )}
    >
      {/* shimmer spark */}
      <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>

      {children}

      {/* pressed-metal highlight */}
      <div className="absolute inset-0 size-full rounded-[10px] shadow-[inset_0_-8px_10px_#ffffff1f] transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />

      {/* backdrop — replicates bronze bg slightly inset for the border effect */}
      <div
        className="absolute -z-20 rounded-[calc(10px-0.05em)] [inset:var(--cut)]"
        style={{ background: BRONZE_BG }}
      />
    </Link>
  );
}
