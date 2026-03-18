"use client";
import { AnalysisResponse } from "@/types";

interface Props { result: AnalysisResponse; }

export function PipelineStatus({ result }: Props) {
  const agents = [
    { label: "Sentiment",   status: result.sentimentReport.status },
    { label: "Technical",   status: result.technicalReport.status },
    { label: "Fundamental", status: result.fundamentalReport.status },
    { label: "Portfolio",   status: result.portfolioReport.status },
    { label: "Risk",        status: result.riskReport.status },
  ];

  return (
    <div className="flex justify-center gap-5 py-2">
      {agents.map(a => (
        <div key={a.label} className="flex items-center gap-2">
          <span className="w-[5px] h-[5px] rounded-full"
            style={{ background: a.status === "OK" ? "#4caf78" : a.status === "NULL" ? "#e05c5c" : "#e0b84c" }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em]"
            style={{ color: "rgba(125,211,252,0.38)" }}>
            {a.label}
          </span>
        </div>
      ))}
    </div>
  );
}
