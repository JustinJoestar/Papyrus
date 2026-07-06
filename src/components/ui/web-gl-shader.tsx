"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Uniforms = {
  resolution: { value: [number, number] };
  time: { value: number };
  xScale: { value: number };
  yScale: { value: number };
  distortion: { value: number };
  uTint: { value: [number, number, number] };
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "c9a84c", 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readTint(): [number, number, number] {
  if (typeof window === "undefined") return hexToRgb("c9a84c");
  const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold");
  return hexToRgb(gold || "#c9a24e");
}

// Animated sine-wave light streaks. Recolored from the original RGB rainbow to
// a single theme tint (gold in dark mode, blue in light) read from --gold, with
// a faint chromatic shimmer kept at the edges. Fills its positioned parent.
export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.OrthographicCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mesh: THREE.Mesh | null;
    uniforms: Uniforms | null;
    animationId: number | null;
  }>({ scene: null, camera: null, renderer: null, mesh: null, uniforms: null, animationId: null });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const { current: refs } = sceneRef;

    const vertexShader = `
      attribute vec3 position;
      void main() { gl_Position = vec4(position, 1.0); }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      uniform vec3 uTint;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        float d = length(p) * distortion;
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        // Tint the streaks toward the theme accent; keep a subtle chromatic edge
        vec3 col = vec3(r, g, b) * uTint;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const sizeToParent = () => {
      if (!refs.renderer || !refs.uniforms) return;
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
      refs.renderer.setSize(w, h, false);
      refs.uniforms.resolution.value = [w, h];
    };

    const initScene = () => {
      refs.scene = new THREE.Scene();
      // WebGL may be unavailable (old hardware, software rendering, headless).
      // Fail quietly and leave the static backdrop instead of crashing the page.
      try {
        refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      } catch {
        refs.renderer = null;
        return;
      }
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.setClearColor(new THREE.Color(0x05060a));
      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

      refs.uniforms = {
        resolution: { value: [1, 1] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.05 },
        uTint: { value: readTint() },
      };

      const position = [
        -1.0, -1.0, 0.0,  1.0, -1.0, 0.0, -1.0, 1.0, 0.0,
         1.0, -1.0, 0.0, -1.0,  1.0, 0.0,  1.0, 1.0, 0.0,
      ];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(position), 3));

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms as unknown as { [k: string]: THREE.IUniform },
        side: THREE.DoubleSide,
      });

      refs.mesh = new THREE.Mesh(geometry, material);
      refs.scene.add(refs.mesh);
      sizeToParent();
    };

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01;
      if (refs.renderer && refs.scene && refs.camera) refs.renderer.render(refs.scene, refs.camera);
      refs.animationId = requestAnimationFrame(animate);
    };

    initScene();
    if (!refs.renderer) return; // no WebGL — skip animation + observers
    animate();

    const resizeObserver = new ResizeObserver(() => sizeToParent());
    resizeObserver.observe(canvas);

    // Recolor on light/dark toggle
    const themeObserver = new MutationObserver(() => {
      if (refs.uniforms) refs.uniforms.uTint.value = readTint();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh);
        refs.mesh.geometry.dispose();
        if (refs.mesh.material instanceof THREE.Material) refs.mesh.material.dispose();
      }
      refs.renderer?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
