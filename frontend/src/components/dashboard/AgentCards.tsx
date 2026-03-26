"use client";
import { SentimentReport, TechnicalReport, FundamentalReport } from "@/types";

interface Props {
  sentiment: SentimentReport;
  technical: TechnicalReport;
  fundamental: FundamentalReport;
}

// ── helpers ────────────────────────────────────────────────────────────────

function rsiColor(rsi: number | null): string {
  if (rsi === null) return "#ffffff";
  if (rsi < 30) return "#4caf78";   // oversold → green opportunity
  if (rsi > 70) return "#ba1a1a";   // overbought → red warning
  return "#ffffff";
}

function trendColor(trend: string | null): string {
  if (trend === "BULLISH") return "#4caf78";
  if (trend === "BEARISH") return "#ba1a1a";
  return "#7dd3fc";
}

function regimeColor(label: string | null): string {
  if (label === "STABLE")  return "#4caf78";
  if (label === "BEARISH") return "#f59e0b";
  if (label === "PANIC")   return "#ba1a1a";
  return "#7dd3fc";
}

function bollingerColor(pos: string | null): string {
  if (pos === "OVERSOLD")   return "#4caf78";
  if (pos === "OVERBOUGHT") return "#ba1a1a";
  return "#94a3b8";
}

const ROW = "flex justify-between items-center mt-1.5 text-sm font-mono opacity-80";
const LABEL_STYLE = { fontFamily: '"DM Mono", monospace' };
const SERIF = { fontFamily: '"Playfair Display", serif' };
const SANS  = { fontFamily: '"DM Sans", sans-serif' };
const MONO  = { fontFamily: '"DM Mono", monospace' };

// ── component ──────────────────────────────────────────────────────────────

