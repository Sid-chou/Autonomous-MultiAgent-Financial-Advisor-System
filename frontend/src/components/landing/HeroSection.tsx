"use client";
import { useState, useEffect, useRef } from "react";
import { TickerInput } from "./TickerInput";

/* ── Rotating tickers shown in the placeholder ── */
const PLACEHOLDERS = ["INFY", "TCS", "ZOMATO", "RELIANCE", "HDFC", "WIPRO"];

interface HeroSectionProps {
  ticker: string;
  onTickerChange: (v: string) => void;
  budget: number;
  onBudgetChange: (b: number) => void;
  riskLevel: string;
  onRiskLevelChange: (r: string) => void;
  onAnalyze: () => void;
  error: string | null;
}

export function HeroSection({
  ticker, onTickerChange,
  budget, onBudgetChange,
  riskLevel, onRiskLevelChange,
  onAnalyze, error
}: HeroSectionProps) {
  /* ── animated placeholder state ── */
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = PLACEHOLDERS[placeholderIdx];

    if (!isDeleting && displayed.length < current.length) {
      // typing
      timeoutRef.current = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length + 1));
      }, 100);
    } else if (!isDeleting && displayed.length === current.length) {
      // pause then start deleting
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && displayed.length > 0) {
      // deleting
      timeoutRef.current = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length - 1));
      }, 55);
    } else if (isDeleting && displayed.length === 0) {
      // move to next ticker
      setIsDeleting(false);
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayed, isDeleting, placeholderIdx]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-[100px] overflow-hidden">

      {/* Global gradient moved to page.tsx */}

      {/* Announcement badge */}
      <div
        className="animate-fade-up delay-100 mb-8 px-4 py-1 rounded-full font-mono text-[11px] tracking-[0.06em] cursor-pointer transition-colors"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid #CBD5E1",
          color: "#0F172A",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#082F49")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
      >
        NSE markets covered — Nifty 50 fully supported &nbsp;→
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up delay-200 font-medium mt-10 text-7xl text-black tracking-tighter text-center">
        AI stock analysis for
        <br />
        <em className="not-italic">Indian markets.</em>
      </h1>

      {/* Subheadline */}
      <p
        className="animate-fade-up delay-300 font-mono text-[13px] tracking-[0.04em] text-center mb-10"
        style={{ color: "#64748B", maxWidth: "460px", lineHeight: "1.7" }}
      >
        Six specialized AI agents. Live market data. Personalized to your risk profile.
      </p>

      {/* ── Animated Search Bar ── */}
      <div
        className="animate-fade-up delay-400 flex flex-col items-center gap-4 w-full"
        style={{ maxWidth: "440px" }}
      >
        {/* Gradient-border pill wrapper */}
        <div
          style={{
            width: "100%",
            padding: "2px",
            borderRadius: "999px",
            background:
              "linear-gradient(135deg, #c7d2fe 0%, #bfdbfe 50%, #e0f2fe 100%)",
            boxShadow: "0 4px 24px rgba(8,47,73,0.10)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.92)",
              borderRadius: "999px",
              padding: "0 20px",
              height: "52px",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Search icon (Tabler-style outline) */}
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginRight: "10px" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            {/* Input */}
            <input
              id="hero-search"
              type="text"
              value={ticker}
              onChange={(e) => onTickerChange(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
              placeholder={displayed + "█"}
              autoComplete="off"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "14px",
                letterSpacing: "0.08em",
                color: "#0F172A",
                caretColor: "#3B82F6",
                fontFamily: "monospace",
              }}
            />

            {/* Clear button */}
            {ticker && (
              <button
                onClick={() => onTickerChange("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                  fontSize: "18px",
                  lineHeight: 1,
                  padding: "0 4px",
                }}
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Error hint */}
        {error && (
          <p
            style={{
              color: "#EF4444",
              fontSize: "11px",
              fontFamily: "monospace",
              letterSpacing: "0.04em",
            }}
          >
            {error}
          </p>
        )}

        {/* ── Risk Profile Inputs ── */}
        <div className="flex flex-col items-stretch gap-3 w-full mt-2 mb-4">
          {/* Budget Input */}
          <div
            className="w-full flex items-center bg-white/60 backdrop-blur-md rounded-full px-4 h-[46px]"
            style={{ border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 10px rgba(8,47,73,0.05)" }}
          >
            <span className="text-[#64748B] text-sm font-medium mr-2">₹</span>
            <input
              type="number"
              value={budget || ""}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              placeholder="100000"
              className="flex-1 bg-transparent border-none outline-none text-[#0F172A] text-sm"
              style={{ fontFamily: "'DM Mono', monospace" }}
            />
            <span className="text-[#94A3B8] text-xs font-medium ml-2 uppercase tracking-wider">Budget</span>
          </div>

          {/* Risk Level Selector */}
          <div
            className="w-full flex items-center bg-white/60 backdrop-blur-md rounded-full p-1 h-[46px]"
            style={{ border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 10px rgba(8,47,73,0.05)" }}
          >
            {["Conservative", "Moderate", "Aggressive"].map((level) => (
              <button
                key={level}
                onClick={() => onRiskLevelChange(level)}
                className={`flex-1 flex items-center justify-center rounded-full h-full text-xs font-medium transition-all ${
                  riskLevel === level
                    ? "bg-[#0F172A] text-white shadow-md"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/40"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* ── Analyse Button ── */}
        <button
          id="hero-analyse-btn"
          onClick={onAnalyze}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 28px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "0.08em",
            fontFamily: "Zodiak",
            boxShadow: "0 4px 16px rgba(37,99,235,0.30)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 6px 22px rgba(37,99,235,0.42)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 4px 16px rgba(37,99,235,0.30)";
          }}
        >
          {/* Search icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          ANALYSE STOCK
        </button>
      </div>
      {/* ── End Search Bar ── */}

      {/* ─────────────────────────────────────────────────────────────────
          HERO CARD — COMMENTED OUT
          The original demo card with TickerInput and sample output preview.
          Preserved below for reference / easy re-enable.
      ──────────────────────────────────────────────────────────────────── */}
      {/*
      <div
        className="animate-fade-up delay-400 w-full max-w-[560px] rounded-[18px] p-7"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid #CBD5E1",
          boxShadow: "0 4px 32px rgba(8,47,73,0.08)",
        }}
      >
        <p
          className="font-mono text-[10px] tracking-[0.12em] uppercase mb-2"
          style={{ color: "#64748B" }}
        >
          Enter NSE Ticker
        </p>

        <TickerInput
          value={ticker}
          onChange={onTickerChange}
          onAnalyze={onAnalyze}
          error={error}
        />

        <div
          className="mt-4 p-4 rounded-[10px]"
          style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}
        >
          <p
            className="font-mono text-[10px] tracking-[0.1em] uppercase mb-2"
            style={{ color: "#64748B" }}
          >
            Sample Output
          </p>
          <p
            className="font-display italic text-[28px] font-light mb-1"
            style={{ color: "#082F49" }}
          >
            HOLD
          </p>
          <p
            className="font-display italic text-[12px] leading-relaxed"
            style={{ color: "#475569" }}
          >
            &quot;Infosys is trading below fair value. Waiting for price momentum
            to confirm before entering.&quot;
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onAnalyze}
            className="flex-1 h-10 font-mono text-[11px] tracking-[0.08em] uppercase rounded transition-opacity hover:opacity-85"
            style={{ background: "#082F49", color: "#ffffff" }}
          >
            Run Live Analysis
          </button>
          <button
            className="flex-1 h-10 font-mono text-[11px] tracking-[0.08em] uppercase rounded transition-colors"
            style={{
              background: "transparent",
              color: "#082F49",
              border: "1px solid #CBD5E1",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#F0F9FF")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Learn More
          </button>
        </div>
      </div>
      */}

      {/* Scroll hint */}
      <div className="animate-fade-up delay-500 mt-12 flex flex-col items-center gap-1">
        <span
          className="font-mono text-[10px] tracking-[0.15em] uppercase"
          style={{ color: "rgba(8,47,73,0.3)" }}
        >
          Scroll
        </span>
        <span style={{ color: "rgba(8,47,73,0.3)", fontSize: "14px" }}>↓</span>
      </div>

      {/* Disclaimer */}
      <p
        className="absolute bottom-5 font-mono text-[10px] tracking-[0.04em]"
        style={{ color: "rgba(8,47,73,0.3)" }}
      >
        For educational purposes only. Not financial advice.
      </p>
    </main>
  );
}
