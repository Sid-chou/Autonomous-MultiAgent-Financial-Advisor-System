"use client";
import { PortfolioReport } from "@/types";

interface Props { report: PortfolioReport; }

export function DecisionBreakdown({ report }: Props) {
  const w = report.weights;
  const c = report.contributions;
  if (!w || !c) return null;

  const rows = [
    { label: "Sentiment",    value: c.sentiment_contribution,   weight: w.w1_sentiment },
    { label: "Technical",    value: c.technical_contribution,   weight: w.w2_technical },
    { label: "Fundamental",  value: c.fundamental_contribution, weight: w.w3_fundamental },
  ];

  const finalScore = report.decision_score ?? 0;

  const Bar = ({ value }: { value: number }) => (
    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(125,211,252,0.08)" }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(Math.abs(value) * 100, 100)}%`,
          background: value < 0 ? "#e05c5c" : "#7DD3FC",
        }} />
    </div>
  );

  return (
    <div className="rounded-[8px] p-5" style={{ background: "#0F172A", border: "1px solid rgba(125,211,252,0.1)" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] mb-5"
        style={{ color: "rgba(125,211,252,0.45)" }}>Signal Breakdown</p>

      <div className="flex flex-col gap-3">
        {rows.map(r => (
          <div key={r.label} className="grid gap-2 items-center"
            style={{ gridTemplateColumns: "100px 1fr 50px 40px" }}>
            <span className="font-mono text-[11px]" style={{ color: "rgba(224,242,254,0.5)" }}>{r.label}</span>
            <Bar value={r.value} />
            <span className="font-mono text-[11px] text-right" style={{ color: "rgba(224,242,254,0.5)" }}>
              {r.value.toFixed(3)}
            </span>
            <span className="font-mono text-[10px] text-right" style={{ color: "rgba(125,211,252,0.35)" }}>
              {Math.round(r.weight * 100)}%
            </span>
          </div>
        ))}

        <hr style={{ border: "none", borderTop: "1px solid rgba(125,211,252,0.08)", margin: "4px 0" }} />

        <div className="grid gap-2 items-center"
          style={{ gridTemplateColumns: "100px 1fr 50px 40px" }}>
          <span className="font-mono text-[11px] text-alice">Final Score</span>
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(125,211,252,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(Math.abs(finalScore) * 100, 100)}%`, background: "#E0F2FE" }} />
          </div>
          <span className="font-mono text-[11px] text-right text-alice">{finalScore.toFixed(3)}</span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
