import { useEffect, useRef } from "react";

/**
 * Canvas 2D stand-in for the WebGL fluid background.
 *
 * The original ran a Navier-Stokes simulation in fragment shaders — roughly
 * twenty full-screen GPU passes per frame, plus three.js at ~123kB gzip. That
 * cost dominated the home page's Lighthouse score, and a real fluid solve is
 * not something a CPU can do per pixel at 60fps.
 *
 * So this approximates the *look* rather than the physics: a handful of soft
 * colour masses drifting on layered sines, composited additively. Two tricks
 * keep it nearly free:
 *
 * 1. Each blob is drawn once into a small sprite canvas and then blitted with
 *    drawImage. Building a radial gradient every frame is the expensive part of
 *    canvas work; doing it once removes it entirely.
 * 2. The canvas is rendered at a fixed low resolution (~220px wide) and scaled
 *    up by the browser with a CSS blur. Upscaling a blurred image is free, and
 *    at this blur radius the missing detail is invisible.
 *
 * Net: a few dozen drawImage calls per frame on a postage-stamp canvas.
 */

interface Props {
  colors: string[];
  /** Pointer push strength, in fractions of the canvas. */
  mouseForce?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Blob {
  /** Base position in 0..1 space. */
  x: number;
  y: number;
  radius: number;
  colorIndex: number;
  /** Drift amplitudes and speeds, layered so paths never visibly repeat. */
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  phase: number;
}

const RENDER_WIDTH = 220;
const SPRITE_SIZE = 128;

const BLOBS: Blob[] = [
  { x: 0.28, y: 0.42, radius: 0.52, colorIndex: 1, ax: 0.13, ay: 0.09, sx: 0.055, sy: 0.041, phase: 0.0 },
  { x: 0.70, y: 0.38, radius: 0.46, colorIndex: 0, ax: 0.11, ay: 0.12, sx: 0.043, sy: 0.062, phase: 1.7 },
  { x: 0.50, y: 0.62, radius: 0.58, colorIndex: 2, ax: 0.15, ay: 0.08, sx: 0.037, sy: 0.049, phase: 3.1 },
  { x: 0.18, y: 0.72, radius: 0.40, colorIndex: 0, ax: 0.09, ay: 0.11, sx: 0.061, sy: 0.035, phase: 4.4 },
  { x: 0.82, y: 0.68, radius: 0.44, colorIndex: 1, ax: 0.12, ay: 0.10, sx: 0.048, sy: 0.057, phase: 5.6 },
  { x: 0.45, y: 0.22, radius: 0.36, colorIndex: 2, ax: 0.14, ay: 0.07, sx: 0.052, sy: 0.044, phase: 2.3 },
];

/** Pre-render one soft radial sprite per colour. */
function makeSprites(colors: string[]): HTMLCanvasElement[] {
  return colors.map(color => {
    const c = document.createElement("canvas");
    c.width = SPRITE_SIZE;
    c.height = SPRITE_SIZE;
    const ctx = c.getContext("2d")!;
    const half = SPRITE_SIZE / 2;
    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    // A steep falloff keeps the masses distinct instead of a flat wash.
    g.addColorStop(0, color);
    g.addColorStop(0.45, `${color}66`);
    g.addColorStop(1, `${color}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    return c;
  });
}

export default function LiquidFlow2D({
  colors,
  mouseForce = 0.09,
  className,
  style,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const sprites = makeSprites(colors);
    let width = RENDER_WIDTH;
    let height = RENDER_WIDTH;
    let raf = 0;
    let running = true;
    let onScreen = true;

    // Pointer target and the eased value that follows it, so the reaction has
    // weight instead of snapping.
    let targetX = 0.5;
    let targetY = 0.45;
    let pointerX = 0.5;
    let pointerY = 0.45;
    let pointerActive = false;
    let idleSince = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.height > 0 ? rect.height / rect.width : 0.6;
      width = RENDER_WIDTH;
      height = Math.max(1, Math.round(RENDER_WIDTH * aspect));
      canvas.width = width;
      canvas.height = height;
    };

    const draw = (timeMs: number) => {
      const t = timeMs / 1000;

      // With no pointer, wander a target around so the masses keep reacting —
      // the same idea as the original's autoDemo mode.
      if (!pointerActive || timeMs - idleSince > 3000) {
        targetX = 0.5 + Math.cos(t * 0.13) * 0.30 + Math.sin(t * 0.07) * 0.10;
        targetY = 0.45 + Math.sin(t * 0.11) * 0.24 + Math.cos(t * 0.05) * 0.08;
      }
      pointerX += (targetX - pointerX) * 0.03;
      pointerY += (targetY - pointerY) * 0.03;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const b of BLOBS) {
        const drift = reduceMotion ? 0 : 1;
        let bx = b.x + Math.sin(t * b.sx * 6.28 + b.phase) * b.ax * drift;
        let by = b.y + Math.cos(t * b.sy * 6.28 + b.phase) * b.ay * drift;

        // Push each mass away from the pointer, falling off with distance.
        const dx = bx - pointerX;
        const dy = by - pointerY;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const influence = Math.max(0, 1 - dist / 0.75);
        bx += (dx / dist) * influence * influence * mouseForce;
        by += (dy / dist) * influence * influence * mouseForce;

        const r = b.radius * width;
        ctx.drawImage(
          sprites[b.colorIndex % sprites.length],
          bx * width - r / 2,
          by * height - r / 2,
          r,
          r
        );
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (timeMs: number) => {
      draw(timeMs);
      if (running && onScreen && !reduceMotion) {
        raf = requestAnimationFrame(loop);
      }
    };

    const start = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
      pointerActive = true;
      idleSince = performance.now();
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running && onScreen) start();
      else if (raf) cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      entries => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen && running) start();
        else if (raf) cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );

    resize();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [colors, mouseForce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        display: "block",
        // The canvas is ~220px wide; blurring the upscale hides that entirely
        // and is what turns discrete blobs into one continuous flow.
        filter: "blur(28px) saturate(1.15)",
        // Scale past the edges so the blur does not reveal a soft border.
        transform: "scale(1.18)",
        ...style,
      }}
    />
  );
}
