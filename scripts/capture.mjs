#!/usr/bin/env node
// Screenshot a page from headless Chrome over CDP, after a real-time settle so WebGL and video frames exist.
// usage: node scripts/capture.mjs <url> <out.png> [--width 1344] [--height 752] [--wait 6000] [--full] [--reduced] [--eval "<js>"]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const width = Number(opt("width", 1344));
const height = Number(opt("height", 752));
const wait = Number(opt("wait", 6000));
const full = args.includes("--full");
const reduced = args.includes("--reduced");
const pre = opt("eval", "");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9222 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "capture-"));

const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--autoplay-policy=no-user-gesture-required",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json`);
      return await r.json();
    } catch {
      await sleep(200);
    }
  }
  throw new Error("chrome did not start");
}

let id = 0;
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  return new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve({ send, ws }));
    ws.addEventListener("error", reject);
  });
}

try {
  const list = await targets();
  const page = list.find((t) => t.type === "page");
  const { send, ws } = await connect(page.webSocketDebuggerUrl);
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  if (reduced) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url });
  await sleep(wait);
  if (pre) await send("Runtime.evaluate", { expression: pre, awaitPromise: true });
  await sleep(pre ? 1200 : 0);
  const probe = await send("Runtime.evaluate", {
    expression: `(() => { const c = document.querySelector('canvas'); return JSON.stringify({ canvas: !!c, webgl: !!(c && (c.getContext('webgl2') || c.getContext('webgl'))), h: document.documentElement.scrollHeight }) })()`,
  });
  console.log("PROBE", probe.result.value);
  let clip;
  if (full) {
    const h = JSON.parse(probe.result.value).h;
    await send("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 1, mobile: false });
    await sleep(800);
    clip = { x: 0, y: 0, width, height: h, scale: 1 };
  }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, clip });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("WROTE", out);
  ws.close();
} finally {
  proc.kill();
}
