import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";
import { ThemeProvider } from "@/components/ThemeProvider";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Papyrus — The Paper Trading Terminal",
  description:
    "Trade crypto, stocks, and commodities with $10,000 in virtual cash. Live prices, weekly resets, private leagues. No real money at risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=location.search.match(/[?&]theme=(light|dark)/);if(m)localStorage.setItem('papyrus-theme',m[1]);var t=localStorage.getItem('papyrus-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${hanken.variable} ${plexMono.variable} antialiased`}
      >
        <ThemeProvider>
          <CursorGlow />
          {children}
          <footer className="footer-aurora w-full py-3 text-center">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--text-3)" }}>
              Verse Productions
            </span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
