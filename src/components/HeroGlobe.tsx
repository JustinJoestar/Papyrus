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
      diffuse: 2.0,
      mapSamples: 16000,
      mapBrightness: 8,
      baseColor:   [0.18, 0.14, 0.04],
      markerColor: [1.0, 0.82, 0.30],
      glowColor:   [0.70, 0.55, 0.18],
      markers: [
        { location: [40.7128, -74.006],  size: 0.055 }, // New York
        { location: [51.5074, -0.1278],  size: 0.048 }, // London
        { location: [35.6762, 139.6503], size: 0.05  }, // Tokyo
        { location: [22.3193, 114.1694], size: 0.042 }, // Hong Kong
        { location: [1.3521,  103.8198], size: 0.038 }, // Singapore
        { location: [48.8566, 2.3522],   size: 0.035 }, // Paris
        { location: [37.7749, -122.419], size: 0.04  }, // San Francisco
        { location: [-33.8688, 151.209], size: 0.032 }, // Sydney
        { location: [25.2048, 55.2708],  size: 0.038 }, // Dubai
        { location: [55.7558, 37.6173],  size: 0.032 }, // Moscow
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
      {/* Outer glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: -20,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.10) 30%, transparent 72%)",
          boxShadow: "0 0 60px rgba(201,168,76,0.22), 0 0 120px rgba(201,168,76,0.09)",
        }}
      />
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        style={{
          width: 240,
          height: 240,
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
