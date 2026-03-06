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

  const color = isPositive ? "#34d399" : "#f87171";

  return (
    <div>
      {/* Range selector */}
      <div className="flex gap-2 mb-4">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setDays(r.days)}
            className="px-3 py-1 rounded-lg text-sm font-mono transition-all"
            style={
              days === r.days
                ? {
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-bright)",
                  }
                : {
                    background: "var(--elevated)",
                    border: "1px solid var(--border-mid)",
                    color: "var(--text-3)",
                  }
            }
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="h-64 flex items-center justify-center font-mono text-sm"
          style={{ color: "var(--text-3)" }}
        >
          Loading chart...
        </div>
      ) : data.length === 0 ? (
        <div
          className="h-64 flex items-center justify-center font-mono text-sm"
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
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatPrice}
              width={80}
            />
            <Tooltip
              isAnimationActive={false}
              position={{ y: 40 }}
              contentStyle={{
                backgroundColor: "#0d0d0d",
                border: "1px solid #272727",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: 11,
                padding: "4px 8px",
                lineHeight: "1.4",
              }}
              formatter={(value: number | undefined) => [formatPrice(value ?? 0), "Price"]}
              labelStyle={{ color: "#585858", fontSize: 10, marginBottom: 1 }}
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
