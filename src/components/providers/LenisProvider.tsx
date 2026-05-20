import Lenis from 'lenis';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const LenisContext = createContext<Lenis | null>(null);

export function useLenisInstance() {
  return useContext(LenisContext);
}

type LenisProviderProps = {
  children: ReactNode;
};

export function LenisProvider({ children }: LenisProviderProps) {
  const reducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setLenis(null);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      return;
    }

    const instance = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });
    setLenis(instance);
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      setLenis(null);
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function scrollToSection(id: string, lenis: Lenis | null) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -72, duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
