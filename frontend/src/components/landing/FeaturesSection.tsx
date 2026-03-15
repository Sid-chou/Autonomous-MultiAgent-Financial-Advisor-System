const features = [
  { icon: "📰", title: "Live News Sentiment", desc: "FinBERT fine-tuned on Indian financial headlines analyzes today's news in real time." },
  { icon: "📈", title: "Technical Analysis",  desc: "RSI, MACD, and ATR computed from live price data. Regime-aware weights shift in volatile markets." },
  { icon: "📄", title: "Fundamental Analysis",desc: "PE ratio, revenue growth, and profit margins from real financial data — no hallucinations." },
  { icon: "🛡️", title: "Risk Management",    desc: "Hard rules enforce your personal limits — budget, daily loss cap, and max exposure per stock." },
  { icon: "⚖️", title: "Portfolio Decision",  desc: "Weighted formula across all three signals produces a clear BUY, SELL, or HOLD decision." },
  { icon: "💬", title: "Plain English Output",desc: "No jargon. Every signal translated into language any investor can act on immediately." },
];

export function FeaturesSection() {
  return (
    <section style={{ background: "#0F172A", borderTop: "1px solid rgba(125,211,252,0.08)" }}
      className="px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase mb-4"
          style={{ color: "#7DD3FC", opacity: 0.7 }}>
          Features
        </p>
        <h2 className="font-sans font-bold text-[36px] tracking-[-0.02em] text-alice mb-3"
          style={{ lineHeight: 1.15 }}>
          Everything you need,<br />nothing left to chance.
        </h2>
        <p className="font-mono text-[13px] mb-10" style={{ color: "rgba(224,242,254,0.45)", maxWidth: "380px", lineHeight: 1.7 }}>
          Six specialized AI agents that collaborate to deliver grounded, risk-aware recommendations for NSE-listed stocks.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-[10px] p-6 transition-all duration-200 cursor-default"
              style={{ background: "rgba(8,47,73,0.25)", border: "1px solid rgba(125,211,252,0.1)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(125,211,252,0.3)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(8,47,73,0.4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(125,211,252,0.1)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(8,47,73,0.25)";
              }}>
              <div className="w-9 h-9 rounded flex items-center justify-center mb-4 text-[15px]"
                style={{ border: "1.5px solid rgba(125,211,252,0.35)" }}>
                {f.icon}
              </div>
              <h3 className="font-sans font-medium text-[14px] text-alice mb-2">{f.title}</h3>
              <p className="font-mono text-[12px] leading-relaxed"
                style={{ color: "rgba(224,242,254,0.45)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
