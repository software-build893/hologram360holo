import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

// First-party event store: one JSON line per event under data/. Enough for the visitor and
// submission counts PRODUCT.md asks for, with no third-party script on the page.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

export type EventKind = "pageview" | "quote";

export async function record(kind: EventKind, payload: Record<string, unknown>) {
  await mkdir(DATA_DIR, { recursive: true });
  const line = JSON.stringify({ at: new Date().toISOString(), kind, ...payload });
  await appendFile(path.join(DATA_DIR, `${kind}.jsonl`), line + "\n", "utf8");
}

export async function count(kind: EventKind): Promise<number> {
  try {
    const text = await readFile(path.join(DATA_DIR, `${kind}.jsonl`), "utf8");
    return text.split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}
