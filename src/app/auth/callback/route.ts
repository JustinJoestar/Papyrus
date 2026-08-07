import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

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

  return NextResponse.redirect(`${origin}/dashboard`);
}
