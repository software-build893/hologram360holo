// Date ranges for the dashboard, all in UTC calendar days (the same clock the event store uses).

export type Range = { from: string; to: string; key: string; label: string };

const day = (t: number) => new Date(t).toISOString().slice(0, 10);
const DAY = 86_400_000;

export function presets(now = Date.now()): Range[] {
  const today = day(now);
  const d = new Date(now);
  const monthStart = day(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const lastMonthStart = day(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
  const lastMonthEnd = day(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 0));
  return [
    { key: "7d", label: "Last 7 days", from: day(now - 6 * DAY), to: today },
    { key: "30d", label: "Last 30 days", from: day(now - 29 * DAY), to: today },
    { key: "month", label: "This month", from: monthStart, to: today },
    { key: "last", label: "Last month", from: lastMonthStart, to: lastMonthEnd },
  ];
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function rangeFromParams(params: URLSearchParams, now = Date.now()): Range {
  const from = params.get("from");
  const to = params.get("to");
  if (from && to && ISO.test(from) && ISO.test(to) && from <= to) {
    return { key: "custom", label: `${from} to ${to}`, from, to };
  }
  const list = presets(now);
  return list.find((p) => p.key === params.get("range")) ?? list[1];
}

export function rangeQuery(r: Range): string {
  return r.key === "custom" ? `from=${r.from}&to=${r.to}` : `range=${r.key}`;
}
