"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.getAttribute("data-theme") === "light";
  });

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("papyrus-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("papyrus-theme", "dark");
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
          {isLight ? "Parchment" : "Vault"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
          {isLight ? "Aged paper, ink & bronze" : "Lacquer black & gold leaf"}
        </p>
      </div>

      {/* Toggle pill */}
      <button
        onClick={toggle}
        className="relative w-12 h-6 rounded-full transition-all duration-200 shrink-0"
        style={{
          background: isLight ? "var(--gold)" : "var(--elevated)",
          border: `1px solid ${isLight ? "var(--gold-bright)" : "var(--border-bright)"}`,
        }}
        aria-label="Toggle theme"
      >
        {/* Knob */}
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center text-[10px]"
          style={{
            left: isLight ? "calc(100% - 22px)" : "2px",
            background: "#fdf9ee",
            boxShadow: "0 1px 3px rgba(0,0,0,0.30)",
          }}
        >
          {isLight ? "☀️" : "🌙"}
        </span>
      </button>
    </div>
  );
}
