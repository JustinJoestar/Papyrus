"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink, Clock, Building2 } from "lucide-react";
import type { NewsItem } from "@/lib/news";

// ─── helpers ─────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getLargeThumbnail(thumbnail?: NewsItem["thumbnail"]): string | null {
  if (!thumbnail?.resolutions?.length) return null;
  return [...thumbnail.resolutions].sort((a, b) => b.width - a.width)[0]?.url ?? null;
}

function getSmallThumbnail(thumbnail?: NewsItem["thumbnail"]): string | null {
  if (!thumbnail?.resolutions?.length) return null;
  const sorted = [...thumbnail.resolutions].sort((a, b) => a.width - b.width);
  return sorted.find((r) => r.width >= 120)?.url ?? sorted[0]?.url ?? null;
}


// ─── Hero card (first/featured article) ──────────────────────────────────────

function HeroCard({ article, onClick }: { article: NewsItem; onClick: () => void }) {
  const img = getLargeThumbnail(article.thumbnail);
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden mb-3 group transition-opacity duration-150 hover:opacity-90"
      style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
    >
      {img && (
        <div className="w-full aspect-[16/9] overflow-hidden">
          <img
            src={img}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="p-4">
        {article.relatedTickers?.length ? (
          <div className="flex gap-1 mb-2 flex-wrap">
            {article.relatedTickers.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--gold-glow)",
                  color: "var(--gold-bright)",
                  border: "1px solid var(--gold-border)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
        <h2 className="text-base font-bold leading-snug mb-2" style={{ color: "var(--text-1)" }}>
          {article.title}
        </h2>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
          <span>{article.publisher}</span>
          <span>·</span>
          <span>{timeAgo(article.providerPublishTime)}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Small list card ──────────────────────────────────────────────────────────

function ListCard({ article, onClick }: { article: NewsItem; onClick: () => void }) {
  const img = getSmallThumbnail(article.thumbnail);
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-3 py-4 transition-opacity duration-150 hover:opacity-75"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono mb-1" style={{ color: "var(--text-3)" }}>
          {article.publisher}&nbsp;·&nbsp;{timeAgo(article.providerPublishTime)}
        </p>
        <h3
          className="text-sm font-semibold leading-snug"
          style={{
            color: "var(--text-1)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        {article.relatedTickers?.length ? (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {article.relatedTickers.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--gold-glow)",
                  color: "var(--gold-bright)",
                  border: "1px solid var(--gold-border)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {img && (
        <div className="shrink-0 w-[88px] h-[66px] rounded-lg overflow-hidden">
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </button>
  );
}

// ─── Article detail view ──────────────────────────────────────────────────────

function ArticleDetail({ article, onBack }: { article: NewsItem; onBack: () => void }) {
  const img = getLargeThumbnail(article.thumbnail);
  const date = new Date(article.providerPublishTime * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--text-2)" }}
      >
        <ArrowLeft size={16} />
        Back to News
      </button>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
      >
        {img && (
          <div className="w-full aspect-[16/9] overflow-hidden">
            <img
              src={img}
              alt={article.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="p-6">
          {/* meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
              <Building2 size={12} />
              <span>{article.publisher}</span>
            </div>
            <span style={{ color: "var(--border-mid)" }}>·</span>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-3)" }}>
              <Clock size={12} />
              <span>{date}</span>
            </div>
          </div>

          <h1 className="text-xl font-bold leading-snug mb-5" style={{ color: "var(--text-1)" }}>
            {article.title}
          </h1>

          {article.relatedTickers?.length ? (
            <div className="mb-6">
              <p
                className="text-[10px] font-mono tracking-widest uppercase mb-2"
                style={{ color: "var(--text-3)" }}
              >
                Related
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {article.relatedTickers.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono px-2 py-1 rounded"
                    style={{
                      background: "var(--gold-glow)",
                      color: "var(--gold-bright)",
                      border: "1px solid var(--gold-border)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: "var(--gold-glow)",
              border: "1px solid var(--gold-border)",
              color: "var(--gold-bright)",
            }}
          >
            Read Full Article
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function NewsClient({ news }: { news: NewsItem[] }) {
  const [selected, setSelected] = useState<NewsItem | null>(null);

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <ArticleDetail article={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  const [featured, ...rest] = news;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Markets
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Market
        </h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
          {news.length} articles — updates every 5m
        </p>
      </div>

      {featured && (
        <HeroCard article={featured} onClick={() => setSelected(featured)} />
      )}

      <div>
        {rest.map((article) => (
          <ListCard key={article.uuid} article={article} onClick={() => setSelected(article)} />
        ))}
      </div>
    </div>
  );
}
