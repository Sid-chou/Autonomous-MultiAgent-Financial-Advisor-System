"use client";

import { useState, useEffect } from "react";
import { LoadingState } from "@/components/layout/LoadingState";

export default function TestLoadingPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Simulate progress every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedSteps(prev => {
        if (prev.length >= 4) {
          clearInterval(interval);
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <LoadingState 
        ticker="AAPL" 
        completedSteps={completedSteps} 
        onCancel={() => alert("Cancel clicked!")} 
      />
    </div>
  );
}
