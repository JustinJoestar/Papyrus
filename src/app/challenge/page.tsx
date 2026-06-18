import Link from "next/link";
import {
  CONTEST,
  AWARDS,
  contestStatus,
  countdownTarget,
  isEnrollmentOpen,
  formatContestDate,
} from "@/lib/challenge";
import ChallengeCountdown from "@/components/challenge/ChallengeCountdown";

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US");

const STEPS = [
  { n: "01", title: "Enter with Google", desc: "Sign in, pick your trading name, and you're in. Free, takes 30 seconds." },
  { n: "02", title: "Trade the market", desc: `Everyone starts with ${fmtMoney(CONTEST.startingBalance)} in virtual cash. Build a portfolio of US stocks & ETFs at real, live prices.` },
  { n: "03", title: "Climb the leaderboard", desc: "Watch your rank update in real time. Three ways to win — outright returns, smart investing, or a strong finish." },
];

export default function ChallengeLanding() {
  const status = contestStatus();
  const target = countdownTarget(status);
  const enrollOpen = isEnrollmentOpen();

  const statusChip =
    status === "upcoming"  ? "ENROLLMENT OPENS SOON" :
    status === "enrolling" ? "ENROLLMENT OPEN" :
    status === "live"      ? "● LIVE NOW" :
    "CONTEST ENDED";

  return (
    <div>
      {/* Gold top accent */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)" }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-140px", left: "50%", transform: "translateX(-50%)",
            width: "760px", height: "380px",
            background: "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 65%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center" style={{ zIndex: 10 }}>
          <span
            className="inline-block font-mono text-[10px] tracking-[0.28em] px-3 py-1 rounded-full mb-6"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            {statusChip}
          </span>

          <h1 className="font-bold text-4xl sm:text-6xl tracking-tight leading-[1.05] mb-5">
            <span style={{ color: "var(--text-1)" }}>The </span>
            <span className="text-gold-shimmer">Summer Trading Challenge</span>
          </h1>

          <p className="text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: "var(--text-2)" }}>
            A free {CONTEST.comebackWindowDays && ""}six-week paper-trading competition for high schoolers.
            Start with {fmtMoney(CONTEST.startingBalance)} in virtual cash, trade real markets, and
            prove you've got what it takes — no money, no risk, all skill.
          </p>

          {/* Countdown */}
          {target && (
            <div className="mb-9">
              <ChallengeCountdown label={target.label} targetIso={target.iso} />
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            {enrollOpen ? (
              <Link
                href="/challenge/enroll"
                className="inline-flex items-center gap-2 font-bold font-mono text-sm tracking-[0.1em] px-8 py-3.5 rounded-xl transition-transform hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                  color: "#0a0800",
                  boxShadow: "var(--primary-glow)",
                }}
              >
                ENTER THE CHALLENGE →
              </Link>
            ) : status === "upcoming" ? (
              <div
                className="inline-flex items-center gap-2 font-mono text-sm px-8 py-3.5 rounded-xl"
                style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-3)" }}
              >
                Enrollment opens {formatContestDate(CONTEST.enrollOpensAt)}
              </div>
            ) : (
              <Link
                href="/challenge/leaderboard"
                className="inline-flex items-center gap-2 font-bold font-mono text-sm tracking-[0.1em] px-8 py-3.5 rounded-xl"
                style={{ background: "var(--elevated)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
              >
                VIEW FINAL STANDINGS →
              </Link>
            )}
            <p className="font-mono text-[10px] tracking-wider" style={{ color: "var(--text-3)" }}>
              {formatContestDate(CONTEST.startsAt)} – {formatContestDate(CONTEST.endsAt)} · Ages {CONTEST.minAge}+ · Free to enter
            </p>
          </div>
        </div>
      </section>

      {/* ── Prize callout ────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-16">
        <div
          className="max-w-3xl mx-auto rounded-2xl px-6 py-5 flex items-center justify-center gap-3 text-center flex-wrap"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          <span className="text-xl">🎁</span>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Winners take home a <span className="font-semibold" style={{ color: "var(--gold-bright)" }}>{CONTEST.prize}</span>
          </p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-bold text-2xl sm:text-3xl mb-12" style={{ color: "var(--text-1)" }}>
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl p-6"
                style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
              >
                <span className="font-mono text-sm font-bold text-gold-gradient">{s.n}</span>
                <h3 className="font-semibold text-base mt-3 mb-2" style={{ color: "var(--text-1)" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three ways to win ────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-center font-mono text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Three awards
          </p>
          <h2 className="text-center font-bold text-2xl sm:text-3xl mb-3" style={{ color: "var(--text-1)" }}>
            Three ways to win
          </h2>
          <p className="text-center text-sm max-w-lg mx-auto mb-12" style={{ color: "var(--text-3)" }}>
            Rewarding more than just the biggest number — skill, discipline, and persistence
            all get their own crown.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {AWARDS.map((a) => (
              <div
                key={a.key}
                className="rounded-2xl p-6 flex flex-col"
                style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
              >
                <span className="text-3xl mb-3">{a.emoji}</span>
                <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-1)" }}>{a.title}</h3>
                <p className="font-mono text-[10px] tracking-wider uppercase mb-3" style={{ color: "var(--gold)" }}>{a.tagline}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{a.blurb}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
            One award per person. See the{" "}
            <Link href="/challenge/rules" className="underline" style={{ color: "var(--gold)" }}>full rules</Link>{" "}
            for exactly how each is calculated.
          </p>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-24">
        <div
          className="max-w-3xl mx-auto rounded-2xl px-8 py-12 text-center relative overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--gold-border)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, var(--cta-radial) 0%, transparent 60%)" }}
          />
          <div className="relative">
            <h2 className="font-bold text-2xl sm:text-3xl mb-3" style={{ color: "var(--text-1)" }}>
              Think you can top the board?
            </h2>
            <p className="text-sm mb-7 max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
              Bragging rights, real market experience, and a prize on the line. Bring your friends —
              it's more fun when you're beating someone you know.
            </p>
            {enrollOpen ? (
              <Link
                href="/challenge/enroll"
                className="inline-flex items-center gap-2 font-bold font-mono text-sm tracking-[0.1em] px-8 py-3.5 rounded-xl transition-transform hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)", color: "#0a0800", boxShadow: "var(--primary-glow)" }}
              >
                ENTER THE CHALLENGE →
              </Link>
            ) : (
              <Link
                href="/challenge/rules"
                className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.1em] px-8 py-3.5 rounded-xl"
                style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
              >
                READ THE RULES →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
