"use client";

import dynamic from "next/dynamic";

const HeroGlobe    = dynamic(() => import("@/components/HeroGlobe"),    { ssr: false });
const HeroTerminal = dynamic(() => import("@/components/HeroTerminal"), { ssr: false });

export function HeroGlobePanel()    { return <HeroGlobe />;    }
export function HeroTerminalPanel() { return <HeroTerminal />; }
