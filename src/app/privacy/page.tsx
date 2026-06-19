import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Papyrus",
};

const SECTIONS = [
  {
    title: "1. Overview",
    body: `This Privacy Policy explains what information Papyrus collects, how we use it, and the choices you have. Papyrus is a free, educational paper-trading platform — including the Papyrus Summer Trading Challenge. All trading is simulated with virtual funds; no real money is ever involved. By using Papyrus you agree to this policy.`,
  },
  {
    title: "2. Information we collect",
    body: `When you sign in with Google, we receive your name, email address, and profile picture. When you create a profile we store a username and avatar. If you enroll in the Summer Trading Challenge, we collect the details you provide on the enrollment form: your full name, an optional parent or guardian email, and optionally your school, grade, and how you heard about us. We also store your in-app activity — your virtual trades, holdings, and portfolio history. We do not collect or store any payment, bank, or real financial account information, because the platform never handles real money.`,
  },
  {
    title: "3. How we use your information",
    body: `We use your information to operate the service: to sign you in, show your portfolio and leaderboard position, run the contest, compute standings and awards, and send service-related emails such as enrollment confirmations, contest updates, and winner announcements. We use aggregate, non-identifying information (for example, how many participants joined or which schools took part) to understand and improve the program. We do not use your data for advertising.`,
  },
  {
    title: "4. Children's and teens' privacy",
    body: `Papyrus and the Summer Trading Challenge are intended for users aged 13 and older. We do not knowingly collect personal information from anyone under 13; if we learn that we have, we will delete it. If you are under 18, you may optionally provide a parent or guardian's email during enrollment. If provided, that email is used only to send the parent or guardian occasional updates and the final standings — it is never sold, shared for marketing, or used for any other purpose.`,
  },
  {
    title: "5. How we share information",
    body: `We do not sell your personal information. We share data only with the service providers that make Papyrus work: Google (for sign-in), Supabase (database and authentication hosting), Vercel (application hosting), and an email provider used to send service and contest emails. We also retrieve market price data from third-party providers; this is read-only and does not involve sharing your personal information. We may disclose information if required by law.`,
  },
  {
    title: "6. Data retention",
    body: `We keep your account and contest information for as long as your account exists or as needed to run the contest and its standings. You can request deletion of your account and associated personal data at any time (see "Your choices" below), after which we will remove it except where we are required to retain it by law.`,
  },
  {
    title: "7. Your choices and rights",
    body: `You can request access to, correction of, or deletion of your personal information by contacting us. You can change your display name in your settings. If a parent or guardian email is receiving contest updates, either of you may request that we stop by contacting us. You may stop using the service at any time.`,
  },
  {
    title: "8. Cookies and sessions",
    body: `We use essential cookies to keep you signed in and to operate the platform. These are required for the service to function. We do not use third-party advertising or tracking cookies.`,
  },
  {
    title: "9. Security",
    body: `We use reputable hosting and authentication providers and take reasonable measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "10. Changes to this policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date below. Continued use of Papyrus after changes are posted constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact",
    body: `If you have any questions about this policy or your data, or to make a request about your information, contact us at tradeonpapyrus@gmail.com.`,
  },
];

export default function PrivacyPage() {
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
          <Link href="/" className="flex items-center gap-2.5 mb-10 w-fit">
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
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Last updated: June 2026
          </p>
        </div>

        {/* Callout */}
        <div
          className="rounded-xl px-5 py-4 mb-10 flex items-start gap-3"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "var(--gold)" }} />
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            <span className="font-semibold" style={{ color: "var(--gold-bright)" }}>We collect very little. </span>
            No payment information, no advertising, and we never sell your data. Papyrus is a free educational
            simulation with no real money involved.
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
        <div className="mt-14 pt-8 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-center gap-4 mb-4 font-mono text-[11px]" style={{ color: "var(--text-3)" }}>
            <Link href="/tos" className="underline">Terms of Service</Link>
            <Link href="/challenge" className="underline">Summer Challenge</Link>
            <Link href="/" className="underline">Home</Link>
          </div>
          <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-3)" }}>
            Virtual funds only · No real money at risk
          </p>
        </div>
      </div>
    </div>
  );
}
