"use client";
import { PortfolioReport, RiskReport } from "@/types";

interface Props {
  portfolioReport: PortfolioReport;
  riskReport: RiskReport;
  liaisonHeadline: string | null;
}

export function DecisionCard({ portfolioReport, riskReport, liaisonHeadline }: Props) {
  const decision = riskReport.approved === false
    ? "BLOCKED"
    : (portfolioReport.decision ?? "HOLD");

  const isBuy = decision === "BUY";
  const isBlocked = decision === "BLOCKED";
  const color = isBuy ? "#4caf78" : isBlocked ? "#ba1a1a" : "#082f49";

  const score    = portfolioReport.decision_score?.toFixed(2) ?? "—";
  const conf     = portfolioReport.confidence
    ? `${Math.round(portfolioReport.confidence * 100)}%`
    : "—";
  const regime   = portfolioReport.regime_label ?? "—";

  return (
    <div className="bg-white p-8 rounded-xl decision-card-shadow border border-white/20 relative overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: color }}></div>
      
      {/* Left Column */}
      <div className="flex-grow pl-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 font-mono text-xs font-bold rounded-full" style={{ backgroundColor: `${color}1A`, color: color, fontFamily: '"DM Mono", monospace' }}>
            FINAL VERDICT
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg>
        </div>
        <div className="text-[56px] leading-tight font-serif font-semibold mb-4" style={{ color: "#001a2c", fontFamily: '"Playfair Display", serif' }}>
          {decision}
        </div>
        <p className="text-xl font-serif italic max-w-xl" style={{ color: "#42474d", fontFamily: '"Playfair Display", serif' }}>
          "{liaisonHeadline ?? portfolioReport.reasoning ?? "Analysis complete and fully resolved."}"
        </p>
      </div>

      {/* Right Column */}
      <div className="flex flex-col justify-center items-end gap-6 min-w-[240px] border-l border-[#c2c7ce]/40 pl-8">
        <div className="text-right">
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(0, 26, 44, 0.5)", fontFamily: '"DM Mono", monospace' }}>Confidence</div>
          <div className="text-3xl font-mono font-bold" style={{ color: "#001a2c", fontFamily: '"DM Mono", monospace' }}>{conf}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(0, 26, 44, 0.5)", fontFamily: '"DM Mono", monospace' }}>Signal Score</div>
          <div className="text-3xl font-mono font-bold" style={{ color: "#001a2c", fontFamily: '"DM Mono", monospace' }}>{score}</div>
        </div>
        <div className="px-4 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: "#d9ebf7" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#7dd3fc" }}></span>
          <span className="font-mono text-xs font-bold" style={{ color: "#001a2c", fontFamily: '"DM Mono", monospace' }}>REGIME: {regime}</span>
        </div>
      </div>
    </div>
  );
}
