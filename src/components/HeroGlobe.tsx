"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      dark: 1,
      diffuse: 2.4,
      mapSamples: 20000,
      mapBrightness: 22,
      baseColor:   [0.12, 0.10, 0.04],
      markerColor: [1.0, 0.88, 0.40],
      glowColor:   [1.0, 0.80, 0.28],
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
  }, []);

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
