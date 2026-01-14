import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const OnboardingContext = createContext(null);

const LS_KEY = 'foodtrack_onboarding_draft';

const DEFAULT_DRAFT = {
  // 1) ник/почта — живёт в AuthContext (identifier)
  // 2) пол
  gender: '', // 'male' | 'female' | 'na'
  // 3) тренировки/нед
  workoutsPerWeek: 0,
  // 4) диета
  diet: 'none', // 'none' | 'keto' | 'vegetarian' | 'vegan' | 'halal' | 'lowcarb' | 'custom'
  dietNotes: '',
  // 5) год рождения
  birthYear: '',
  // 6) рост/вес/цель веса
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  // 7) раз в день питается
  mealsPerDay: 3,
  // 8) состояние здоровья
  healthFlags: [], // array of strings
  healthNotes: '',
  // 9) отказ от претензий
  disclaimerAccepted: false,
};

function safeParse(json, fallback) {
  try {
    if (!json) return fallback;
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function OnboardingProvider({ children }) {
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    const merged = safeParse(saved, DEFAULT_DRAFT);
    setDraft(merged);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify(draft));
  }, [draft, loaded]);

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleHealthFlag = (flag) => {
    setDraft((prev) => {
      const set = new Set(prev.healthFlags || []);
      if (set.has(flag)) set.delete(flag);
      else set.add(flag);
      return { ...prev, healthFlags: Array.from(set) };
    });
  };

  const resetDraft = () => {
    setDraft(DEFAULT_DRAFT);
  };

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      updateField,
      toggleHealthFlag,
      resetDraft,
      loaded,
    }),
    [draft, loaded]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingDraft() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboardingDraft must be used within OnboardingProvider');
  return ctx;
}
