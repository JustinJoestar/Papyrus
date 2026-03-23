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
      diffuse: 1.8,
      mapSamples: 20000,
      mapBrightness: 14,
      baseColor:   [0.08, 0.06, 0.02],
      markerColor: [1.0, 0.88, 0.40],
      glowColor:   [0.80, 0.62, 0.20],
      markers: [
        { location: [40.7128, -74.006],  size: 0.038 }, // New York
        { location: [51.5074, -0.1278],  size: 0.034 }, // London
        { location: [35.6762, 139.6503], size: 0.034 }, // Tokyo
        { location: [22.3193, 114.1694], size: 0.030 }, // Hong Kong
        { location: [1.3521,  103.8198], size: 0.028 }, // Singapore
        { location: [48.8566, 2.3522],   size: 0.026 }, // Paris
        { location: [37.7749, -122.419], size: 0.030 }, // San Francisco
        { location: [-33.8688, 151.209], size: 0.026 }, // Sydney
        { location: [25.2048, 55.2708],  size: 0.028 }, // Dubai
        { location: [55.7558, 37.6173],  size: 0.026 }, // Moscow
      ],
    });

    function animate() {
      phi += 0.0032;
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
