import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Optional internal-only redirect target (e.g. the contest enroll flow).
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // A flow that specifies its own destination (e.g. /challenge/enroll)
    // owns the rest of onboarding, so skip the username gate.
    if (next) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username_changed_at")
        .eq("id", user.id)
        .single();

      // username_changed_at is null → first login, needs to pick a username
      if (!profile?.username_changed_at) {
        return NextResponse.redirect(`${origin}/auth/username`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
