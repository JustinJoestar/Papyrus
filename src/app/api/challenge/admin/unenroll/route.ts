import { NextRequest, NextResponse } from "next/server";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const userClient = await createUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { userId, leagueId } = await req.json();
  if (!userId || !leagueId) return NextResponse.json({ error: "Missing userId or leagueId" }, { status: 400 });

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [r1, r2, r3] = await Promise.all([
    admin.from("contest_enrollments").delete().eq("user_id", userId).eq("league_id", leagueId),
    admin.from("league_members").delete().eq("user_id", userId).eq("league_id", leagueId),
    admin.from("league_holdings").delete().eq("user_id", userId).eq("league_id", leagueId),
  ]);

  const err = r1.error ?? r2.error ?? r3.error;
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
