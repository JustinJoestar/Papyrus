import Link from "next/link";
import { CONTEST } from "@/lib/challenge";
import NavThemeToggle from "@/components/NavThemeToggle";
import { GoldShimmerCta } from "@/components/GoldShimmerCta";
import NavUserMenu from "@/components/NavUserMenu";
import { Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// The challenge is a self-contained experience — its own chrome, no
// weekly-game dashboard nav. Shares the app's auth, DB, and trade engine
// underneath but presents as a distinct event.
export const dynamic = "force-dynamic";

export default async function ChallengeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="min-h-screen flex flex-col" style={{ color: "var(--text-1)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 h-14 flex items-center px-5 sm:px-8 gap-4 backdrop-blur-md"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/challenge" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-end gap-[3px]">
            <div className="w-[3px] h-3      rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-[16px] rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-2      rounded-sm" style={{ background: "var(--gold-dim)" }} />
          </div>
          <span className="font-mono font-bold text-sm tracking-[0.15em]" style={{ color: "var(--text-1)" }}>
            PAPYRUS
          </span>
          <span
            className="font-mono text-[9px] tracking-[0.18em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            CHALLENGE
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <NavThemeToggle />
          <Link href="/challenge/leaderboard" className="text-xs sm:text-sm transition-colors" style={{ color: "var(--text-2)" }}>
            Leaderboard
          </Link>
          <Link href="/challenge/rules" className="hidden sm:inline text-xs sm:text-sm transition-colors" style={{ color: "var(--text-2)" }}>
            Rules
          </Link>
          <Link href="/challenge/parents" className="hidden md:inline text-xs sm:text-sm transition-colors" style={{ color: "var(--text-2)" }}>
            For Parents
          </Link>
          <GoldShimmerCta href="/" className="px-3 py-2 text-xs gap-1.5">
            Home <Home size={12} strokeWidth={2.5} />
          </GoldShimmerCta>

          {user ? (
            <>
              <div className="w-px h-4 shrink-0" style={{ background: "var(--border-mid)" }} />
              <NavUserMenu
                username={profile?.username ?? null}
                avatarUrl={profile?.avatar_url ?? null}
                profileHref="/challenge/profile"
                showChallengeBadge
                signOutRedirect="/challenge"
              />
            </>
          ) : (
            <Link
              href="/challenge/enroll"
              className="font-mono text-xs tracking-wider px-3 py-1.5 rounded-xl transition-colors"
              style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="px-5 sm:px-8 py-8 text-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--text-3)" }}>
          {CONTEST.name} · {CONTEST.year}
        </p>
        <p className="text-xs mt-2 max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
          A free financial-literacy competition. Virtual funds only — no real money is ever
          involved or at risk. Not investment advice.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
          <Link href="/challenge/rules" className="underline">Rules</Link>
          <Link href="/challenge/parents" className="underline">For Parents</Link>
          <Link href="/privacy" className="underline">Privacy</Link>
          <Link href="/tos" className="underline">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
