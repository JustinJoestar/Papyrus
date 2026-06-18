// ============================================================
// Papyrus Summer Trading Challenge — shared config + helpers
//
// Single source of truth for the public-facing contest copy and
// dates. The admin can later override the live contest row in the
// database, but these defaults drive the marketing pages and are the
// fallback before a contest row exists.
// ============================================================

export type ContestStatus = "upcoming" | "enrolling" | "live" | "ended";

export const CONTEST = {
  name: "Papyrus Summer Trading Challenge",
  shortName: "Summer Challenge",
  year: 2026,

  // ISO timestamps (UTC). Summer is US Eastern Daylight Time = UTC-4.
  enrollOpensAt: "2026-06-22T00:00:00Z",
  startsAt:      "2026-07-06T13:30:00Z", // first trading day, 9:30 AM ET
  endsAt:        "2026-08-17T20:00:00Z", // final close, 4:00 PM ET
  // Midpoint divides the contest for the Comeback award (final 2 weeks).
  comebackWindowDays: 14,

  startingBalance: 100_000,
  minAge: 13,

  prize: "Gift card — sponsor to be announced",
  universeSummary: "S&P 500 stocks + major ETFs",

  // Eligibility gate for the risk-adjusted (Sortino) award.
  gate: {
    minTrades: 8,
    minTradingDays: 5,
    minInvestedShare: 0.6, // invested (not 100% cash) ≥ 60% of trading days
  },
} as const;

export const AWARDS = [
  {
    key: "top-trader",
    emoji: "🏆",
    title: "Top Trader",
    tagline: "Highest overall return",
    blurb:
      "The simplest crown: whoever grows their $100,000 the most, by total return percentage, takes it.",
  },
  {
    key: "smartest-investor",
    emoji: "🧠",
    title: "Smartest Investor",
    tagline: "Best risk-adjusted return (Sortino)",
    blurb:
      "Rewards steady, disciplined growth over lucky gambles. We measure how smoothly you grew — only counting downside swings as risk — so consistency beats chaos.",
  },
  {
    key: "comeback",
    emoji: "🚀",
    title: "Comeback Award",
    tagline: "Biggest finish from behind",
    blurb:
      "For those trailing at the halfway mark: whoever climbs the most over the final two weeks wins. It's never over until the close.",
  },
] as const;

/** Current contest phase derived from the configured dates. */
export function contestStatus(now: Date = new Date()): ContestStatus {
  const t = now.getTime();
  if (t < new Date(CONTEST.enrollOpensAt).getTime()) return "upcoming";
  if (t < new Date(CONTEST.startsAt).getTime()) return "enrolling";
  if (t < new Date(CONTEST.endsAt).getTime()) return "live";
  return "ended";
}

/** The date a countdown should tick toward for the given phase, or null. */
export function countdownTarget(status: ContestStatus): { label: string; iso: string } | null {
  switch (status) {
    case "upcoming":
    case "enrolling":
      return { label: "Trading begins in", iso: CONTEST.startsAt };
    case "live":
      return { label: "Trading closes in", iso: CONTEST.endsAt };
    case "ended":
      return null;
  }
}

/** Whether enrollment is currently open (enrolling phase through end). */
export function isEnrollmentOpen(now: Date = new Date()): boolean {
  const s = contestStatus(now);
  return s === "enrolling" || s === "live";
}

/** Trading-window state for a specific contest's start/end timestamps. */
export function tradingWindow(
  startsAt: string | null,
  endsAt: string | null,
  now: Date = new Date()
): { started: boolean; ended: boolean; open: boolean } {
  const t = now.getTime();
  const started = !startsAt || t >= new Date(startsAt).getTime();
  const ended = !!endsAt && t > new Date(endsAt).getTime();
  return { started, ended, open: started && !ended };
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
};

export function formatContestDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", DATE_FMT);
}
