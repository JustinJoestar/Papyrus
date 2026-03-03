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
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Preferences
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Settings
        </h1>
      </div>

      {/* Account section */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <p
          className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4"
          style={{ color: "var(--text-3)" }}
        >
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
        className="rounded-2xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <p
          className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4"
          style={{ color: "var(--text-3)" }}
        >
          Appearance
        </p>
        <ThemeToggle />
      </div>
    </div>
  );
}
