"use client";
import { TickerInput } from "./TickerInput";

interface HeroSectionProps {
  ticker: string;
  onTickerChange: (v: string) => void;
  onAnalyze: () => void;
  error: string | null;
}

export function HeroSection({ ticker, onTickerChange, onAnalyze, error }: HeroSectionProps) {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-[60px] overflow-hidden">

      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10" style={{
        background: `
          radial-gradient(ellipse 75% 60% at 10% 50%, #082F49 0%, transparent 60%),
          radial-gradient(ellipse 55% 75% at 88% 20%, #0F172A 0%, transparent 55%),
          radial-gradient(ellipse 65% 50% at 85% 85%, #082F49 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 60% 55%, rgba(125,211,252,0.06) 0%, transparent 50%),
          #020617
        `
      }} />

      {/* Announcement badge */}
      <div className="animate-fade-up delay-100 mb-8 px-4 py-2 rounded-full font-mono text-[11px] tracking-[0.06em] cursor-pointer transition-colors"
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(125, 211, 252, 0.2)",
          color: "#7DD3FC",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(125,211,252,0.45)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(125,211,252,0.2)")}>
        NSE markets covered — Nifty 50 fully supported &nbsp;→
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up delay-200 font-display text-center leading-[1.1] tracking-[-0.02em] text-alice mb-5"
        style={{ fontSize: "clamp(40px, 7vw, 72px)" }}>
        AI stock analysis for
        <br />
        <em className="text-frozen not-italic">Indian markets.</em>
      </h1>

      {/* Decorative dots */}
      <div className="animate-fade-up delay-200 flex gap-[6px] mb-8">
        {[false, false, true, false, true, false, false, false].map((big, i) => (
          <span key={i} className="rounded-full"
            style={{
              width: big ? "8px" : "6px",
              height: big ? "8px" : "6px",
              background: big ? "#7DD3FC" : "rgba(125,211,252,0.3)",
            }} />
        ))}
      </div>

      {/* Subheadline */}
      <p className="animate-fade-up delay-300 font-mono text-[13px] tracking-[0.04em] text-center mb-10"
        style={{ color: "rgba(224,242,254,0.6)", maxWidth: "460px", lineHeight: "1.7" }}>
        Six specialized AI agents. Live market data. Personalized to your risk profile.
      </p>

      {/* Demo card */}
      <div className="animate-fade-up delay-400 w-full max-w-[560px] rounded-[18px] p-7"
        style={{
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(125, 211, 252, 0.18)",
        }}>

        <p className="font-mono text-[10px] tracking-[0.12em] uppercase mb-2"
          style={{ color: "rgba(125,211,252,0.6)" }}>
          Enter NSE Ticker
        </p>

        <TickerInput
          value={ticker}
          onChange={onTickerChange}
          onAnalyze={onAnalyze}
          error={error}
        />

        {/* Sample output preview */}
        <div className="mt-4 p-4 rounded-[10px]"
          style={{
            background: "rgba(8, 47, 73, 0.4)",
            border: "1px solid rgba(125, 211, 252, 0.1)",
          }}>
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase mb-2"
            style={{ color: "rgba(125,211,252,0.5)" }}>
            Sample Output
          </p>
          <p className="font-display italic text-[28px] font-light mb-1"
            style={{ color: "#7DD3FC" }}>
            HOLD
          </p>
          <p className="font-display italic text-[12px] leading-relaxed"
            style={{ color: "rgba(224,242,254,0.55)" }}>
            &quot;Infosys is trading below fair value. Waiting for price momentum to confirm before entering.&quot;
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onAnalyze}
            className="flex-1 h-10 font-mono text-[11px] tracking-[0.08em] uppercase rounded transition-opacity hover:opacity-85"
            style={{ background: "#7DD3FC", color: "#020617" }}>
            Run Live Analysis
          </button>
          <button
            className="flex-1 h-10 font-mono text-[11px] tracking-[0.08em] uppercase rounded transition-colors"
            style={{
              background: "transparent",
              color: "#7DD3FC",
              border: "1px solid rgba(125,211,252,0.2)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(125,211,252,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            Learn More
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="animate-fade-up delay-500 mt-8 flex flex-col items-center gap-1">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase"
          style={{ color: "rgba(125,211,252,0.3)" }}>Scroll</span>
        <span style={{ color: "rgba(125,211,252,0.3)", fontSize: "14px" }}>↓</span>
      </div>

      {/* Disclaimer */}
      <p className="absolute bottom-5 font-mono text-[10px] tracking-[0.04em]"
        style={{ color: "rgba(125,211,252,0.25)" }}>
        For educational purposes only. Not financial advice.
      </p>
    </main>
  );
}
