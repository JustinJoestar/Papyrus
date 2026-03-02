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
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-2">My Leagues</h2>
      <p className="text-gray-400 mb-8">
        Compete in private groups with friends and classmates.
      </p>

      <LeagueActions />

      {!leagues || leagues.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🏆</p>
          <p className="font-medium mb-1">No leagues yet</p>
          <p className="text-sm">Create one or join with an invite code.</p>
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
