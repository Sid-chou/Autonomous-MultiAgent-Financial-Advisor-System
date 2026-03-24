"use client";
import { SentimentReport, TechnicalReport, FundamentalReport } from "@/types";

interface Props {
  sentiment: SentimentReport;
  technical: TechnicalReport;
  fundamental: FundamentalReport;
}

export function AgentCards({ sentiment, technical, fundamental }: Props) {
  const sentimentColor =
    sentiment.label === "positive" ? "#4caf78" :
    sentiment.label === "negative" ? "#ba1a1a" : "#7dd3fc";

  const fundamentalColor =
    fundamental.valuation_signal === "UNDERVALUED" ? "#4caf78" :
    fundamental.valuation_signal === "OVERVALUED"  ? "#ba1a1a" : "#7dd3fc";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
      
      {/* Sentiment Card */}
      <div className="bg-[#1E293B] p-6 rounded-[16px] text-white flex flex-col gap-4 shadow-lg">
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-60 uppercase" style={{ fontFamily: '"DM Mono", monospace' }}>Agent 01</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M20 18v3" /><path d="M16 15v6" /><path d="M12 11v10" /><path d="M8 8v13" /><path d="M8 9l3 3l5 -5l4 4" /></svg>
        </div>
        <h3 className="font-sans font-bold tracking-tight text-lg" style={{ fontFamily: '"DM Sans", sans-serif' }}>SENTIMENT</h3>
        <div className="mt-2">
          <div className="text-3xl font-serif font-semibold truncate" style={{ color: sentimentColor, fontFamily: '"Playfair Display", serif' }}>
            {(sentiment.label ?? "NEUTRAL").toUpperCase()}
          </div>
          <div className="flex justify-between mt-4 text-sm font-mono opacity-80" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>Confidence</span>
            <span>{sentiment.confidence ? Math.round(sentiment.confidence * 100) + "%" : "N/A"}</span>
          </div>
          <div className="flex justify-between mt-1 text-sm font-mono opacity-80" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>Score</span>
            <span>{sentiment.sentiment_score?.toFixed(2) ?? "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Technical Card */}
      <div className="bg-[#1E293B] p-6 rounded-[16px] text-white flex flex-col gap-4 shadow-lg">
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-60 uppercase" style={{ fontFamily: '"DM Mono", monospace' }}>Agent 02</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M20 18v3" /><path d="M16 15v6" /><path d="M12 11v10" /><path d="M8 8v13" /><path d="M8 9l3 3l5 -5l4 4" /></svg>
        </div>
        <h3 className="font-sans font-bold tracking-tight text-lg" style={{ fontFamily: '"DM Sans", sans-serif' }}>TECHNICAL</h3>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs opacity-60 font-mono" style={{ fontFamily: '"DM Mono", monospace' }}>RSI</span>
            <span className="text-2xl font-serif font-semibold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
              {technical.rsi?.toFixed(1) ?? "N/A"}
            </span>
          </div>
          <div className="flex justify-between mt-4 text-sm font-mono opacity-80" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>MACD</span>
            <span className={technical.macd_signal === "SELL" ? "text-red-400" : "text-green-400"}>
              {technical.macd_signal ?? "N/A"}
            </span>
          </div>
          <div className="flex justify-between mt-1 text-sm font-mono opacity-80" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>Regime</span>
            <span className="text-[#7dd3fc]">
              {technical.regime_flag ?? "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Fundamental Card */}
      <div className="bg-[#1E293B] p-6 rounded-[16px] text-white flex flex-col gap-4 shadow-lg">
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] tracking-[0.2em] opacity-60 uppercase" style={{ fontFamily: '"DM Mono", monospace' }}>Agent 03</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21h18" /><path d="M5 21v-14l8 -4v18" /><path d="M19 21v-10l-6 -4" /><path d="M9 9l0 .01" /><path d="M9 12l0 .01" /><path d="M9 15l0 .01" /><path d="M9 18l0 .01" /></svg>
        </div>
        <h3 className="font-sans font-bold tracking-tight text-lg" style={{ fontFamily: '"DM Sans", sans-serif' }}>FUNDAMENTAL</h3>
        <div className="mt-2">
          <div className="text-3xl font-serif font-semibold truncate" style={{ color: fundamentalColor, fontFamily: '"Playfair Display", serif' }}>
            {fundamental.valuation_signal ?? "N/A"}
          </div>
          <div className="flex justify-between mt-4 text-sm font-mono opacity-80" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>PE Ratio</span>
            <span>{fundamental.pe_ratio?.toFixed(2) ?? "N/A"}</span>
          </div>
          <div className="flex justify-between mt-1 text-sm font-mono opacity-80" style={{ fontFamily: '"DM Mono", monospace' }}>
            <span>Margins</span>
            <span>{fundamental.profit_margins ? (fundamental.profit_margins * 100).toFixed(1) + "%" : "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
