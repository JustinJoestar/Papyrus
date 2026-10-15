import { ImageResponse } from "next/og";

export const alt = "Papyrus — Learn to Invest, Risk-Free";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "radial-gradient(ellipse 80% 70% at 50% 120%, #2a2106 0%, #0e0d0a 60%)",
          color: "#f4ecd8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "30px",
            letterSpacing: "0.28em",
            color: "#c9a24e",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "999px",
              border: "2px solid #c9a24e",
              color: "#c9a24e",
              fontSize: "30px",
            }}
          >
            P
          </div>
          PAPYRUS
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "48px",
            fontSize: "84px",
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          <span>Trade everything.</span>
          <span style={{ color: "#ebcb7e" }}>Risk nothing.</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "40px",
            fontSize: "34px",
            color: "#a89e88",
            maxWidth: "900px",
          }}
        >
          Learn to invest with $10,000 in virtual cash. Real stocks, crypto, and commodities at
          live prices.
        </div>
      </div>
    ),
    { ...size }
  );
}
