"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all duration-150"
      style={{
        color: "var(--text-3)",
        border: "1px solid var(--border-mid)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--gold)";
        e.currentTarget.style.borderColor = "var(--gold-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-3)";
        e.currentTarget.style.borderColor = "var(--border-mid)";
      }}
    >
      Sign out
    </button>
  );
}
