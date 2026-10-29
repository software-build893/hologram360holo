/**
 * Mutable scene state shared between the scroll listener (writer) and the three.js frame loop and
 * DOM-driven copy (readers). Kept outside React so scroll never triggers a re-render.
 */
export const scene = {
  /** 0..1 through the pinned hero story */
  progress: 0,
  /** normalized pointer, -1..1 */
  pointer: { x: 0, y: 0 },
};

export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const FULL_SPEED = 11.7; // rev/s, about 700 rpm

/** Rotor speed (rev/s) across the story: full, slow to a crawl so the blades read, back to full. */
export function speedAt(p: number) {
  if (p < 0.28) return FULL_SPEED;
  if (p < 0.5) return lerp(FULL_SPEED, 1.0, smooth((p - 0.28) / 0.22));
  if (p < 0.72) return lerp(1.0, 0.22, smooth((p - 0.5) / 0.22));
  if (p < 0.92) return lerp(0.22, FULL_SPEED, smooth((p - 0.72) / 0.2));
  return FULL_SPEED;
}

/** Clear cover lift (0 = on, 1 = lifted away) */
export function coverAt(p: number) {
  if (p < 0.1) return 0;
  if (p < 0.3) return smooth((p - 0.1) / 0.2);
  if (p < 0.86) return 1;
  return 1 - smooth((p - 0.86) / 0.12);
}

export { FULL_SPEED };
