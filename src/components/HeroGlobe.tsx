"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let phi = 0.4;
    let rafId: number;

    if (!canvasRef.current) return;

    // Vault: warm lacquer sphere with gold-leaf continents.
    // Parchment: paper sphere with bronze-ink continents.
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 360,
      height: 360,
      phi,
      theta: 0.22,
      dark: isLight ? 0 : 1,
      diffuse: isLight ? 1.8 : 2.4,
      mapSamples: 20000,
      mapBrightness: isLight ? 7 : 20,
      baseColor:   isLight ? [0.96, 0.93, 0.84] : [0.13, 0.11, 0.05],
      markerColor: isLight ? [0.56, 0.43, 0.15] : [1.0, 0.85, 0.45],
      glowColor:   isLight ? [0.78, 0.66, 0.38] : [1.0, 0.78, 0.30],
      markers: [],
    });

    function animate() {
      phi += 0.009;
      globe.update({ phi });
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
  }, [isLight]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      {/* Engraved orbit ring */}
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: 258,
          height: 258,
          border: "1px dashed var(--gold-border)",
          opacity: 0.6,
        }}
      />
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        style={{ width: 240, height: 240, borderRadius: "50%" }}
      />
    </div>
  );
}
