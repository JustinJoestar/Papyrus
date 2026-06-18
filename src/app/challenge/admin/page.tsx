import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import AdminPanel, { type ContestRow, type EnrollmentRow } from "@/components/challenge/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Papyrus Summer Trading Challenge" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <h1 className="font-bold text-xl mb-2" style={{ color: "var(--text-1)" }}>Not authorized</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
          This page is for contest administrators. Add your email to the <code>app_admins</code> table to gain access.
        </p>
        <Link href="/challenge" className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}>
          ← Back to Challenge
        </Link>
      </div>
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createServiceClient(url, key);

  const { data: contest } = await admin
    .from("leagues")
    .select("id, name, starts_at, ends_at, starting_balance, prize_description")
    .eq("is_contest", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let enrollments: EnrollmentRow[] = [];
  let memberCount = 0;
  if (contest) {
    const { data: e } = await admin
      .from("contest_enrollments")
      .select("full_name, parent_email, school, grade, heard_from, enrolled_at")
      .eq("league_id", contest.id)
      .order("enrolled_at", { ascending: false });
    enrollments = (e ?? []) as EnrollmentRow[];
    const { count } = await admin
      .from("league_members")
      .select("user_id", { count: "exact", head: true })
      .eq("league_id", contest.id);
    memberCount = count ?? 0;
  }

  return <AdminPanel contest={(contest as ContestRow) ?? null} enrollments={enrollments} memberCount={memberCount} />;
}
