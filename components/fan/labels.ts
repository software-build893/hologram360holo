export type LabelDef = { id: string; pos: [number, number, number]; band: [number, number]; text: string; align?: "left" | "right" };
export const LABELS: LabelDef[] = [
  { id: "cover", pos: [0.62, -0.84, 0.62], band: [0.12, 0.3], text: "Acrylic cover · lifts off", align: "left" },
  { id: "dia", pos: [0.2, -0.95, 0.05], band: [0.3, 0.52], text: "Ø 42 cm · 2 blades", align: "left" },
  { id: "motor", pos: [0, 0, -0.1], band: [0.34, 0.56], text: "Brushless motor · 700 rpm", align: "right" },
  { id: "leds", pos: [0.6, -0.6, 0.03], band: [0.5, 0.74], text: "224 LEDs on one bar", align: "left" },
];
