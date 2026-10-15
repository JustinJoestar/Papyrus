import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/leaderboard", destination: "/", permanent: false },
      { source: "/dashboard/leaderboard", destination: "/", permanent: false },
      { source: "/challenge", destination: "/", permanent: false },
      { source: "/dashboard/challenge", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
