"use client";
import { AnalysisResponse } from "@/types";
import { TICKER_TO_COMPANY } from "@/lib/constants";
import { DecisionCard }       from "./DecisionCard";
import { LiaisonExplanation } from "./LiaisonExplanation";
import { AgentCards }         from "./AgentCards";
import { DecisionBreakdown }  from "./DecisionBreakdown";
import { RiskCard }           from "./RiskCard";
import { PipelineStatus }     from "./PipelineStatus";

interface Props {
  result: AnalysisResponse;
  ticker: string;
  onReset: () => void;
}

export function Dashboard({ result, ticker, onReset }: Props) {
  const cleanTicker  = ticker.replace(".NS", "").replace(".BO", "").toUpperCase();
  const companyName  = TICKER_TO_COMPANY[cleanTicker] ?? cleanTicker;

  return (
    <div className="min-h-screen pt-[60px]" style={{ background: "#020617" }}>
      <div className="max-w-5xl mx-auto px-8 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-[22px] text-alice">{companyName}</span>
            <span className="font-mono text-[11px] px-2 py-1 rounded"
              style={{ background: "rgba(125,211,252,0.1)", color: "#7DD3FC", border: "1px solid rgba(125,211,252,0.2)" }}>
              {ticker.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onReset}
            className="font-mono text-[11px] tracking-[0.08em] uppercase px-4 py-2 rounded-full transition-colors"
            style={{ border: "1px solid rgba(125,211,252,0.2)", color: "#7DD3FC", background: "transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(125,211,252,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            New Analysis
          </button>
        </div>

        <DecisionCard
          portfolioReport={result.portfolioReport}
          riskReport={result.riskReport}
          liaisonHeadline={result.liaisonReport?.headline ?? null}
        />

        <LiaisonExplanation report={result.liaisonReport} />

        <AgentCards
          sentiment={result.sentimentReport}
          technical={result.technicalReport}
          fundamental={result.fundamentalReport}
        />

        <DecisionBreakdown report={result.portfolioReport} />

        <RiskCard report={result.riskReport} />

        <PipelineStatus result={result} />
      </div>
    </div>
  );
}
