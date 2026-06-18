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
| Window | ~6 weeks, **Jun 29 – Aug 7, 2026** (configurable). **Enrollment open now** — entrants join a waitlist and appear on the board; trading unlocks Jun 29 |
| Eligibility | **13+** (grades 9–12). Age-gated at signup → keeps COPPA out, parent email can stay optional |
| Starting balance | **$100,000** virtual, equal for all, no resets/deposits |
| Universe | **US stocks + ETFs only** (S&P 500 + major ETFs). Hard whitelist. No crypto/options/penny |
| Trading | **24/7** at last price, **no trade limits** |
| Identity | **Google sign-in → enroll form.** One Google account = one entry |
| Parent email | **Optional** (legal because of the 13+ floor) |
| Jurisdiction | **US only** |
| Prize | **Gift card** (value + sponsor TBD — pursue sponsorship) |
| Email | **Resend** (free tier ~3k/mo, 100/day; verify `papyrus-trade.com`) |

## Awards (one prize per person, auto-computed)
1. **Top Trader** — highest total return %: `(cash + holdings − 100k) / 100k`.
2. **Smartest Investor** — **Sortino ratio** (downside deviation only), with an
   **eligibility gate**: positive total return AND ≥8 trades across ≥5 distinct days
   AND invested (not 100% cash) ≥60% of trading days. Downside-deviation floored to
   avoid divide-by-near-zero.
3. **Comeback** — best return % over the **final 14 days**, eligible **only to those
   at/below the median at the midpoint**.

Tie-breakers + manual override available via admin.

## Daily snapshots (non-deferrable)
A cron records each participant's total portfolio value at **4:00 PM ET** daily into
`contest_snapshots`. Sortino (daily-return volatility) and Comeback (final-window
return) are impossible without this history, and it **cannot be backfilled** — it must
run from the first trading day even though the code that consumes it ships later.

## Pages
- `/challenge` — teen landing: countdown, prize, 3 awards, how-it-works, CTA. ✅ built
- `/challenge/enroll` — Google sign-in → form (name, optional parent email, school, grade, how-heard).
- `/challenge/leaderboard` — live public board ranked by return %.
- `/challenge/rules` — dates, balance, universe, the 3 award formulas, prize.
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
name · Google email · optional parent email · **school · grade · how-heard**
(the last three power the narrative metrics: "reached N schools", "press drove M signups").

## Build phasing
**Launch (early July):** signup + landing/rules/parents pages + contest league with
start gate + universe + trading + live return-% leaderboard + welcome email + **snapshots running**.

**During the 6-week run:** Sortino/Comeback math, winner determination, mid-contest
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
- [ ] Resend welcome email
- [ ] Sortino + Comeback + winner computation
- [ ] Finalize asset whitelist + prize/sponsor

## Out of scope (v1)
Payment, real money, options/derivatives, multi-contest history.
