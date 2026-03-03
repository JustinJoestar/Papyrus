import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeagueActions from "@/components/LeagueActions";
import LeagueCard from "@/components/LeagueCard";

type League = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  is_owner: boolean;
  member_count: number;
  starting_balance: number;
  created_at: string;
};

export default async function LeaguesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: leagues } = await supabase.rpc("get_my_leagues");

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Private Competition
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          My Leagues
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
          Compete in private groups with friends and classmates.
        </p>
      </div>

      <LeagueActions />

      {!leagues || leagues.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4"
            style={{ color: "var(--text-3)" }}
          >
            No Leagues Yet
          </p>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Create one or join with an invite code.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(leagues as League[]).map((league) => (
            <LeagueCard
              key={league.id}
              league={league}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
