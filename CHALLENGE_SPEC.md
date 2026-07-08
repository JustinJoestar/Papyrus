# Papyrus Summer Trading Challenge — Build Spec

The reference doc we build against. A fixed-window, free paper-trading
competition for high schoolers, run on the Papyrus engine but presented as
a distinct, branded event at **`/challenge`**.

## North star
A genuinely impressive, *measurable* financial-literacy program — strong
participation, real external validation (sponsor + local press), and rigorous
auto-computed awards. The code is the easy part; distribution and legitimacy
are what make it matter.

## Architecture: shared engine, separate experience
- **Reuses:** Google auth, the secured `/api/trade` route + `execute_league_trade`,
  the price feeds, and the `leagues` / `league_members` / `league_holdings` tables.
- **Separate:** its own route tree under `/challenge` with its own layout/branding —
  no weekly-game chrome. Entry point linked from the main Papyrus landing nav.
- **Contest = a `leagues` row** with `is_contest = true`, a `starts_at` gate, fixed
  `ends_at`, `$100,000` starting balance, and a locked asset universe.
- **Exempt from the weekly reset** automatically — `perform_weekly_reset()` only
  touches global `profiles` / `holdings`, never league tables.

## Locked decisions
| Topic | Decision |
|---|---|
| Window | **Four weeks** (public copy). NB: configured dates are still **Jun 29 – Aug 7, 2026** (~6 weeks) — align `CONTEST.endsAt` + the DB contest row if the four-week length is final. Enrollment stays open through the run |
| Eligibility | **13+** (grades 9–12). Age-gated at signup → keeps COPPA out, parent email can stay optional |
| Starting balance | **$100,000** virtual, equal for all, no resets/deposits |
| Universe | **US stocks + ETFs** (S&P 500 + major ETFs, hard whitelist) **+ crypto** (top 250 coins, same feed as the main site). No options/penny |
| Trading | **24/7** at last price, **no trade limits** |
| Identity | **Google sign-in → enroll form.** One Google account = one entry |
| Parent email | **Optional** (legal because of the 13+ floor) |
| Jurisdiction | **US only** |
| Prize | **Single prize:** $50 gift card + winner's certificate, Top Trader only (decided 2026-07-07) |
| Email | **Resend** (free tier ~3k/mo, 100/day; verify `papyrus-trade.com`) |

## The prize (auto-computed)
**Top Trader** — highest total return %: `(cash + holdings − 100k) / 100k` wins the
$50 gift card + winner's certificate. Ties go to the earlier enrollment. Manual
override available via admin.

(Sortino "Smartest Investor" and Comeback awards were cut 2026-07-07 — single prize
only. `AWARDS` in `src/lib/challenge.ts` now has one entry.)

## Daily snapshots
A cron records each participant's total portfolio value at **4:00 PM ET** daily into
`contest_snapshots`. No longer required for awards (Sortino/Comeback were cut), but
kept running — the history powers progress charts / narrative stats and can't be
backfilled if we ever want it.

## Pages
- `/challenge` — teen landing: countdown, prize, how-it-works, CTA. ✅ built
- `/challenge/enroll` — Google sign-in → form (name, optional parent email, school, grade, how-heard).
- `/challenge/leaderboard` — live public board ranked by return %.
- `/challenge/rules` — dates, balance, universe, the Top Trader formula, prize.
- `/challenge/parents` — safety-first: free, no real money, educational, rules.

## Email comms (Resend)
- Welcome/confirmation on enroll.
- Mid-contest standings (also to parent email if provided).
- Winner announcement at close.

## Admin (email-allowlisted via `app_admins`)
- Create/edit the contest (dates, balance, prize) — `create_contest` RPC.
- Manage the asset whitelist.
- View enrollments + standings.
- Auto-computed winners with manual override.

## Enrollment data captured
name · Google email · optional parent email · **school · grade · how-heard · referral code**
(the last four power the narrative metrics: "reached N schools", "press drove M signups").

## Referral system
Every enrollee gets a unique 6-char share code (`contest_enrollments.referral_code`,
unambiguous alphabet, unique per contest). New entrants can enter a friend's code on
the enroll form or arrive via `/challenge/enroll?ref=CODE` (prefilled; survives the
Google OAuth roundtrip via `next=` + localStorage). The link is validated and locked
server-side inside `enroll_in_contest` — code must belong to an enrolled participant,
no self-referrals, `referred_by` set on first insert only — so counts can't be gamed.
Surfaces: share card on the enroll success screen + `/challenge/play`
(`get_contest_referral_stats` RPC), and a **Referrals tab on the leaderboard**
(`?view=referrals`) ranked by recruits, ties broken by earliest enrollment.
Schema/RPCs in `supabase/referrals.sql`.

## Build phasing
**Launch (early July):** signup + landing/rules/parents pages + contest league with
start gate + universe + trading + live return-% leaderboard + welcome email + **snapshots running**.

**During the run:** winner determination (top total return), mid-contest
email, admin override UI.

## Status
- [x] `/challenge` landing + layout, countdown, light/dark toggle, main-page entry point
- [x] Pixel-canvas hero (themed, theme-aware)
- [x] `src/lib/challenge.ts` config (dates, awards, status helpers)
- [x] `supabase/challenge.sql` schema (config, admin, enrollments, universe, snapshots, RPCs)
- [x] Rules page
- [x] Parents page
- [x] Enroll page + wire `enroll_in_contest` (Google → form); `/auth/callback` honors `?next=`
- [x] Contest trading: `/api/trade` universe + window gating; `/challenge/play` market + portfolio (reuses TradeModal)
- [x] Leaderboard (return %, live, auto-refresh)
- [x] Daily snapshot cron (`/api/challenge/snapshot` + GH Action at 20:30 UTC)
- [x] Admin page (`/challenge/admin`: create/edit contest, enrollments, CSV export)
- [x] Referral system (codes, `?ref=` links, leaderboard Referrals tab) — run `supabase/referrals.sql`
- [ ] Resend welcome email
- [ ] Winner computation (highest total return) + certificate
- [x] Prize finalized ($50 gift card + certificate)
- [ ] Finalize asset whitelist + pursue sponsor

## Out of scope (v1)
Payment, real money, options/derivatives, multi-contest history.
