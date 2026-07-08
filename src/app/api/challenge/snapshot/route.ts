import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getHoldingPrices } from "@/lib/leaguePrices";

// Records each contest participant's total portfolio value once per day.
// These daily snapshots are what the Sortino ("Smartest Investor") and
// Comeback awards are computed from — they CANNOT be backfilled, so this
// must run every day of the contest window.
//
// Schedule for ~4:30 PM ET (20:30 UTC during EDT), after the close.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const validSecret = secret && auth === `Bearer ${secret}`;
  if (!isVercelCron && !validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: contest } = await supabase
    .from("leagues")
    .select("id, starts_at, ends_at")
    .eq("is_contest", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!contest) return NextResponse.json({ skipped: "no active contest" });

  // Only snapshot within the contest window (allow a 1-day grace after end
  // so the final day's close is captured).
  const now = Date.now();
  if (contest.starts_at && now < new Date(contest.starts_at).getTime())
    return NextResponse.json({ skipped: "not started" });
  if (contest.ends_at && now > new Date(contest.ends_at).getTime() + 86_400_000)
    return NextResponse.json({ skipped: "ended" });

  const [{ data: members }, { data: holdings }] = await Promise.all([
    supabase.from("league_members").select("user_id, league_cash_balance").eq("league_id", contest.id),
    supabase.from("league_holdings").select("user_id, symbol, asset_type, quantity").eq("league_id", contest.id),
  ]);

  const memberRows = members ?? [];
  if (memberRows.length === 0) return NextResponse.json({ snapshotted: 0 });

  const { priceOf } = await getHoldingPrices(holdings ?? []);

  const holdingsValue = new Map<string, number>();
  for (const h of holdings ?? []) {
    holdingsValue.set(h.user_id, (holdingsValue.get(h.user_id) ?? 0) + priceOf(h) * Number(h.quantity));
  }

  const snapshotDate = new Date().toISOString().slice(0, 10); // UTC date = trading day at 20:30 UTC
  const rows = memberRows.map((m) => ({
    league_id: contest.id,
    user_id: m.user_id,
    snapshot_date: snapshotDate,
    total_value: Number((Number(m.league_cash_balance) + (holdingsValue.get(m.user_id) ?? 0)).toFixed(2)),
  }));

  const { error } = await supabase
    .from("contest_snapshots")
    .upsert(rows, { onConflict: "league_id,user_id,snapshot_date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, snapshotted: rows.length, date: snapshotDate });
}
