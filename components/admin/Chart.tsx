import type { DayRow } from "@/lib/db";

// Daily visitors and page views as grouped bars, drawn from data at request time.
export default function Chart({ rows, className }: { rows: DayRow[]; className?: string }) {
  const W = 840;
  const H = 220;
  const padL = 36;
  const padB = 24;
  const padT = 10;
  const innerW = W - padL - 8;
  const innerH = H - padB - padT;
  const max = Math.max(1, ...rows.map((r) => Math.max(r.visitors, r.pageviews)));
  const step = innerW / rows.length;
  const bw = Math.max(2, Math.min(14, step * 0.32));
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f));
  const labelEvery = rows.length > 14 ? Math.ceil(rows.length / 7) : 1;

  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily visitors and page views">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - 8} y1={y(t)} y2={y(t)} stroke="#262626" strokeWidth={1} />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end">{t}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const x = padL + i * step + step / 2;
        return (
          <g key={r.day}>
            <rect x={x - bw - 1} y={y(r.pageviews)} width={bw} height={padT + innerH - y(r.pageviews)} fill="#2f3233" rx={1.5}>
              <title>{`${r.day}: ${r.pageviews} page views`}</title>
            </rect>
            <rect x={x + 1} y={y(r.visitors)} width={bw} height={padT + innerH - y(r.visitors)} fill="#0cf2f3" rx={1.5}>
              <title>{`${r.day}: ${r.visitors} visitors`}</title>
            </rect>
            {r.quotes > 0 && <circle cx={x} cy={y(0) + 7} r={2.5} fill="#7ee787"><title>{`${r.quotes} quote request${r.quotes > 1 ? "s" : ""}`}</title></circle>}
            {i % labelEvery === 0 && (
              <text x={x} y={H - 6} textAnchor="middle">{r.day.slice(5)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
