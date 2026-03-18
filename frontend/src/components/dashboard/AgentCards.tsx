"use client";
import { SentimentReport, TechnicalReport, FundamentalReport } from "@/types";

function AgentCard({ name, status, primary, primaryColor, secondary }: {
  name: string;
  status: string;
  primary: string;
  primaryColor?: string;
  secondary: string[];
}) {
  return (
    <div className="rounded-[8px] p-5 transition-all duration-200"
      style={{ background: "#0F172A", border: "1px solid rgba(125,211,252,0.1)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(125,211,252,0.25)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(125,211,252,0.1)")}>

      <div className="flex justify-between items-center mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: "rgba(125,211,252,0.45)" }}>{name}</span>
        <span className="w-[6px] h-[6px] rounded-full"
          style={{ background: status === "OK" ? "#4caf78" : "#e05c5c" }} />
      </div>

      <p className="font-mono text-[26px] mb-3" style={{ color: primaryColor ?? "#E0F2FE" }}>
        {primary}
      </p>

      <div className="flex gap-3">
        {secondary.map((s, i) => (
          <span key={i} className="font-mono text-[11px]"
            style={{ color: "rgba(125,211,252,0.4)" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  sentiment: SentimentReport;
  technical: TechnicalReport;
  fundamental: FundamentalReport;
}

export function AgentCards({ sentiment, technical, fundamental }: Props) {
  const sentimentColor =
    sentiment.label === "positive" ? "#4caf78" :
    sentiment.label === "negative" ? "#e05c5c" : "rgba(125,211,252,0.65)";

  const fundamentalColor =
    fundamental.valuation_signal === "UNDERVALUED" ? "#4caf78" :
    fundamental.valuation_signal === "OVERVALUED"  ? "#e05c5c" : "rgba(125,211,252,0.65)";

  return (
    <div className="grid grid-cols-3 gap-3">
      <AgentCard
        name="Sentiment"
        status={sentiment.status}
        primary={(sentiment.label ?? "N/A").toUpperCase()}
        primaryColor={sentimentColor}
        secondary={[
          `Conf ${sentiment.confidence ? Math.round(sentiment.confidence * 100) + "%" : "N/A"}`,
          `Score ${sentiment.sentiment_score?.toFixed(2) ?? "N/A"}`,
        ]}
      />
      <AgentCard
        name="Technical"
        status={technical.status}
        primary={technical.rsi?.toFixed(1) ?? "N/A"}
        secondary={[
          `MACD ${technical.macd_signal ?? "N/A"}`,
          `Regime ${technical.regime_flag ?? "N/A"}`,
        ]}
      />
      <AgentCard
        name="Fundamental"
        status={fundamental.status}
        primary={fundamental.valuation_signal ?? "N/A"}
        primaryColor={fundamentalColor}
        secondary={[
          `PE ${fundamental.pe_ratio?.toFixed(2) ?? "N/A"}`,
          `Margin ${fundamental.profit_margins ? (fundamental.profit_margins * 100).toFixed(1) + "%" : "N/A"}`,
        ]}
      />
    </div>
  );
}
