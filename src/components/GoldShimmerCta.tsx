"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const GOLD_BG = "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 60%, var(--gold-bright) 100%)";

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
        "--shimmer-color": "rgba(255,255,255,0.45)",
        "--speed": "3s",
        "--cut": "0.05em",
        color: "#0a0800",
        background: GOLD_BG,
        boxShadow: "var(--primary-glow)",
      } as CSSProperties}
      className={cn(
        "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
        "font-mono font-semibold text-sm tracking-wide px-7 py-3 rounded-lg",
        "border border-white/10",
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

      {/* highlight */}
      <div className="absolute inset-0 size-full rounded-lg shadow-[inset_0_-8px_10px_#ffffff1f] transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />

      {/* backdrop — replicates gold bg slightly inset for the border effect */}
      <div
        className="absolute -z-20 rounded-[calc(8px-0.05em)] [inset:var(--cut)]"
        style={{ background: GOLD_BG }}
      />
    </Link>
  );
}
