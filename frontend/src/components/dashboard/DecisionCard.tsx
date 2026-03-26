"use client";
import { PortfolioReport, RiskReport } from "@/types";

interface Props {
  portfolioReport: PortfolioReport;
  riskReport: RiskReport;
  liaisonHeadline: string | null;
}

const MONO  = { fontFamily: '"DM Mono", monospace' };
const SERIF = { fontFamily: '"Playfair Display", serif' };

// Per-agent row showing weight bar + contribution + status
function AgentWeightRow({
  label,
  weight,
  contribution,
  status,
}: {
  label: string;
  weight: number | null;
  contribution: number | null;
  status: string | null;
}) {
  const isNull   = status === "NULL" || weight === null;
  const pct      = isNull ? 0 : Math.round((weight ?? 0) * 100);
  const contrib  = contribution ?? 0;
  const positive = contrib >= 0;

  const barColor = isNull
    ? "#334155"
    : positive
    ? "#4caf78"
    : "#ba1a1a";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center" style={MONO}>
        <span className="text-[11px] uppercase tracking-widest opacity-60">{label}</span>
        <div className="flex items-center gap-2">
          {isNull ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "rgba(148,163,184,0.15)", color: "#94a3b8" }}
            >
              N/A
            </span>
          ) : (
            <span
              className="text-[11px] font-bold"
              style={{ color: positive ? "#4caf78" : "#ba1a1a" }}
            >
              {positive ? "+" : ""}{contrib.toFixed(3)}
            </span>
          )}
          <span className="text-[11px] font-bold opacity-70" style={{ minWidth: "3ch", textAlign: "right" }}>
            {isNull ? "—" : `${pct}%`}
          </span>
        </div>
      </div>
      {/* weight bar */}
      <div className="h-1 rounded-full w-full" style={{ background: "#1e293b" }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

export function DecisionCard({ portfolioReport, riskReport, liaisonHeadline }: Props) {
  const decision = riskReport.approved === false
    ? "BLOCKED"
    : (portfolioReport.decision ?? "HOLD");

  const isBuy      = decision === "BUY";
  const isBlocked  = decision === "BLOCKED";
  const isPartial  = portfolioReport.status === "PARTIAL";
  const color      = isBuy ? "#4caf78" : isBlocked ? "#ba1a1a" : "#082f49";

  const score  = portfolioReport.decision_score?.toFixed(2) ?? "—";
  const conf   = portfolioReport.confidence
    ? `${Math.round(portfolioReport.confidence * 100)}%`
    : "—";
  const regime = portfolioReport.regime_label ?? "—";

  // Agent weights
  const w  = portfolioReport.weights;
  const c  = portfolioReport.contributions;
  const as = portfolioReport.agent_statuses;

  return (
    <div className="bg-white p-8 rounded-xl decision-card-shadow border border-white/20 relative overflow-hidden max-w-5xl mx-auto flex flex-col gap-6">
      {/* Left Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: color }} />

      {/* PARTIAL warning banner */}
      {isPartial && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-4"
          style={{ background: "rgba(245,158,11,0.1)", borderLeft: "3px solid #f59e0b" }}
        >
          {/* warning icon — Tabler outline */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.871l-8.106 -13.534a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" />
          </svg>
          <span style={{ ...MONO, color: "#f59e0b", fontSize: "11px" }}>
            PARTIAL DATA — one or more agents unavailable. Weights redistributed. Confidence reduced.
          </span>
        </div>
      )}

      {/* Main body — two columns */}
      <div className="flex flex-col md:flex-row gap-8 pl-4">

        {/* Left Column — decision + headline */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 font-mono text-xs font-bold rounded-full"
              style={{ backgroundColor: `${color}1A`, color, ...MONO }}
            >
              FINAL VERDICT
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/>
            </svg>
          </div>

          <div className="text-[56px] leading-tight font-serif font-semibold mb-4" style={{ color: "#001a2c", ...SERIF }}>
            {decision}
          </div>

          <p className="text-xl font-serif italic max-w-xl" style={{ color: "#42474d", ...SERIF }}>
            "{liaisonHeadline ?? portfolioReport.reasoning ?? "Analysis complete and fully resolved."}"
          </p>
        </div>

        {/* Right Column — scores + regime */}
        <div className="flex flex-col justify-center items-end gap-6 min-w-[220px] border-l border-[#c2c7ce]/40 pl-8">
          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(0,26,44,0.5)", ...MONO }}>Confidence</div>
            <div className="text-3xl font-mono font-bold" style={{ color: "#001a2c", ...MONO }}>{conf}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(0,26,44,0.5)", ...MONO }}>Signal Score</div>
            <div className="text-3xl font-mono font-bold" style={{ color: "#001a2c", ...MONO }}>{score}</div>
          </div>
          <div className="px-4 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: "#d9ebf7" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#7dd3fc" }} />
            <span className="font-mono text-xs font-bold" style={{ color: "#001a2c", ...MONO }}>REGIME: {regime}</span>
          </div>
        </div>
      </div>

      {/* Agent Weight Breakdown */}
      {w && (
        <div className="ml-4 mt-2 border-t border-[#e2e8f0] pt-5">
          <div className="flex items-center gap-2 mb-4">
            {/* chart icon — Tabler outline */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3v18h18" /><path d="M9 9l0 9" /><path d="M13 6l0 12" /><path d="M17 12l0 6" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color: "#94a3b8", ...MONO }}>
              Agent Contributions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AgentWeightRow
              label="Sentiment"
              weight={w.w1_sentiment}
              contribution={c?.sentiment_contribution ?? null}
              status={as?.sentiment ?? null}
            />
            <AgentWeightRow
              label="Technical"
              weight={w.w2_technical}
              contribution={c?.technical_contribution ?? null}
              status={as?.technical ?? null}
            />
            <AgentWeightRow
              label="Fundamental"
              weight={w.w3_fundamental}
              contribution={c?.fundamental_contribution ?? null}
              status={as?.fundamental ?? null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
