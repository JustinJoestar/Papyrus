"use client";

const TICKER_ASSETS = [
  // Crypto
  { symbol: "BTC",   name: "Bitcoin",   img: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { symbol: "ETH",   name: "Ethereum",  img: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { symbol: "SOL",   name: "Solana",    img: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { symbol: "BNB",   name: "BNB",       img: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { symbol: "XRP",   name: "XRP",       img: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  { symbol: "DOGE",  name: "Dogecoin",  img: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
  { symbol: "ADA",   name: "Cardano",   img: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
  { symbol: "AVAX",  name: "Avalanche", img: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
  { symbol: "LINK",  name: "Chainlink", img: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
  { symbol: "DOT",   name: "Polkadot",  img: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png" },
  // Stocks
  { symbol: "AAPL",  name: "Apple",     img: "https://images.financialmodelingprep.com/symbol/AAPL.png" },
  { symbol: "NVDA",  name: "NVIDIA",    img: "https://images.financialmodelingprep.com/symbol/NVDA.png" },
  { symbol: "MSFT",  name: "Microsoft", img: "https://images.financialmodelingprep.com/symbol/MSFT.png" },
  { symbol: "TSLA",  name: "Tesla",     img: "https://images.financialmodelingprep.com/symbol/TSLA.png" },
  { symbol: "META",  name: "Meta",      img: "https://images.financialmodelingprep.com/symbol/META.png" },
  { symbol: "AMZN",  name: "Amazon",    img: "https://images.financialmodelingprep.com/symbol/AMZN.png" },
  { symbol: "GOOGL", name: "Alphabet",  img: "https://images.financialmodelingprep.com/symbol/GOOGL.png" },
  { symbol: "NFLX",  name: "Netflix",   img: "https://images.financialmodelingprep.com/symbol/NFLX.png" },
  { symbol: "AMD",   name: "AMD",       img: "https://images.financialmodelingprep.com/symbol/AMD.png" },
  { symbol: "JPM",   name: "JPMorgan",  img: "https://images.financialmodelingprep.com/symbol/JPM.png" },
];

// Duplicate for seamless infinite loop
const ITEMS = [...TICKER_ASSETS, ...TICKER_ASSETS];

/**
 * Ticker tape — a strip of paper punched with sprocket holes,
 * running the market's names across the page.
 */
export default function AssetTicker() {
  return (
    <div
      className="relative w-full overflow-hidden border-y"
      style={{ borderColor: "var(--border-mid)", background: "var(--ticker-bg)" }}
    >
      {/* Sprocket holes — top + bottom rows, like real ticker tape */}
      <div
        aria-hidden
        className="absolute top-[5px] inset-x-0 h-[3px] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--border-bright) 1.1px, transparent 1.2px)",
          backgroundSize: "22px 3px",
          opacity: 0.7,
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-[5px] inset-x-0 h-[3px] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--border-bright) 1.1px, transparent 1.2px)",
          backgroundSize: "22px 3px",
          opacity: 0.7,
        }}
      />

      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, var(--base), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, var(--base), transparent)" }} />

      <div className="ticker-track items-center gap-8 py-4">
        {ITEMS.map((asset, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0 px-2">
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
            >
              <img
                src={asset.img}
                alt={asset.symbol}
                width={28}
                height={28}
                className="object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span
              className="font-mono text-xs font-semibold tracking-wide"
              style={{ color: "var(--text-1)" }}
            >
              {asset.symbol}
            </span>
            <span className="font-display italic text-xs" style={{ color: "var(--gold-dim)" }}>
              ·
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
