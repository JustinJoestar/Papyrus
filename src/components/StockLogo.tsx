"use client";

import { useState } from "react";

type Props = {
  symbol: string;
  size?: number;
};

export default function StockLogo({ symbol, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <div
        className="rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://images.financialmodelingprep.com/symbol/${symbol}.png`}
          alt={symbol}
          width={size}
          height={size}
          className="object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--gold-glow)",
        border: "1px solid var(--gold-border)",
      }}
    >
      <span
        className="font-bold font-mono"
        style={{ fontSize: size * 0.28, color: "var(--gold)" }}
      >
        {symbol.slice(0, 4)}
      </span>
    </div>
  );
}
