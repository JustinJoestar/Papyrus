import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coinId = searchParams.get("coinId");
  const days = searchParams.get("days") ?? "7";

  if (!coinId) {
    return Response.json({ error: "Missing coinId" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return Response.json({ error: "Failed to fetch chart data" }, { status: 502 });
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch chart data" }, { status: 502 });
  }
}