export function AgentCards({ sentiment, technical, fundamental }: Props) {

  // Sentiment colour
  const sentimentColor =
    sentiment.label === "positive" ? "#4caf78" :
    sentiment.label === "negative" ? "#ba1a1a" : "#7dd3fc";

  // Confidence — always a number when status is OK (even for NEUTRAL)
  const confidencePct = sentiment.confidence != null
    ? Math.round(sentiment.confidence * 100) + "%"
    : "N/A";

  // Fundamental colour
  const fundamentalColor =
    fundamental.valuation_signal === "UNDERVALUED" ? "#4caf78" :
    fundamental.valuation_signal === "OVERVALUED"  ? "#ba1a1a" : "#7dd3fc";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

      {/* ── Sentiment Card ─────────────────────────────────────────── */}
      <div className="bg-[#1E293B] p-6 rounded-[16px] text-white flex flex-col gap-4 shadow-lg">

        {/* header */}
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-60 uppercase" style={MONO}>Agent 01</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M20 18v3" /><path d="M16 15v6" /><path d="M12 11v10" /><path d="M8 8v13" /><path d="M8 9l3 3l5 -5l4 4" />
          </svg>
        </div>

        <h3 className="font-sans font-bold tracking-tight text-lg" style={SANS}>SENTIMENT</h3>

        <div className="mt-2">
          {/* main label */}
          <div className="text-3xl font-serif font-semibold truncate" style={{ color: sentimentColor, ...SERIF }}>
            {(sentiment.label ?? "N/A").toUpperCase()}
          </div>

          {/* confidence */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>Confidence</span>
            <span style={{ color: sentimentColor }}>{confidencePct}</span>
          </div>

          {/* sentiment score — shown as signed number, skip for null */}
          {sentiment.sentiment_score != null && (
            <div className={ROW} style={LABEL_STYLE}>
              <span>Signal Score</span>
              <span style={{ color: sentimentColor }}>
                {sentiment.sentiment_score > 0 ? "+" : ""}
                {sentiment.sentiment_score.toFixed(2)}
              </span>
            </div>
          )}

          {/* status pill */}
          <div className="mt-3">
            <span
              className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full uppercase"
              style={{
                ...MONO,
                background: sentiment.status === "OK" ? "rgba(76,175,120,0.15)" : "rgba(148,163,184,0.15)",
                color:      sentiment.status === "OK" ? "#4caf78" : "#94a3b8",
                border:     `1px solid ${sentiment.status === "OK" ? "#4caf78" : "#94a3b8"}`,
              }}
            >
              {sentiment.status === "OK" ? "Live" : "No Data"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Technical Card ─────────────────────────────────────────── */}
      <div className="bg-[#1E293B] p-6 rounded-[16px] text-white flex flex-col gap-4 shadow-lg">

        {/* header */}
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-60 uppercase" style={MONO}>Agent 02</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M20 18v3" /><path d="M16 15v6" /><path d="M12 11v10" /><path d="M8 8v13" /><path d="M8 9l3 3l5 -5l4 4" />
          </svg>
        </div>

        <h3 className="font-sans font-bold tracking-tight text-lg" style={SANS}>TECHNICAL</h3>

        <div className="mt-2">
          {/* RSI — big number with zone colouring */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs opacity-60 font-mono" style={MONO}>RSI</span>
            <span className="text-2xl font-serif font-semibold" style={{ color: rsiColor(technical.rsi), ...SERIF }}>
              {technical.rsi?.toFixed(1) ?? "N/A"}
            </span>
            {technical.rsi != null && (
              <span className="text-[10px] opacity-50" style={MONO}>
                {technical.rsi < 30 ? "oversold" : technical.rsi > 70 ? "overbought" : "neutral zone"}
              </span>
            )}
          </div>

          {/* Trend — NEW */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>Trend</span>
            <span style={{ color: trendColor(technical.trend), fontWeight: 600 }}>
              {technical.trend ?? "N/A"}
            </span>
          </div>

          {/* MACD */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>MACD</span>
            <span style={{ color: technical.macd_signal === "BUY" ? "#4caf78" : technical.macd_signal === "SELL" ? "#ba1a1a" : "#94a3b8" }}>
              {technical.macd_signal ?? "N/A"}
            </span>
          </div>

          {/* Bollinger — NEW (was hidden) */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>Bollinger</span>
            <span style={{ color: bollingerColor(technical.bollinger_position) }}>
              {technical.bollinger_position ?? "N/A"}
            </span>
          </div>

          {/* Regime — FIX: was showing 0/1/2, now shows STABLE/BEARISH/PANIC */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>Regime</span>
            <span style={{ color: regimeColor(technical.regime_label), fontWeight: 600 }}>
              {technical.regime_label ?? "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Fundamental Card ───────────────────────────────────────── */}
      <div className="bg-[#1E293B] p-6 rounded-[16px] text-white flex flex-col gap-4 shadow-lg">

        {/* header */}
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-60 uppercase" style={MONO}>Agent 03</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21h18" /><path d="M5 21v-14l8 -4v18" /><path d="M19 21v-10l-6 -4" /><path d="M9 9l0 .01" /><path d="M9 12l0 .01" /><path d="M9 15l0 .01" /><path d="M9 18l0 .01" />
          </svg>
        </div>

        <h3 className="font-sans font-bold tracking-tight text-lg" style={SANS}>FUNDAMENTAL</h3>

        <div className="mt-2">
          {/* main label */}
          <div className="text-3xl font-serif font-semibold truncate" style={{ color: fundamentalColor, ...SERIF }}>
            {fundamental.valuation_signal ?? "N/A"}
          </div>

          {/* reasoning — NEW: 1-line muted subtitle */}
          {fundamental.reasoning && (
            <p
              className="mt-1.5 text-[11px] opacity-50 leading-snug"
              style={{ ...MONO, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {fundamental.reasoning}
            </p>
          )}

          {/* PE Ratio */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>PE Ratio</span>
            <span>{fundamental.pe_ratio?.toFixed(2) ?? "N/A"}</span>
          </div>

          {/* Margins */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>Margins</span>
            <span>
              {fundamental.profit_margins != null
                ? (fundamental.profit_margins * 100).toFixed(1) + "%"
                : "N/A"}
            </span>
          </div>

          {/* Confidence — NEW */}
          <div className={ROW} style={LABEL_STYLE}>
            <span>Confidence</span>
            <span style={{ color: fundamentalColor }}>
              {fundamental.confidence != null
                ? Math.round(fundamental.confidence * 100) + "%"
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
