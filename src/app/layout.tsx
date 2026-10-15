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

const SITE_DESCRIPTION =
  "Learn to invest with $10,000 in virtual cash. Trade real stocks, crypto, and commodities at live prices. No risk, no card.";

export const metadata: Metadata = {
  metadataBase: new URL("https://papyrus-trade.com"),
  title: "Papyrus — Learn to Invest, Risk-Free",
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Papyrus",
    title: "Papyrus — Learn to Invest, Risk-Free",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Papyrus — Learn to Invest, Risk-Free",
    description: SITE_DESCRIPTION,
  },
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
        </ThemeProvider>
      </body>
    </html>
  );
}
