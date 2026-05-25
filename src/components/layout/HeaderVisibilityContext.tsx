import { createContext, useContext, useState, type ReactNode } from 'react';

type HeaderVisibilityContextValue = {
  /** True while scrolling through MaillardMap (title reveal + video scrub). */
  maillardNavHidden: boolean;
  setMaillardNavHidden: (hidden: boolean) => void;
};

const HeaderVisibilityContext = createContext<HeaderVisibilityContextValue | null>(null);

export function HeaderVisibilityProvider({ children }: { children: ReactNode }) {
  const [maillardNavHidden, setMaillardNavHidden] = useState(false);

  return (
    <HeaderVisibilityContext.Provider value={{ maillardNavHidden, setMaillardNavHidden }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility() {
  const ctx = useContext(HeaderVisibilityContext);
  if (!ctx) {
    throw new Error('useHeaderVisibility must be used within HeaderVisibilityProvider');
  }
  return ctx;
}
