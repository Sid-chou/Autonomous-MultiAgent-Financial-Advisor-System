"use client";
import { useState } from "react";
import { UserProfile } from "@/types";

interface Props {
  open: boolean;
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onClose: () => void;
}

export function ProfilePanel({ open, profile, onSave, onClose }: Props) {
  const [local, setLocal] = useState<UserProfile>(profile);

  const inputStyle = {
    width: "100%",
    background: "#16161a",
    border: "1px solid rgba(125,211,252,0.12)",
    borderRadius: "4px",
    color: "#E0F2FE",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
    height: "38px",
    padding: "0 10px",
    outline: "none",
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-72 z-50 p-6 overflow-y-auto"
        style={{ background: "#0F172A", borderLeft: "1px solid rgba(125,211,252,0.1)" }}>

        <div className="flex justify-between items-center mb-6">
          <span className="font-display text-[18px] text-alice">Risk Profile</span>
          <button onClick={onClose} className="font-mono text-[16px]"
            style={{ color: "#7DD3FC", background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        {[
          { label: "Total Budget (₹)", key: "totalBudget", suffix: "" },
          { label: "Cash Available (₹)", key: "cashAvailable", suffix: "" },
          { label: "Max per Stock (%)", key: "maxTradeSize", suffix: "%" },
          { label: "Daily Loss Limit (%)", key: "dailyLossLimit", suffix: "%" },
          { label: "Max Exposure per Stock (%)", key: "maxExposurePerStock", suffix: "%" },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2"
              style={{ color: "rgba(125,211,252,0.45)" }}>{f.label}</p>
            <input
              type="number"
              style={inputStyle}
              value={f.suffix === "%" ? (local[f.key as keyof UserProfile] as number) * 100 : local[f.key as keyof UserProfile] as number}
              onChange={e => setLocal(prev => ({
                ...prev,
                [f.key]: f.suffix === "%" ? Number(e.target.value) / 100 : Number(e.target.value)
              }))}
            />
          </div>
        ))}

        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2"
            style={{ color: "rgba(125,211,252,0.45)" }}>Risk Level</p>
          <div className="flex gap-2">
            {(["low","moderate","high"] as const).map(r => (
              <button key={r} onClick={() => setLocal(p => ({...p, riskLevel: r}))}
                className="flex-1 h-8 font-mono text-[11px] rounded capitalize transition-all"
                style={{
                  background: local.riskLevel === r ? "#7DD3FC" : "transparent",
                  color: local.riskLevel === r ? "#020617" : "#7DD3FC",
                  border: "1px solid rgba(125,211,252,0.2)",
                  cursor: "pointer",
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSave(local)}
          className="w-full h-10 font-mono text-[11px] uppercase tracking-[0.1em] rounded transition-opacity hover:opacity-85"
          style={{ background: "#7DD3FC", color: "#020617", border: "none", cursor: "pointer" }}>
          Save Profile
        </button>
      </div>
    </>
  );
}
