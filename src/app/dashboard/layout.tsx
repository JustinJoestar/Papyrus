import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import NavUserMenu from "@/components/NavUserMenu";
import HexBackground from "@/components/HexBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--base)", color: "var(--text-1)" }}
    >
      {/* Animated hex grid — behind everything */}
      <HexBackground />

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 h-14 flex items-center px-6 gap-4 backdrop-blur-md"
        style={{
          background: "rgba(3, 3, 3, 0.90)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-end gap-[3px]">
            <div className="w-[3px] h-3    rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-[16px] rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-2    rounded-sm" style={{ background: "var(--gold-dim)" }} />
          </div>
          <span
            className="font-mono font-bold text-sm tracking-[0.15em]"
            style={{ color: "var(--text-1)" }}
          >
            PAPYRUS
          </span>
        </Link>

        <div className="w-px h-4 shrink-0" style={{ background: "var(--border-mid)" }} />

        <NavLinks />

        <div className="ml-auto">
          <NavUserMenu />
        </div>
      </nav>

      {/* Page content — sits above hex canvas */}
      <main className="relative" style={{ zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
