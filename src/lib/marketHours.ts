// US equity market hours: 9:30 AM – 4:00 PM Eastern, Monday–Friday.
// Deliberately ignores exchange holidays — this only drives an
// informational "outside regular hours" notice, never trade gating
// (Papyrus fills 24/7 at the last price).

export function isUsMarketOpen(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;

  // hour12:false can yield "24" for midnight; normalize.
  const minutes = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}
