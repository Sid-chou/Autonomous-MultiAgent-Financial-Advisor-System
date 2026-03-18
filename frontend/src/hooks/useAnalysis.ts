"use client";
import { useState } from "react";
import { AnalysisResponse, UserProfile, ViewState } from "@/types";
import { LOADING_STEPS } from "@/lib/constants";

export function useAnalysis() {
  const [view, setView]               = useState<ViewState>("landing");
  const [result, setResult]           = useState<AnalysisResponse | null>(null);
  const [completedSteps, setCompleted] = useState<number[]>([]);
  const [error, setError]             = useState<string | null>(null);

  const analyze = async (ticker: string, profile: UserProfile) => {
    setView("loading");
    setCompleted([]);
    setError(null);

    // Simulate progressive steps while API runs in background
    let stepIndex = 0;
    const stepTimer = setInterval(() => {
      if (stepIndex < LOADING_STEPS.length - 1) {
        setCompleted(prev => [...prev, stepIndex]);
        stepIndex++;
      } else {
        clearInterval(stepTimer);
      }
    }, 1100);

    try {
      const response = await fetch("/api/backend/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          userProfile: profile,
        }),
      });

      clearInterval(stepTimer);

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data: AnalysisResponse = await response.json();

      // Complete all steps before showing dashboard
      setCompleted(LOADING_STEPS.map((_, i) => i));
      await new Promise(r => setTimeout(r, 700));

      setResult(data);
      setView("dashboard");
    } catch (err) {
      clearInterval(stepTimer);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setView("landing");
    }
  };

  const reset = () => {
    setView("landing");
    setResult(null);
    setError(null);
    setCompleted([]);
  };

  return { view, result, completedSteps, error, analyze, reset };
}
