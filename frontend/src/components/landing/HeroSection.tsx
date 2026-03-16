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
      {/* Gradient mesh background — Finta style white dome */}
      <div className="absolute inset-0 -z-10" style={{
        background: `
          radial-gradient(ellipse 80% 65% at 50% -10%, #ffffff 0%, #ffffff 35%, transparent 70%),
          radial-gradient(ellipse 100% 100% at 50% 0%, #E0F2FE 0%, #E0F2FE 50%, #bfdbfe 100%)
        `
      }} />

      {/* Announcement badge */}
      <div className="animate-fade-up delay-100 mb-8 px-4 py-2 rounded-full font-mono text-[11px] tracking-[0.06em] cursor-pointer transition-colors"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid #CBD5E1",
          color: "#0F172A",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "#082F49")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "#CBD5E1")}>
        NSE markets covered — Nifty 50 fully supported &nbsp;→
      </div>

      {/* Headline */}
      {/* Headline */}
      <h1 className="animate-fade-up delay-200 font-display text-center leading-[1.1] tracking-[-0.02em] mb-5"
        style={{ fontSize: "clamp(40px, 7vw, 72px)", color: "#020617" }}>
        AI stock analysis for
        <br />
        <em className="not-italic" style={{ color: "#082F49" }}>Indian markets.</em>
      </h1>

      {/* Decorative dots */}
      {/* <div className="animate-fade-up delay-200 flex gap-[6px] mb-8">
        {[false, false, true, false, true, false, false, false].map((big, i) => (
          <span key={i} className="rounded-full"
            style={{
              width: big ? "8px" : "6px",
              height: big ? "8px" : "6px",
              background: big ? "#082F49" : "rgba(8,47,73,0.25)",
            }} />
        ))}
      </div> */}

      {/* Subheadline */}
      <p className="animate-fade-up delay-300 font-mono text-[13px] tracking-[0.04em] text-center mb-10"
        style={{ color: "#64748B", maxWidth: "460px", lineHeight: "1.7" }}>
        Six specialized AI agents. Live market data. Personalized to your risk profile.
      </p>

      {/* Demo card */}
      <div className="animate-fade-up delay-400 w-full max-w-[560px] rounded-[18px] p-7"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid #CBD5E1",
          boxShadow: "0 4px 32px rgba(8,47,73,0.08)",
        }}>

        <p className="font-mono text-[10px] tracking-[0.12em] uppercase mb-2"
          style={{ color: "#64748B" }}>
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
            background: "#F0F9FF",
            border: "1px solid #BAE6FD",
          }}>
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase mb-2"
            style={{ color: "#64748B" }}>
            Sample Output
          </p>
          <p className="font-display italic text-[28px] font-light mb-1"
            style={{ color: "#082F49" }}>
            HOLD
          </p>
          <p className="font-display italic text-[12px] leading-relaxed"
            style={{ color: "#475569" }}>
            &quot;Infosys is trading below fair value. Waiting for price momentum to confirm before entering.&quot;
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onAnalyze}
            className="flex-1 h-10 font-mono text-[11px] tracking-[0.08em] uppercase rounded transition-opacity hover:opacity-85"
            style={{ background: "#082F49", color: "#ffffff" }}>
            Run Live Analysis
          </button>
          <button
            className="flex-1 h-10 font-mono text-[11px] tracking-[0.08em] uppercase rounded transition-colors"
            style={{
              background: "transparent",
              color: "#082F49",
              border: "1px solid #CBD5E1",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F0F9FF")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            Learn More
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="animate-fade-up delay-500 mt-8 flex flex-col items-center gap-1">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase"
          style={{ color: "rgba(8,47,73,0.3)" }}>Scroll</span>
        <span style={{ color: "rgba(8,47,73,0.3)", fontSize: "14px" }}>↓</span>
      </div>

      {/* Disclaimer */}
      <p className="absolute bottom-5 font-mono text-[10px] tracking-[0.04em]"
        style={{ color: "rgba(8,47,73,0.3)" }}>
        For educational purposes only. Not financial advice.
      </p>
    </main>
  );
}
