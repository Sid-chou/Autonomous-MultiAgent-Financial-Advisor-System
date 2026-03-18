import React from "react";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11" /><path d="M8 8h4" /><path d="M8 12h4" /><path d="M8 16h4" />
      </svg>
    ),
    title: "Live News Sentiment",
    desc: "FinBERT fine-tuned on Indian financial headlines analyzes today's news in real time."
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 17l6 -6l4 4l8 -8" /><path d="M14 7h7v7" />
      </svg>
    ),
    title: "Technical Analysis",
    desc: "RSI, MACD, and ATR computed from live price data. Regime-aware weights shift in volatile markets."
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17v-5" /><path d="M12 17v-1" /><path d="M15 17v-3" />
      </svg>
    ),
    title: "Fundamental Analysis",
    desc: "PE ratio, revenue growth, and profit margins from real financial data — no hallucinations."
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -1.116 9.376" /><path d="M15 19l2 2l4 -4" />
      </svg>
    ),
    title: "Risk Management",
    desc: "Hard rules enforce your personal limits — budget, daily loss cap, and max exposure per stock."
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 20h10" /><path d="M6 6l6 -1l6 1" /><path d="M12 3v17" /><path d="M9 12l-3 -6l-3 6a3 3 0 0 0 6 0" /><path d="M21 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
      </svg>
    ),
    title: "Portfolio Decision",
    desc: "Weighted formula across all three signals produces a clear BUY, SELL, or HOLD decision."
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
      </svg>
    ),
    title: "Plain English Output",
    desc: "No jargon. Every signal translated into language any investor can act on immediately."
  },
];

export function FeaturesSection() {
  return (
    <section style={{ background: "transparent", borderTop: "1px solid rgba(125,211,252,0.08)" }}
      className="px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase mb-4 text-center"
          style={{ color: "#000000", opacity: 0.7 }}>
          Features
        </p>
        <h2 className="font-sans font-bold text-[36px] tracking-[-0.02em] text-black mb-8 text-center"
          style={{ lineHeight: 1.15 }}>
          Everything you need,<br />nothing left to chance.
        </h2>
        {/* <p className="font-mono text-[13px] mb-10" style={{ color: "rgba(0, 0, 0, 1)", maxWidth: "380px", lineHeight: 1.7 }}>
          Six specialized AI agents that collaborate to deliver grounded, risk-aware recommendations for NSE-listed stocks.
        </p> */}

        <div className="grid grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-[10px] p-6 transition-all duration-200 cursor-default"
              style={{ background: "rgba(255, 255, 255, 0.25)", border: "2px solid rgba(37, 43, 45, 0.1)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(37, 43, 45, 0.2)";
                (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; // very light grey
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(37, 43, 45, 0.1)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255, 255, 255, 0.25)";
              }}>
              <div className="w-9 h-9 rounded flex items-center justify-center mb-4"
                style={{ color: "#0F172A", border: "1.5px solid rgba(15, 23, 42, 0.15)", background: "rgba(15, 23, 42, 0.04)" }}>
                {f.icon}
              </div>
              <h3 className="font-Plus Jakarta Sans font-semibold text-[14px] text-black mb-2">{f.title}</h3>
              <p className="font-mono text-[12px] leading-relaxed"
                style={{ color: "rgba(0, 0, 0, 1)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
