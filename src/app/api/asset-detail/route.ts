import { NextRequest, NextResponse } from "next/server";
import { getTopCoins } from "@/lib/market";
import { fetchQuote } from "@/lib/yahooFinanceApi";
import { TOP_COMMODITIES, YAHOO_SYMBOL_MAP } from "@/lib/commodities";
import { fetchQuote as fetchYahoo } from "@/lib/yahooFinanceApi";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type   = searchParams.get("type");
  const symbol = searchParams.get("symbol")?.toUpperCase() ?? "";
  const coinId = searchParams.get("coinId") ?? "";

  if (type === "crypto") {
    const coins = await getTopCoins();
    const coin  = coins.find((c) => c.id === coinId || c.symbol.toUpperCase() === symbol);
    if (!coin) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      name:        coin.name,
      symbol:      coin.symbol.toUpperCase(),
      image:       coin.image,
      price:       coin.current_price,
      change24h:   coin.price_change_percentage_24h,
      change7d:    coin.price_change_percentage_7d_in_currency,
      marketCap:   coin.market_cap,
      volume24h:   coin.total_volume,
      supply:      coin.circulating_supply,
      ath:         coin.ath,
      atl:         coin.atl,
    });
  }

  if (type === "stock") {
    const quote = await fetchQuote(symbol);
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      name:        quote.longName ?? symbol,
      symbol,
      price:       quote.regularMarketPrice,
      change24h:   quote.regularMarketChangePercent,
      volume24h:   quote.regularMarketVolume ?? 0,
      weekHigh52:  quote.fiftyTwoWeekHigh ?? 0,
      weekLow52:   quote.fiftyTwoWeekLow ?? 0,
      exchange:    quote.fullExchangeName ?? "",
    });
  }

  if (type === "commodity") {
    const meta        = TOP_COMMODITIES.find((c) => c.symbol === symbol);
    const yahooSymbol = YAHOO_SYMBOL_MAP[symbol];
    if (!meta || !yahooSymbol) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const quote = await fetchYahoo(yahooSymbol);
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      name:       meta.name,
      symbol,
      icon:       meta.icon,
      unit:       meta.unit,
      price:      quote.regularMarketPrice,
      change24h:  quote.regularMarketChangePercent,
      volume24h:  quote.regularMarketVolume ?? 0,
      weekHigh52: quote.fiftyTwoWeekHigh ?? 0,
      weekLow52:  quote.fiftyTwoWeekLow  ?? 0,
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
