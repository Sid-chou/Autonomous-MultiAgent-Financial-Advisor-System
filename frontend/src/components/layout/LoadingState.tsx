"use client";
import { LOADING_STEPS } from "@/lib/constants";

interface LoadingStateProps {
  ticker: string;
  completedSteps: number[];
  onCancel: () => void;
}

export function LoadingState({ ticker, completedSteps, onCancel }: LoadingStateProps) {
  const activeStep = completedSteps.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pt-[60px]"
      style={{ background: "#020617" }}>

      <p className="font-mono text-[11px] tracking-[0.15em] uppercase mb-4"
        style={{ color: "rgba(125,211,252,0.5)" }}>
        Analyzing
      </p>
      <h2 className="font-display text-[44px] text-frozen mb-10 tracking-[-0.02em]">
        {ticker.toUpperCase()}
      </h2>

      <div className="flex flex-col gap-4 w-full max-w-[340px]">
        {LOADING_STEPS.map((step, i) => {
          const isDone   = completedSteps.includes(i);
          const isActive = i === activeStep;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                style={{
                  background: isDone
                    ? "#4caf78"
                    : isActive
                      ? "#7DD3FC"
                      : "rgba(125,211,252,0.18)",
                  animation: isActive ? "pulseDot 1.2s ease-in-out infinite" : "none",
                }} />
              <span className="font-mono text-[12px] transition-colors duration-300"
                style={{
                  color: isDone
                    ? "rgba(76,175,120,0.8)"
                    : isActive
                      ? "#E0F2FE"
                      : "rgba(125,211,252,0.35)",
                }}>
                {step}
              </span>
              {isDone && (
                <span className="ml-auto font-mono text-[11px]" style={{ color: "#4caf78" }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onCancel}
        className="mt-10 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors"
        style={{ color: "rgba(125,211,252,0.35)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#7DD3FC")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(125,211,252,0.35)")}>
        ← Cancel
      </button>
    </div>
  );
}
