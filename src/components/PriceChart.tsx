"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartPoint = { date: string; price: number };

const RANGES = [
  { label: "1D", days: "1" },
  { label: "7D", days: "7" },
  { label: "30D", days: "30" },
  { label: "1Y", days: "365" },
];

function formatDate(timestamp: number, days: string) {
  const d = new Date(timestamp);
  if (days === "1") {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  if (days === "365") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(price: number) {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Props = {
  chartBaseUrl: string;
  isPositive: boolean;
};

export default function PriceChart({ chartBaseUrl, isPositive }: Props) {
  const [days, setDays] = useState("7");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${chartBaseUrl}&days=${days}`)
      .then((r) => r.json())
      .then((json) => {
        const points: ChartPoint[] = (json.prices ?? []).map(
          ([timestamp, price]: [number, number]) => ({
            date: formatDate(timestamp, days),
            price,
          })
        );
        setData(points);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [chartBaseUrl, days]);

  // SVG attributes can't resolve CSS vars — pick literal ink per theme
  const color    = isPositive
    ? (isLight ? "#177245" : "#34c77b")
    : (isLight ? "#b3282d" : "#e5484d");
  const tickInk  = isLight ? "#7a7057" : "#8d8471";
  const tooltipBg     = isLight ? "#fcf9f0" : "#14110b";
  const tooltipBorder = isLight ? "#ccc1a5" : "#2e2819";
  const tooltipInk    = isLight ? "#211b10" : "#f4efe4";

  return (
    <div>
      {/* Range selector */}
      <div
        className="inline-flex rounded-lg overflow-hidden mb-4"
        style={{ border: "1px solid var(--border-mid)" }}
      >
        {RANGES.map((r, i) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className="px-3.5 py-1 text-sm font-mono transition-all"
            style={
              days === r.days
                ? {
                    background: "var(--gold-glow)",
                    color: "var(--gold-bright)",
                    borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-3)",
                    borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                  }
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="h-64 flex items-center justify-center font-display italic text-base"
          style={{ color: "var(--text-3)" }}
        >
          Drawing the chart…
        </div>
      ) : data.length === 0 ? (
        <div
          className="h-64 flex items-center justify-center font-display italic text-base"
          style={{ color: "var(--text-3)" }}
        >
          Chart data unavailable
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: tickInk, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: tickInk, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatPrice}
              width={80}
            />
            <Tooltip
              isAnimationActive={false}
              position={{ y: 40 }}
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "8px",
                color: tooltipInk,
                fontSize: 11,
                padding: "4px 8px",
                lineHeight: "1.4",
              }}
              formatter={(value: number | undefined) => [formatPrice(value ?? 0), "Price"]}
              labelStyle={{ color: tickInk, fontSize: 10, marginBottom: 1 }}
              itemStyle={{ padding: 0 }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
