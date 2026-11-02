import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { eventsCsv } from "@/lib/db";
import { rangeFromParams } from "@/lib/range";

// Raw page-view rows for a period, as CSV, for the invoice backup.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { from, to } = rangeFromParams(new URL(req.url).searchParams);
  return new NextResponse(await eventsCsv(from, to), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="visits-${from}-to-${to}.csv"`,
    },
  });
}
