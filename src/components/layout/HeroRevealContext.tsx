import { createContext, useContext, useState, type ReactNode } from 'react';

type HeroRevealContextValue = {
  chanocasterActive: boolean;
  setChanocasterActive: (active: boolean) => void;
};

const HeroRevealContext = createContext<HeroRevealContextValue | null>(null);

export function HeroRevealProvider({ children }: { children: ReactNode }) {
  const [chanocasterActive, setChanocasterActive] = useState(true);

  return (
    <HeroRevealContext.Provider value={{ chanocasterActive, setChanocasterActive }}>
      {children}
    </HeroRevealContext.Provider>
  );
}

export function useHeroReveal() {
  const ctx = useContext(HeroRevealContext);
  if (!ctx) {
    throw new Error('useHeroReveal must be used within HeroReveal');
  }
  return ctx;
}
