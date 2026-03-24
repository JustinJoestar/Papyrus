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

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 360,
      height: 360,
      phi,
      theta: 0.22,
      dark: isLight ? 0 : 1,
      diffuse: isLight ? 1.8 : 2.4,
      mapSamples: 20000,
      mapBrightness: isLight ? 8 : 22,
      baseColor:   isLight ? [0.78, 0.88, 0.98] : [0.12, 0.10, 0.04],
      markerColor: isLight ? [0.10, 0.32, 0.92] : [1.0, 0.88, 0.40],
      glowColor:   isLight ? [0.37, 0.60, 0.98] : [1.0, 0.80, 0.28],
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
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        style={{ width: 240, height: 240, borderRadius: "50%" }}
      />
    </div>
  );
}
