import Link from "next/link";
import { CONTEST, formatContestDate } from "@/lib/challenge";

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US");

export const metadata = {
  title: "For Parents — Papyrus Summer Trading Challenge",
};

const REASSURANCES = [
  {
    emoji: "🚫",
    title: "No real money — ever",
    body: "Every dollar is virtual. There are no deposits, no withdrawals, no brokerage account, and nothing your teen can lose. It's a simulation.",
  },
  {
    emoji: "💳",
    title: "Free, with no payment info",
    body: "Entry is completely free. We never ask for credit cards, bank details, or any payment information — from you or your teen.",
  },
  {
    emoji: "🔒",
    title: "Minimal data",
    body: "We collect only what's needed to run the contest: a name for the leaderboard and a sign-in email. Your email is optional and used only for occasional updates.",
  },
  {
    emoji: "🎓",
    title: "Genuinely educational",
    body: "Participants learn how markets work, how to research companies, and how to think about risk — by doing, in a safe, consequence-free environment.",
  },
];

export default function ParentsPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14">
      <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
        For Parents &amp; Guardians
      </p>
      <h1 className="font-display font-semibold text-3xl sm:text-4xl mb-4 leading-tight" style={{ color: "var(--text-1)" }}>
        A safe, free way for your teen to learn investing
      </h1>
      <p className="text-base mb-10 leading-relaxed" style={{ color: "var(--text-2)" }}>
        The {CONTEST.name} is a four-week financial-literacy competition for high schoolers. Your teen
        builds a portfolio with <strong>{fmtMoney(CONTEST.startingBalance)} in virtual cash</strong> and
        competes on a leaderboard — learning real investing skills without a cent of real money involved.
      </p>

      {/* Reassurance grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {REASSURANCES.map((r) => (
          <div
            key={r.title}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
          >
            <span className="text-2xl">{r.emoji}</span>
            <h3 className="font-semibold text-base mt-3 mb-1.5" style={{ color: "var(--text-1)" }}>{r.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{r.body}</p>
          </div>
        ))}
      </div>

      {/* What they learn */}
      <section className="mb-12">
        <h2 className="font-display font-semibold text-xl mb-4" style={{ color: "var(--text-1)" }}>What your teen will learn</h2>
        <ul className="space-y-2.5 text-sm" style={{ color: "var(--text-2)" }}>
          {[
            "How the stock market actually works — prices, returns, and diversification.",
            "How to research real companies and ETFs before investing.",
            "Why steady, disciplined decisions usually beat impulsive bets.",
            "How to handle ups and downs without real-world consequences.",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span style={{ color: "var(--gold)" }}>✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Safety & privacy */}
      <section className="mb-12">
        <h2 className="font-display font-semibold text-xl mb-4" style={{ color: "var(--text-1)" }}>Safety &amp; privacy</h2>
        <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
          <p>
            The contest is open to participants <strong>{CONTEST.minAge} and older</strong>. We deliberately keep
            data collection minimal — a display name, a sign-in email, and optional details like grade and school
            that help us understand who&apos;s taking part.
          </p>
          <p>
            During enrollment, your teen can add a <strong>parent or guardian email</strong>. It&apos;s optional, and
            if provided we&apos;ll use it only to send you occasional updates and the final standings — never marketing,
            never shared or sold.
          </p>
          <p>
            Because this is a simulation and not a financial product, your teen is never exposed to real markets,
            real losses, or any real financial risk.
          </p>
        </div>
      </section>

      {/* Disclaimer callout */}
      <div
        className="rounded-2xl p-5 mb-12 text-sm leading-relaxed"
        style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--text-2)" }}
      >
        <strong style={{ color: "var(--gold-bright)" }}>Not investment advice.</strong> The {CONTEST.name} is an
        educational game. It does not provide investment advice or recommendations, and it is not affiliated with
        any brokerage. All trading is simulated with virtual funds.
      </div>

      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        Questions? Read the{" "}
        <Link href="/challenge/rules" className="underline" style={{ color: "var(--gold)" }}>full rules</Link>{" "}
        for exactly how the contest and its prize work. Enrollment opens {formatContestDate(CONTEST.enrollOpensAt)}.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/challenge"
          className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
        >
          ← Back to Challenge
        </Link>
        <Link
          href="/challenge/rules"
          className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
        >
          Read the Rules →
        </Link>
      </div>
    </div>
  );
}
