"use client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { DEFAULT_PROFILE, PROFILE_STORAGE_KEY } from "@/lib/constants";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) setProfile(JSON.parse(stored));
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  };

  const isProfileSet = isLoaded && localStorage.getItem(PROFILE_STORAGE_KEY) !== null;

  return { profile, saveProfile, isProfileSet };
}
