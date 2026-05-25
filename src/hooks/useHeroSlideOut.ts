import { useEffect, useRef, type RefObject } from 'react';
import { useLenisInstance } from '../components/providers/LenisProvider';
import { useReducedMotion } from './useReducedMotion';

/** Must match .hero-reveal__panel transition duration in global.css */
const HERO_TRANSITION_MS = 550;
/** User must scroll past this before the hero can return */
const SCROLLED_AWAY_THRESHOLD = 48;

export function useHeroSlideOut(
  panelRef: RefObject<HTMLElement | null>,
  setChanocasterActive: (active: boolean) => void,
) {
  const lenis = useLenisInstance();
  const reducedMotion = useReducedMotion();
  const dismissedRef = useRef(false);
  const animatingRef = useRef(false);
  const hasScrolledAwayRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const restoreCooldownRef = useRef(false);

  // Disable browser scroll restoration so we control the position ourselves
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const getScrollY = () => lenis?.scroll ?? window.scrollY;

    const markScrolledAway = (scrollY: number) => {
      if (scrollY > SCROLLED_AWAY_THRESHOLD) {
        hasScrolledAwayRef.current = true;
      }
    };

    const isScrollingUp = (scrollY: number) => scrollY < lastScrollYRef.current - 0.5;

    // Always start at the top — scroll restoration is disabled above
    window.scrollTo(0, 0);
    lastScrollYRef.current = 0;

    if (reducedMotion) {
      const update = () => {
        const scrollY = getScrollY();
        const scrollingUp = isScrollingUp(scrollY);
        markScrolledAway(scrollY);

        if (scrollY > 0 && !dismissedRef.current) {
          panel.classList.add('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
          dismissedRef.current = true;
          hasScrolledAwayRef.current = false;
          setChanocasterActive(false);
        } else if (
          dismissedRef.current &&
          hasScrolledAwayRef.current &&
          scrollY < 1 &&
          scrollingUp
        ) {
          panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
          dismissedRef.current = false;
          hasScrolledAwayRef.current = false;
          setChanocasterActive(true);
        }

        lastScrollYRef.current = scrollY;
      };

      if (lenis) lenis.on('scroll', update);
      window.addEventListener('scroll', update, { passive: true });
      update();

      return () => {
        lenis?.off('scroll', update);
        window.removeEventListener('scroll', update);
        panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
        setChanocasterActive(true);
      };
    }

    const lockScroll = () => {
      document.documentElement.classList.add('hero-scroll-locked');
      lenis?.stop();
      lenis?.scrollTo(0, { immediate: true });
    };

    const unlockScroll = () => {
      document.documentElement.classList.remove('hero-scroll-locked');
      lenis?.start();
    };

    const setSpacerCollapsed = (collapsed: boolean) => {
      panel.parentElement?.classList.toggle('hero-reveal--spacer-collapsed', collapsed);
    };

    const finishAnimation = (dismissed: boolean) => {
      animatingRef.current = false;
      dismissedRef.current = dismissed;
      setChanocasterActive(!dismissed);
      if (dismissed) {
        // Hero is now gone — user is in content, so mark as scrolled away
        // immediately so a scroll-up from position 0 can restore the hero.
        hasScrolledAwayRef.current = true;
        setSpacerCollapsed(true);
      } else {
        setSpacerCollapsed(false);
        // Block dismiss for a brief window so Lenis' restart scroll event
        // doesn't immediately re-trigger the dismiss.
        restoreCooldownRef.current = true;
        window.setTimeout(() => { restoreCooldownRef.current = false; }, 150);
      }
      unlockScroll();
      lastScrollYRef.current = getScrollY();
    };

    const waitForTransition = (onComplete: () => void) => {
      const fallback = window.setTimeout(onComplete, HERO_TRANSITION_MS + 50);

      const onEndOnce = (e: TransitionEvent) => {
        if (e.target !== panel || e.propertyName !== 'transform') return;
        window.clearTimeout(fallback);
        panel.removeEventListener('transitionend', onEndOnce);
        onComplete();
      };

      panel.addEventListener('transitionend', onEndOnce);
    };

    const runDismiss = () => {
      if (dismissedRef.current || animatingRef.current || restoreCooldownRef.current) return;
      animatingRef.current = true;
      lockScroll();
      panel.classList.add('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      waitForTransition(() => finishAnimation(true));
    };

    const runRestore = () => {
      if (!dismissedRef.current || animatingRef.current) return;
      if (!hasScrolledAwayRef.current) return;

      animatingRef.current = true;
      lockScroll();
      panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      waitForTransition(() => {
        hasScrolledAwayRef.current = false;
        finishAnimation(false);
      });
    };

    const onScroll = () => {
      if (animatingRef.current) {
        if (getScrollY() !== 0) {
          lenis?.scrollTo(0, { immediate: true });
        }
        return;
      }

      const scrollY = getScrollY();
      const scrollingUp = isScrollingUp(scrollY);

      markScrolledAway(scrollY);

      if (scrollY > 0 && !dismissedRef.current) {
        lastScrollYRef.current = scrollY;
        runDismiss();
        return;
      }

      if (
        dismissedRef.current &&
        hasScrolledAwayRef.current &&
        scrollY < 1 &&
        scrollingUp
      ) {
        runRestore();
      }

      lastScrollYRef.current = scrollY;
    };

    const onWheel = (e: WheelEvent) => {
      if (animatingRef.current) {
        e.preventDefault();
        return;
      }

      const scrollY = getScrollY();

      if (!dismissedRef.current) {
        if (scrollY < 1 && e.deltaY > 0 && !restoreCooldownRef.current) {
          e.preventDefault();
          runDismiss();
        }
        return;
      }

      markScrolledAway(scrollY);

      if (hasScrolledAwayRef.current && scrollY < 1 && e.deltaY < 0) {
        e.preventDefault();
        runRestore();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (animatingRef.current) {
        e.preventDefault();
      }
    };

    if (lenis) {
      lenis.on('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });

    return () => {
      lenis?.off('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      document.documentElement.classList.remove('hero-scroll-locked');
      lenis?.start();
      panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      panel.parentElement?.classList.remove('hero-reveal--spacer-collapsed');
      dismissedRef.current = false;
      animatingRef.current = false;
      hasScrolledAwayRef.current = false;
      setChanocasterActive(true);
    };
  }, [lenis, reducedMotion, panelRef, setChanocasterActive]);
}
