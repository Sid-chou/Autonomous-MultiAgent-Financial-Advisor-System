"use client";
import { RiskReport } from "@/types";

interface Props { report: RiskReport; }

export function RiskCard({ report }: Props) {
  const chips = report.rules_checked ?? [];

  return (
    <div className="rounded-[8px] p-5" style={{ background: "#0F172A", border: "1px solid rgba(125,211,252,0.1)" }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] mb-4"
        style={{ color: "rgba(125,211,252,0.45)" }}>Risk Assessment</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {report.approved ? (
            <p className="font-mono text-[12px] mb-2" style={{ color: "#4caf78" }}>✓ Trade Approved</p>
          ) : (
            <p className="font-mono text-[12px] mb-2" style={{ color: "#e05c5c" }}>✗ Trade Blocked</p>
          )}
          {report.block_reason && (
            <p className="font-mono text-[11px] leading-relaxed" style={{ color: "rgba(224,92,92,0.7)" }}>
              {report.block_reason}
            </p>
          )}
          {report.approved && report.adjusted_amount != null && (
            <p className="font-mono text-[15px] mt-2 text-frozen">
              Suggested: ₹{report.adjusted_amount.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 content-start">
          {chips.map((chip, i) => {
            const isPass    = chip.includes("PASS");
            const isBlocked = chip.includes("BLOCKED");
            const isTriggered = chip.includes("TRIGGERED");
            return (
              <span key={i} className="font-mono text-[10px] px-2 py-1 rounded-full"
                style={{
                  border: isBlocked
                    ? "1px solid rgba(224,92,92,0.35)"
                    : isTriggered
                      ? "1px solid rgba(224,184,76,0.35)"
                      : isPass
                        ? "1px solid rgba(76,175,120,0.3)"
                        : "1px solid rgba(125,211,252,0.15)",
                  color: isBlocked
                    ? "#e05c5c"
                    : isTriggered
                      ? "#e0b84c"
                      : isPass
                        ? "#4caf78"
                        : "rgba(125,211,252,0.4)",
                }}>
                {chip.split(":")[0].trim()}
              </span>
            );
          })}
        </div>
      </div>

      {report.warnings?.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(125,211,252,0.08)" }}>
          {report.warnings.map((w, i) => (
            <p key={i} className="font-mono text-[11px] mb-1" style={{ color: "rgba(224,184,76,0.7)" }}>
              ⚠ {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
