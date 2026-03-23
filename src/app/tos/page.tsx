import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Papyrus",
};

const SECTIONS = [
  {
    title: "1. About Papyrus",
    body: `Papyrus is a paper trading simulation platform for educational purposes. All funds, trades, and portfolio values are entirely virtual. No real money is involved, invested, or at risk at any time. Papyrus is not a licensed financial advisor, broker, or investment platform.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 13 years old to use Papyrus. If you are under 18, you confirm that you have your parent or guardian's permission to use this service. By creating an account, you confirm that you meet the age requirement.`,
  },
  {
    title: "3. Simulation Only",
    body: `All prices, portfolio values, and leaderboard rankings are for simulation and entertainment purposes only. Past performance in Papyrus does not reflect or predict real-world investment returns. Nothing on Papyrus constitutes financial advice.`,
  },
  {
    title: "4. Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree not to share your account, impersonate others, or create accounts to manipulate leaderboards. We reserve the right to suspend or delete accounts that violate these terms.`,
  },
  {
    title: "5. User Conduct",
    body: `You agree not to attempt to exploit, abuse, or reverse-engineer the platform. You agree not to use automated bots, scripts, or tools to make trades or manipulate rankings. Usernames must not contain offensive, hateful, or impersonating content.`,
  },
  {
    title: "6. Weekly Resets",
    body: `Portfolio balances and holdings are reset on a weekly basis. This is a core feature of the platform. We are not liable for any perceived loss of virtual assets due to scheduled or unscheduled resets.`,
  },
  {
    title: "7. Data & Privacy",
    body: `We collect your email address and username to provide the service. We do not sell your data to third parties. Market data is sourced from third-party APIs and may be delayed or inaccurate — it should never be used to inform real investment decisions.`,
  },
  {
    title: "8. Availability",
    body: `We make no guarantees about uptime or availability. The platform may be taken offline for maintenance, updates, or other reasons at any time without notice. Virtual assets have no monetary value and cannot be transferred or redeemed.`,
  },
  {
    title: "9. Changes to Terms",
    body: `We may update these Terms of Service at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.`,
  },
  {
    title: "10. Contact",
    body: `If you have any questions about these terms, you can reach us through the platform's GitHub repository or contact page.`,
  },
];

export default function TosPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--void)",
        backgroundImage: "radial-gradient(rgba(201,168,76,0.10) 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
        color: "var(--text-1)",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="flex items-center gap-2.5 mb-10 w-fit"
          >
            <div className="flex items-end gap-[3px]">
              <div className="w-[3px] h-3     rounded-sm" style={{ background: "var(--gold)" }} />
              <div className="w-[3px] h-[18px] rounded-sm" style={{ background: "var(--gold)" }} />
              <div className="w-[3px] h-2     rounded-sm" style={{ background: "var(--gold-dim)" }} />
            </div>
            <span className="font-mono font-bold text-lg tracking-[0.16em]" style={{ color: "var(--text-1)" }}>
              PAPYRUS
            </span>
          </Link>

          <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Legal
          </p>
          <h1 className="font-bold text-3xl mb-3" style={{ color: "var(--text-1)" }}>
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Last updated: March 2025 · Effective immediately upon account creation
          </p>
        </div>

        {/* Simulation callout */}
        <div
          className="rounded-xl px-5 py-4 mb-10 flex items-start gap-3"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "var(--gold)" }} />
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            <span className="font-semibold" style={{ color: "var(--gold-bright)" }}>Papyrus is a simulation. </span>
            No real money is involved. All trades, balances, and portfolio values are virtual and for educational purposes only.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-semibold text-base mb-2" style={{ color: "var(--text-1)" }}>
                {s.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-14 pt-8 text-center"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Link
            href="/auth/signup"
            className="inline-block font-mono font-bold text-sm tracking-[0.1em] px-6 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
              color: "#0a0800",
            }}
          >
            Back to Sign Up
          </Link>
          <p className="font-mono text-[10px] tracking-widest mt-4 uppercase" style={{ color: "var(--text-3)" }}>
            Virtual funds only · No real money at risk
          </p>
        </div>
      </div>
    </div>
  );
}
