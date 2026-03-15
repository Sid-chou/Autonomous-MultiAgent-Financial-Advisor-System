"use client";
import { useState, useRef, useEffect } from "react";
import { SUPPORTED_TICKERS } from "@/lib/constants";

interface TickerInputProps {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  error?: string | null;
}

export function TickerInput({ value, onChange, onAnalyze, error }: TickerInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.length >= 2
    ? SUPPORTED_TICKERS.filter(t =>
        t.symbol.toLowerCase().includes(value.toLowerCase()) ||
        t.name.toLowerCase().includes(value.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={e => e.key === "Enter" && onAnalyze()}
          placeholder="Enter ticker e.g. INFY.NS"
          className="w-[300px] h-[48px] px-4 font-mono text-[13px] text-alice rounded"
          style={{
            background: "rgba(8, 47, 73, 0.6)",
            border: error
              ? "1px solid rgba(224, 92, 92, 0.6)"
              : "1px solid rgba(125, 211, 252, 0.2)",
            transition: "border-color 200ms",
          }}
          onFocusCapture={e => {
            (e.target as HTMLInputElement).style.borderColor = "#7DD3FC";
          }}
          onBlurCapture={e => {
            (e.target as HTMLInputElement).style.borderColor =
              error ? "rgba(224, 92, 92, 0.6)" : "rgba(125, 211, 252, 0.2)";
          }}
        />
        <button
          onClick={onAnalyze}
          className="h-[48px] px-6 font-mono text-[11px] tracking-[0.1em] uppercase rounded transition-opacity hover:opacity-85"
          style={{ background: "#7DD3FC", color: "#020617" }}>
          Analyze
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 font-mono text-[11px] text-sell">{error}</p>
      )}

      {/* Autocomplete dropdown */}
      {showDropdown && filtered.length > 0 && (
        <div className="absolute top-[52px] left-0 w-[300px] rounded z-10 overflow-hidden"
          style={{ background: "#0F172A", border: "1px solid rgba(125, 211, 252, 0.15)" }}>
          {filtered.map(t => (
            <div
              key={t.symbol}
              onClick={() => { onChange(t.symbol); setShowDropdown(false); }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              style={{ borderBottom: "1px solid rgba(125, 211, 252, 0.06)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(8,47,73,0.6)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span className="font-mono text-[12px] text-frozen">{t.symbol}</span>
              <span className="font-mono text-[11px] text-alice opacity-40">{t.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
