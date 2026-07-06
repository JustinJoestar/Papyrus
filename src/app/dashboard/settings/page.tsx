import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="rise mb-8" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 08 — Preferences</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          Settings
        </h1>
      </div>

      {/* Account section */}
      <div
        className="rise card-cert corner-frame rounded-2xl p-6 mb-4"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <p className="label-ledger mb-4" style={{ letterSpacing: "0.22em" }}>
          Account
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
              Signed in as
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              {user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Appearance */}
      <div
        className="rise card-cert corner-frame rounded-2xl p-6"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <p className="label-ledger mb-4" style={{ letterSpacing: "0.22em" }}>
          Appearance
        </p>
        <ThemeToggle />
      </div>
    </div>
  );
}
