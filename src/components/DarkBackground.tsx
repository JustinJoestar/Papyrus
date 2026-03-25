"use client";

import { useEffect, useState } from "react";

export function DarkBackground() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  if (isLight) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Slow drifting cool-grey depth blobs — near-midnight palette */}
      <div className="dark-blob dark-blob-1" />
      <div className="dark-blob dark-blob-2" />
    </div>
  );
}
