"use client";
import { AnalysisResponse } from "@/types";

interface Props { 
  result: AnalysisResponse; 
  onReset: () => void;
}

export function PipelineStatus({ result, onReset }: Props) {
  const agents = [
    { label: "INGESTION",   status: "OK" },
    { label: "PARSING",     status: result.sentimentReport?.status ?? "OK" },
    { label: "AGENTS",      status: result.technicalReport?.status ?? "OK" },
    { label: "SYNTHESIS",   status: result.portfolioReport?.status ?? "OK" },
    { label: "COMPLETE",    status: result.riskReport?.status ?? "OK" },
  ];

  return (
    <footer className="w-full py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Pipeline Status Component */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {agents.map((a, i) => (
              <div key={a.label} className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: a.status === "OK" ? (a.label === "COMPLETE" ? "#4caf78" : "#001a2c") : "#ba1a1a" }} />
                  <span className="text-[10px] font-mono uppercase tracking-tighter"
                    style={{ color: a.status === "OK" ? (a.label === "COMPLETE" ? "#4caf78" : "#001a2c") : "#ba1a1a", fontFamily: '"DM Mono", monospace' }}>
                    {a.label}
                  </span>
                </div>
                {i < agents.length - 1 && (
                  <div className="w-4 h-[1px]" style={{ backgroundColor: "#c2c7ce" }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center gap-8 font-sans text-sm tracking-wide" style={{ fontFamily: '"DM Sans", sans-serif' }}>
          <button onClick={onReset} className="text-sky-700/60 hover:text-sky-900 transition-colors uppercase font-mono text-xs">
            ← Cancel analysis
          </button>
          <span className="text-sky-950 font-medium underline underline-offset-4 cursor-pointer">Pipeline Status</span>
          <span className="text-sky-700/60 hover:text-sky-900 transition-colors cursor-pointer">Privacy</span>
        </div>
      </div>
      <div className="text-center mt-8 text-[11px] font-mono text-[#001a2c]/40" style={{ fontFamily: '"DM Mono", monospace' }}>
        © 2024 FinAdvisor. Editorial Financial Excellence.
      </div>
    </footer>
  );
}
