import { NextRequest } from "next/server";
import { fetchStockChart } from "@/lib/yahooFinanceApi";
import { YAHOO_SYMBOL_MAP } from "@/lib/commodities";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const days = searchParams.get("days") ?? "7";

  if (!symbol) {
    return Response.json({ error: "Missing symbol" }, { status: 400 });
  }

  // Translate clean symbol (GOLD) to Yahoo Finance symbol (GC=F)
  const yahooSymbol = YAHOO_SYMBOL_MAP[symbol] ?? symbol;
  const data = await fetchStockChart(yahooSymbol, days);
  return Response.json(data);
}
