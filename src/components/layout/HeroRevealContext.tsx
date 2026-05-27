import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type HeroNavAPI = {
  dismissHero: () => Promise<void>;
  goToHome: () => Promise<void>;
};

const noopHeroNav: HeroNavAPI = {
  dismissHero: () => Promise.resolve(),
  goToHome: () => Promise.resolve(),
};

type HeroRevealContextValue = {
  chanocasterActive: boolean;
  setChanocasterActive: (active: boolean) => void;
  dismissHero: () => Promise<void>;
  goToHome: () => Promise<void>;
  registerHeroNav: (api: HeroNavAPI | null) => void;
};

const HeroRevealContext = createContext<HeroRevealContextValue | null>(null);

export function HeroRevealProvider({ children }: { children: ReactNode }) {
  const [chanocasterActive, setChanocasterActive] = useState(true);
  const navRef = useRef<HeroNavAPI>(noopHeroNav);

  const registerHeroNav = useCallback((api: HeroNavAPI | null) => {
    navRef.current = api ?? noopHeroNav;
  }, []);

  const dismissHero = useCallback(() => navRef.current.dismissHero(), []);
  const goToHome = useCallback(() => navRef.current.goToHome(), []);

  return (
    <HeroRevealContext.Provider
      value={{
        chanocasterActive,
        setChanocasterActive,
        dismissHero,
        goToHome,
        registerHeroNav,
      }}
    >
      {children}
    </HeroRevealContext.Provider>
  );
}

export function useHeroReveal() {
  const ctx = useContext(HeroRevealContext);
  if (!ctx) {
    throw new Error('useHeroReveal must be used within HeroRevealProvider');
  }
  return ctx;
}
