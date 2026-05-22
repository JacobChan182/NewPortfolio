import { useEffect, type RefObject } from 'react';
import { useLenisInstance } from '../components/providers/LenisProvider';
import { useReducedMotion } from './useReducedMotion';

/** Any scroll down dismisses the hero; scroll back to top brings it back */
const DISMISS_SCROLL_THRESHOLD = 1;

export function useHeroSlideOut(panelRef: RefObject<HTMLElement | null>) {
  const lenis = useLenisInstance();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const panel = panelRef.current;
    if (!panel) return;

    const update = () => {
      const scrollY = lenis?.scroll ?? window.scrollY;
      const dismissed = scrollY >= DISMISS_SCROLL_THRESHOLD;

      panel.classList.toggle('hero-reveal__panel--dismissed', dismissed);
      panel.classList.toggle('hero-reveal__panel--gone', dismissed);
    };

    if (lenis) {
      lenis.on('scroll', update);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      lenis?.off('scroll', update);
      window.removeEventListener('scroll', update);
      panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
    };
  }, [lenis, reducedMotion, panelRef]);
}
