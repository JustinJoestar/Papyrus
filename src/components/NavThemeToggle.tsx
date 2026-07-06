"use client";

import { useEffect, useState } from "react";

export default function NavThemeToggle() {
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
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={isLight ? "Switch to Vault (dark)" : "Switch to Parchment (light)"}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
      style={{
        background: "transparent",
        border: "1px solid transparent",
        color: "var(--text-3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--gold-border)";
        e.currentTarget.style.color = "var(--gold)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.color = "var(--text-3)";
      }}
    >
      {isLight ? (
        /* Moon — switch to dark vault */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        /* Sun — switch to parchment */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.5" />
          <line x1="12" y1="2"  x2="12" y2="4"  />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </svg>
      )}
    </button>
  );
}
