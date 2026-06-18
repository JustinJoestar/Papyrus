import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { getVerifiedPrice, type AssetType } from "@/lib/serverPrice";

const ASSET_TYPES: AssetType[] = ["crypto", "stock", "commodity"];

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(req: NextRequest) {
  // 1. Authenticate from the session cookie — the user id is derived here,
  //    never trusted from the request body.
  const userClient = await createUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return fail("Not authenticated", 401);

  // 2. Parse and validate the request.
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const symbol    = body.symbol;
  const assetType = body.assetType;
  const type      = body.type;
  const quantity  = Number(body.quantity);
  const leagueId  = body.leagueId == null ? null : String(body.leagueId);

  if (typeof symbol !== "string" || symbol.trim() === "") return fail("Missing symbol", 400);
  if (typeof assetType !== "string" || !ASSET_TYPES.includes(assetType as AssetType))
    return fail("Invalid asset type", 400);
  if (type !== "buy" && type !== "sell") return fail("Invalid trade type", 400);
  if (!Number.isFinite(quantity) || quantity <= 0) return fail("Invalid quantity", 400);

  // 3. Fetch the authoritative price server-side. If the feed is down we
  //    refuse rather than fall back to anything the client supplied.
  const price = await getVerifiedPrice(symbol, assetType as AssetType);
  if (price == null || price <= 0)
    return fail("Price temporarily unavailable. Please try again in a moment.", 503);

  // 4. Execute with the service role so we can call the locked-down RPC,
  //    passing the server-verified user id and price.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = leagueId
    ? await admin.rpc("execute_league_trade", {
        p_user_id: user.id, p_league_id: leagueId, p_symbol: symbol,
        p_asset_type: assetType, p_type: type, p_quantity: quantity, p_price: price,
      })
    : await admin.rpc("execute_trade", {
        p_user_id: user.id, p_symbol: symbol, p_asset_type: assetType,
        p_type: type, p_quantity: quantity, p_price: price,
      });

  if (error || data?.success === false)
    return fail(error?.message ?? data?.error ?? "Trade failed", 400);

  // 5. Post-trade hooks for global trades — run as the user (use auth.uid()).
  if (!leagueId) {
    await userClient.rpc("check_trade_achievements");
    void userClient.rpc("check_leaderboard_notification");
  }

  return NextResponse.json({ success: true, price });
}
