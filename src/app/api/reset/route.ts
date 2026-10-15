import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel Cron Jobs send GET requests.
// Also callable manually: GET /api/reset  (Authorization: Bearer <CRON_SECRET>)
// Resets every user's portfolio back to the starting balance.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const validSecret = secret && auth === `Bearer ${secret}`;
  if (!isVercelCron && !validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role key so we can reset all users and bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: resetError } = await supabase.rpc("perform_weekly_reset");
  if (resetError) {
    return NextResponse.json(
      { error: `Reset failed: ${resetError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
