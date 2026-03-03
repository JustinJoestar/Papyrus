"use client";

import { useEffect, useRef } from "react";

const R          = 32;                    // circumradius (flat-top hex)
const COL_STEP   = R * 1.5;              // 48  — horizontal centre spacing
const ROW_H      = R * Math.sqrt(3);     // 55.4 — vertical centre spacing
const SPEED_X    = 0.20;                 // px per frame (drift right)
const SPEED_Y    = 0.10;                 // px per frame (drift down)
const STROKE     = "rgba(201,168,76,0.065)";
const LINE_WIDTH = 0.7;

function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3; // flat-top: 0°, 60°, 120°, …
    const x = cx + R * Math.cos(a);
    const y = cy + R * Math.sin(a);
    k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

export default function HexBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const offset    = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas to device pixel ratio for crisp lines
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width  = window.innerWidth  * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width  = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    // Horizontal period = COL_STEP * 2 = 96 (two columns before pattern repeats)
    // Vertical period   = ROW_H         = 55.4
    const PERIOD_X = COL_STEP * 2;
    const PERIOD_Y = ROW_H;

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx!.clearRect(0, 0, w, h);
      ctx!.strokeStyle = STROKE;
      ctx!.lineWidth   = LINE_WIDTH;

      // Wrap offset within one tile period for seamless looping
      const ox = ((offset.current.x % PERIOD_X) + PERIOD_X) % PERIOD_X;
      const oy = ((offset.current.y % PERIOD_Y) + PERIOD_Y) % PERIOD_Y;

      // Number of columns/rows needed to fill screen + 2 extra on each side
      const colStart = -2;
      const colEnd   = Math.ceil(w / COL_STEP) + 3;
      const rowStart = -2;
      const rowEnd   = Math.ceil(h / ROW_H)    + 3;

      for (let c = colStart; c <= colEnd; c++) {
        const cx   = c * COL_STEP + ox;
        // Odd columns shift down by half a row
        const yOff = (c & 1) ? ROW_H / 2 : 0;

        for (let r = rowStart; r <= rowEnd; r++) {
          const cy = r * ROW_H + yOff + oy;
          drawHex(ctx!, cx, cy);
        }
      }

      offset.current.x += SPEED_X;
      offset.current.y += SPEED_Y;
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
