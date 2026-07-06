import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeagueActions from "@/components/LeagueActions";
import LeagueCard from "@/components/LeagueCard";
import Guilloche from "@/components/Guilloche";

type League = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  is_owner: boolean;
  member_count: number;
  starting_balance: number;
  duration_days: number;
  ends_at: string | null;
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="rise mb-8" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 05 — Private Competition</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          The Challenge Hall
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-3)" }}>
          Issue a challenge. Set the stakes. Settle it on the tape.
        </p>
      </div>

      <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
        <LeagueActions />
      </div>

      {!leagues || leagues.length === 0 ? (
        <div className="rise relative text-center py-16 overflow-hidden rounded-2xl" style={{ "--i": 2, border: "1px dashed var(--border-bright)" } as React.CSSProperties}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.6 }}>
            <Guilloche size={380} />
          </div>
          <div className="relative z-10">
            <p className="font-display italic text-xl mb-2" style={{ color: "var(--text-2)" }}>
              No challenges on record.
            </p>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              Create a league or join with an invite code — then let the market decide.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {(leagues as League[]).map((league, i) => (
            <div key={league.id} className="rise" style={{ "--i": Math.min(2 + i, 10) } as React.CSSProperties}>
              <LeagueCard league={league} currentUserId={user.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
