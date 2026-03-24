import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AchievementsClient from "@/components/AchievementsClient";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: unlockedData }, { count: tradeCount }] = await Promise.all([
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return (
    <AchievementsClient
      unlockedAchievements={unlockedData ?? []}
      tradeCount={tradeCount ?? 0}
      userId={user.id}
    />
  );
}
