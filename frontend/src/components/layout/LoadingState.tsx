"use client";
import { LOADING_STEPS } from "@/lib/constants";

interface LoadingStateProps {
  ticker: string;
  completedSteps: number[];
  onCancel: () => void;
}

const CARD_H = 62;
const GAP    = 14;
const STEP   = CARD_H + GAP;

export function LoadingState({ ticker, completedSteps, onCancel }: LoadingStateProps) {
  const activeStep  = completedSteps.length;
  const containerH  = STEP * 3;
  const maskH       = STEP + 8;

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col overflow-hidden" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;700&family=DM+Mono&display=swap');

          .dot-wave { display: flex; gap: 4px; }
          .dot { width: 4px; height: 4px; border-radius: 50%; background-color: currentColor; animation: wave 1.4s infinite ease-in-out both; }
          .dot:nth-child(1) { animation-delay: -0.32s; }
          .dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes wave {
            0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
          .dot-active { animation-duration: 0.6s; }

          .agent-card {
            position: absolute;
            left: 0; right: 0;
            height: ${CARD_H}px;
            transition:
              transform    0.72s cubic-bezier(0.32, 0.72, 0, 1),
              opacity      0.65s ease,
              filter       0.65s ease;
            will-change: transform, opacity, filter;
          }
        `}
      </style>

      {/* ── Navbar (unchanged) ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center justify-center max-w-3xl mx-auto backdrop-blur-2xl bg-white/90 border-b border-white/100">
        <div className="w-full max-w-[1100px] mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M19 6.873a2 2 0 0 1 1 1.747v6.536a2 2 0 0 1 -1.029 1.748l-6 3.833a2 2 0 0 1 -1.942 0l-6 -3.833a2 2 0 0 1 -1.029 -1.747v-6.537a2 2 0 0 1 1.029 -1.748l6 -3.572a2.056 2.056 0 0 1 2 0l6 3.573z" />
                <path d="M9 15v-4" /><path d="M12 15v-7" /><path d="M15 15v-2" />
              </svg>
            </div>
            <span className="text-[18px] font-semibold tracking-tight" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
              Fin<span style={{ color: "#2563EB" }}>Advisor</span>
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 relative mt-[64px]">

        {/* Background ambient (unchanged) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[0%] -left-[10%] w-[40%] h-[40%] bg-[#e8f6ff] rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] bg-[#d9ebf7] rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="z-10 text-center max-w-2xl w-full flex flex-col items-center">

          {/* Ticker (unchanged) */}
          <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight mb-16" style={{ color: "#001a2c", fontFamily: '"Playfair Display", serif' }}>
            Analyzing {ticker.toUpperCase()}
          </h1>

          {/* ── Staggered window ─────────────────────────────────────── */}
          <div
            className="w-full max-w-[400px]"
            style={{ position: "relative", height: containerH, overflow: "hidden" }}
          >
            {/* Top fade mask */}
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: maskH, zIndex: 10, pointerEvents: "none",
                background: "linear-gradient(to bottom, #ffffff 30%, transparent)",
              }}
            />
            {/* Bottom fade mask */}
            <div
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: maskH, zIndex: 10, pointerEvents: "none",
                background: "linear-gradient(to top, #ffffff 30%, transparent)",
              }}
            />

            {LOADING_STEPS.map((step: string, i: number) => {
              const isDone   = completedSteps.includes(i);
              const isActive = i === activeStep;
              const dist     = i - activeStep;          // signed: neg = above, pos = below
              const absDist  = Math.abs(dist);

              // cards more than 1 slot away are invisible
              const opacity = absDist === 0 ? 1 : absDist === 1 ? 0.38 : 0;

              // above cards blur a bit more than below cards
              const blurPx  = absDist === 0 ? 0 : dist < 0 ? 2.5 : 1;

              return (
                <div
                  key={i}
                  className="agent-card"
                  style={{
                    top: STEP,                                      // centre slot
                    transform: `translateY(${dist * STEP}px)`,
                    opacity,
                    filter: `blur(${blurPx}px)`,
                  }}
                >
                  {/* ── Done card ──────────────────────────────────── */}
                  {isDone && (
                    <div className="w-full flex items-center justify-between p-4 bg-[#e8f6ff]/50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#082f49] flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M5 12l5 5l10 -10"/>
                          </svg>
                        </div>
                        <span className="font-sans font-medium text-[#001a2c]" style={{ fontFamily: '"DM Sans", sans-serif' }}>{step}</span>
                      </div>
                      <span className="font-mono text-[12px] text-[#001a2c] uppercase tracking-wider" style={{ fontFamily: '"DM Mono", monospace' }}>Done</span>
                    </div>
                  )}

                  {/* ── Active card ─────────────────────────────────── */}
                  {isActive && !isDone && (
                    <div className="w-full flex items-center justify-between p-4 bg-[#ffffff] rounded-2xl border border-[#001a2c]/5" style={{ boxShadow: "0 4px 24px rgba(0,26,44,0.06)" }}>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#d3e5f1] flex items-center justify-center text-[#001a2c]">
                          <div className="dot-wave">
                            <div className="dot dot-active"></div>
                            <div className="dot dot-active"></div>
                            <div className="dot dot-active"></div>
                          </div>
                        </div>
                        <span className="font-sans font-bold text-[#001a2c]" style={{ fontFamily: '"DM Sans", sans-serif' }}>{step}</span>
                      </div>
                      <span className="font-mono text-[12px] text-[#082f49] font-bold uppercase tracking-wider" style={{ fontFamily: '"DM Mono", monospace' }}>Running...</span>
                    </div>
                  )}

                  {/* ── Waiting card ────────────────────────────────── */}
                  {!isDone && !isActive && (
                    <div className="w-full flex items-center justify-between p-4 bg-transparent rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border border-[#c2c7ce] flex items-center justify-center text-[#73777e]">
                          <div className="dot-wave">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                          </div>
                        </div>
                        <span className="font-sans font-medium text-[#42474d]" style={{ fontFamily: '"DM Sans", sans-serif' }}>{step}</span>
                      </div>
                      <span className="font-mono text-[12px] text-[#73777e] uppercase tracking-wider" style={{ fontFamily: '"DM Mono", monospace' }}>Waiting...</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* ── End staggered window ─────────────────────────────────── */}

        </div>
      </main>

      {/* ── Footer (unchanged) ────────────────────────────────────────── */}
      <footer className="w-full py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-sky-700/60 transition-colors">
          <button onClick={onCancel} className="font-mono text-[12px] tracking-wide hover:text-sky-950 uppercase transition-colors" style={{ fontFamily: '"DM Mono", monospace' }}>
            ← Cancel analysis
          </button>
          <div className="hidden md:flex gap-8">
            <span className="font-sans text-sm tracking-wide">Pipeline Status</span>
            <span className="font-sans text-sm tracking-wide">Privacy</span>
          </div>
          <p className="font-sans text-sm tracking-wide text-sky-900 opacity-50 hidden sm:block">© 2024 FinAdvisor. Editorial Financial Excellence.</p>
        </div>
      </footer>
    </div>
  );
}