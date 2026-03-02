import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-6">
        <span className="text-xl font-bold text-indigo-400">Papyrus</span>
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Portfolio
        </Link>
        <Link
          href="/dashboard/market"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Market
        </Link>
        <Link
          href="/dashboard/leaderboard"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Leaderboard
        </Link>
        <Link
          href="/dashboard/leagues"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Leagues
        </Link>
        <div className="ml-auto">
          <form action="/auth/logout" method="post">
            <button className="text-sm text-gray-400 hover:text-white transition">
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
