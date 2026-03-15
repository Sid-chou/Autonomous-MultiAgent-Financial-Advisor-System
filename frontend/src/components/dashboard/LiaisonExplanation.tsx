"use client";
import { LiaisonReport } from "@/types";

interface Props { report: LiaisonReport; }

export function LiaisonExplanation({ report }: Props) {
  if (!report.explanation) return null;
  return (
    <div style={{ borderLeft: "2px solid rgba(125,211,252,0.25)", paddingLeft: "16px" }}>
      <p className="font-display italic text-[16px] leading-[1.75]"
        style={{ color: "rgba(224,242,254,0.55)" }}>
        {report.explanation}
      </p>
      {report.risk_note && (
        <p className="font-mono text-[12px] mt-3" style={{ color: "rgba(125,211,252,0.5)" }}>
          {report.risk_note}
        </p>
      )}
      {report.data_quality_note && (
        <p className="font-mono text-[11px] mt-2" style={{ color: "rgba(224,184,76,0.6)" }}>
          ⚠ {report.data_quality_note}
        </p>
      )}
    </div>
  );
}
