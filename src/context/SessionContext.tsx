import React, { createContext, useContext, useState } from 'react';

const SESSION_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const DEFAULT_YEAR = 2026;
const STORAGE_KEY = 'currentSessionYear';

interface SessionContextValue {
  sessionYear: number;
  setSessionYear: (year: number) => void;
  sessionYears: number[];
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionYear, setSessionYearState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return SESSION_YEARS.includes(parsed) ? parsed : DEFAULT_YEAR;
  });

  const setSessionYear = (year: number) => {
    localStorage.setItem(STORAGE_KEY, String(year));
    setSessionYearState(year);
  };

  return (
    <SessionContext.Provider value={{ sessionYear, setSessionYear, sessionYears: SESSION_YEARS }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
