"use client";
import { useState }         from "react";
import { Navbar }           from "@/components/layout/Navbar";
import { ProfilePanel }     from "@/components/layout/ProfilePanel";
import { LoadingState }     from "@/components/layout/LoadingState";
import { HeroSection }      from "@/components/landing/HeroSection";
import { FeaturesSection }  from "@/components/landing/FeaturesSection";
import { Dashboard }        from "@/components/dashboard/Dashboard";
import { useAnalysis }      from "@/hooks/useAnalysis";
import { useProfile }       from "@/hooks/useProfile";

export default function Home() {
  const { view, result, completedSteps, error, analyze, reset } = useAnalysis();
  const { profile, saveProfile, isProfileSet }                  = useProfile();
  const [profileOpen, setProfileOpen] = useState(false);
  const [ticker, setTicker]           = useState("");

  const handleAnalyze = () => {
    if (!ticker.trim()) return;
    analyze(ticker, profile);
  };

  return (
    <>
      <Navbar
        onProfileClick={() => setProfileOpen(true)}
        profileSet={isProfileSet}
      />

      {view === "landing" && (
        <>
          <HeroSection
            ticker={ticker}
            onTickerChange={setTicker}
            onAnalyze={handleAnalyze}
            error={error}
          />
          <FeaturesSection />
        </>
      )}

      {view === "loading" && (
        <LoadingState
          ticker={ticker}
          completedSteps={completedSteps}
          onCancel={reset}
        />
      )}

      {view === "dashboard" && result && (
        <Dashboard
          result={result}
          ticker={ticker}
          onReset={reset}
        />
      )}

      <ProfilePanel
        open={profileOpen}
        profile={profile}
        onSave={(updated) => { saveProfile(updated); setProfileOpen(false); }}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
