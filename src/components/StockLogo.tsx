"use client";

import { useState } from "react";

type Props = {
  symbol: string;
  logo?: string;
  size?: number; // diameter in px, default 40
};

export default function StockLogo({ symbol, logo, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <div
        className="rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://logo.clearbit.com/${logo}`}
          alt={symbol}
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.7)}
          className="object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full bg-indigo-600/20 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="font-bold text-indigo-400" style={{ fontSize: size * 0.28 }}>
        {symbol.slice(0, 4)}
      </span>
    </div>
  );
}
