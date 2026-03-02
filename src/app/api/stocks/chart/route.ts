import { NextRequest } from "next/server";
import { fetchStockChart } from "@/lib/yahooFinanceApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const days = searchParams.get("days") ?? "7";

  if (!symbol) {
    return Response.json({ error: "Missing symbol" }, { status: 400 });
  }

  const data = await fetchStockChart(symbol, days);
  return Response.json(data);
}
