"use client";
import { PortfolioReport, RiskReport } from "@/types";
import { DECISION_COLORS } from "@/lib/constants";

interface Props {
  portfolioReport: PortfolioReport;
  riskReport: RiskReport;
  liaisonHeadline: string | null;
}

export function DecisionCard({ portfolioReport, riskReport, liaisonHeadline }: Props) {
  const decision = riskReport.approved === false
    ? "BLOCKED"
    : (portfolioReport.decision ?? "HOLD");

  const color    = DECISION_COLORS[decision] ?? DECISION_COLORS["HOLD"];
  const score    = portfolioReport.decision_score?.toFixed(3) ?? "—";
  const conf     = portfolioReport.confidence
    ? `${Math.round(portfolioReport.confidence * 100)}%`
    : "—";
  const regime   = portfolioReport.regime_label ?? "—";

  return (
    <div className="w-full rounded-[10px] p-6 flex justify-between items-center"
      style={{
        background: "#0F172A",
        border: "1px solid rgba(125,211,252,0.1)",
        borderLeft: `4px solid ${color}`,
      }}>

      {/* Left */}
      <div>
        <p className="font-display text-[52px] font-light leading-none mb-3"
          style={{ color }}>
          {decision}
        </p>
        <p className="font-mono text-[12px] leading-relaxed max-w-sm"
          style={{ color: "rgba(224,242,254,0.5)" }}>
          {liaisonHeadline ?? portfolioReport.reasoning ?? "Analysis complete."}
        </p>
        <span className="inline-block mt-3 font-mono text-[10px] tracking-[0.08em] px-3 py-1 rounded-full"
          style={{
            border: `1px solid rgba(125,211,252,0.2)`,
            background: "rgba(125,211,252,0.05)",
            color: "#7DD3FC",
          }}>
          {regime} MARKET
        </span>
      </div>

      {/* Right */}
      <div className="flex gap-6 flex-shrink-0">
        <div className="text-right">
          <p className="font-mono text-[26px] text-alice">{conf}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] mt-1"
            style={{ color: "rgba(125,211,252,0.4)" }}>Confidence</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[26px] text-alice">{score}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] mt-1"
            style={{ color: "rgba(125,211,252,0.4)" }}>Score</p>
        </div>
      </div>
    </div>
  );
}
