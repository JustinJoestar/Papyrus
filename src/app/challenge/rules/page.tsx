import Link from "next/link";
import { CONTEST, AWARDS, formatContestDate } from "@/lib/challenge";

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US");

export const metadata = {
  title: "Rules — Papyrus Summer Trading Challenge",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-semibold text-xl mb-4" style={{ color: "var(--text-1)" }}>{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{children}</div>
    </section>
  );
}

export default function RulesPage() {

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14">
      <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
        Official Rules
      </p>
      <h1 className="font-display font-semibold text-3xl sm:text-4xl mb-3" style={{ color: "var(--text-1)" }}>
        How the Challenge works
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>
        {CONTEST.name} · {CONTEST.year}. Everything here is auto-computed from your trading —
        no written submissions, no judges.
      </p>

      {/* At a glance */}
      <div
        className="rounded-2xl p-6 mb-10 grid grid-cols-2 gap-y-4 gap-x-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        {[
          ["Dates", `${formatContestDate(CONTEST.startsAt)} – ${formatContestDate(CONTEST.endsAt)}`],
          ["Starting balance", `${fmtMoney(CONTEST.startingBalance)} virtual`],
          ["Who can play", `Ages ${CONTEST.minAge}+ · Worldwide`],
          ["Cost", "Free — always"],
          ["Markets", CONTEST.universeSummary],
          ["Prize", CONTEST.prize],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1" style={{ color: "var(--text-3)" }}>{k}</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{v}</p>
          </div>
        ))}
      </div>

      <Section title="Eligibility">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Open to participants <strong>{CONTEST.minAge} and older</strong>, anywhere in the world.</li>
          <li>One entry per person — accounts are tied to a single Google sign-in.</li>
          <li>Free to enter. No purchase, payment, or real money is ever required or accepted.</li>
        </ul>
      </Section>

      <Section title="How to enter">
        <p>
          Sign in with Google, choose how your name appears on the leaderboard, and you&apos;re in.
          Enrollment opens <strong>{formatContestDate(CONTEST.enrollOpensAt)}</strong> and stays open through
          the contest. You can join late, but you&apos;ll be trading against people who started on day one.
        </p>
      </Section>

      <Section title="Trading">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Everyone starts with the same <strong>{fmtMoney(CONTEST.startingBalance)}</strong> in virtual cash. No deposits, no resets, no second accounts.</li>
          <li>You can trade <strong>US stocks, ETFs, and crypto</strong> — the S&amp;P 500 plus major funds, and the top cryptocurrencies by market cap. No options or penny stocks. The full tradeable list is shown in the app.</li>
          <li>Trades fill at the latest real market price, <strong>24/7</strong>. There are no limits on how often you trade or how much you put in one position.</li>
          <li>Trading locks the moment the contest ends; final standings freeze at the closing bell on {formatContestDate(CONTEST.endsAt)}.</li>
        </ul>
      </Section>

      <Section title="The prize">
        <p className="mb-2">
          <strong>One winner</strong>, chosen automatically from the final data: the highest total return takes
          a <strong>$50 gift card</strong> and the official <strong>winner&apos;s certificate</strong>.
        </p>
        <div className="space-y-4 mt-4">
          <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{AWARDS[0].emoji}</span>
              <h3 className="font-bold text-base" style={{ color: "var(--text-1)" }}>{AWARDS[0].title}</h3>
            </div>
            <p style={{ color: "var(--text-2)" }}>
              The highest <strong>total return</strong>. We take your final portfolio value (cash + everything you hold,
              at the closing price) versus your {fmtMoney(CONTEST.startingBalance)} start:
              <span className="block font-mono text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: "var(--elevated)", color: "var(--gold-bright)" }}>
                return % = (final value − {fmtMoney(CONTEST.startingBalance)}) ÷ {fmtMoney(CONTEST.startingBalance)}
              </span>
            </p>
          </div>
        </div>
      </Section>

      <Section title="Fair play">
        <p>
          This is a game of skill. Attempting to manipulate prices, exploit bugs, or run multiple accounts
          means disqualification. If two traders finish with the same return, the tie goes to whoever enrolled earlier.
          We may make reasonable judgment calls to keep the contest fair, and reserve the right to verify a
          winner&apos;s eligibility before awarding a prize.
        </p>
      </Section>

      <Section title="The fine print">
        <p>
          The {CONTEST.name} is a free educational simulation. All funds are virtual — no real money is
          ever involved, invested, or at risk, and nothing here is investment advice. Prices are provided for
          educational purposes and may be delayed. Void where prohibited.
        </p>
      </Section>

      <div className="flex flex-wrap gap-3 pt-4">
        <Link
          href="/challenge"
          className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
        >
          ← Back to Challenge
        </Link>
        <Link
          href="/challenge/parents"
          className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
        >
          For Parents →
        </Link>
      </div>
    </div>
  );
}
