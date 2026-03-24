"use client";
import { AnalysisResponse } from "@/types";
import { TICKER_TO_COMPANY } from "@/lib/constants";
import { DecisionCard }       from "./DecisionCard";
import { AgentCards }         from "./AgentCards";
import { PipelineStatus }     from "./PipelineStatus";
import { Navbar }             from "@/components/layout/Navbar";

interface Props {
  result: AnalysisResponse;
  ticker: string;
  onReset: () => void;
}

export function Dashboard({ result, ticker, onReset }: Props) {
  const cleanTicker  = ticker.replace(".NS", "").replace(".BO", "").toUpperCase();
  const companyName  = TICKER_TO_COMPANY[cleanTicker] ?? cleanTicker;

  return (
    <div className="font-body text-[#0c1e26] antialiased min-h-screen flex flex-col bg-[#f8fafc]">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;700&family=DM+Mono&family=Newsreader:ital,wght@0,400;0,600;1,400&family=Manrope:wght@400;500;700&family=Space+Grotesk:wght@400;500&display=swap');
          .glass-nav {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px);
          }
          .decision-card-shadow {
            box-shadow: 0 8px 40px rgba(12, 30, 38, 0.08);
          }
          .connector-glow {
            background: linear-gradient(to bottom, #082f49 0%, transparent 100%);
          }
        `}
      </style>

      {/* TopNavBar */}
      <Navbar onProfileClick={() => {}} profileSet={false} />

      <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Result Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#001a2c]/60 mb-2 block" style={{ fontFamily: '"DM Mono", monospace' }}>Ticker Analysis</span>
            <h1 className="text-4xl font-serif font-semibold text-[#001a2c]" style={{ fontFamily: '"Playfair Display", serif' }}>
              {companyName} <span className="text-[#001a2c]/40">{cleanTicker}</span>
            </h1>
          </div>
          <button onClick={onReset} className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#c2c7ce] text-[#001a2c] font-medium hover:bg-[#e8f6ff] transition-all duration-300 ease-out active:scale-95" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 5l0 14" />
              <path d="M5 12l14 0" />
            </svg>
            New Analysis
          </button>
        </header>

        {/* Top Row: Agent Cards */}
        <AgentCards
          sentiment={result.sentimentReport}
          technical={result.technicalReport}
          fundamental={result.fundamentalReport}
        />

        {/* Connector Line */}
        <div className="flex justify-center h-20">
          <div className="w-[2px] connector-glow h-full"></div>
        </div>

        {/* Decision Card */}
        <DecisionCard
          portfolioReport={result.portfolioReport}
          riskReport={result.riskReport}
          liaisonHeadline={result.liaisonReport?.headline ?? null}
        />
      </main>

      {/* Footer Pipeline Status Strip */}
      <PipelineStatus result={result} onReset={onReset} />
    </div>
  );
}
