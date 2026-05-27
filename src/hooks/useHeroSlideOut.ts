import { useEffect, useRef, type RefObject } from 'react';
import { useLenisInstance } from '../components/providers/LenisProvider';
import type { HeroNavAPI } from '../components/layout/HeroRevealContext';
import { useReducedMotion } from './useReducedMotion';

/** Must match .hero-reveal__panel transition duration in global.css */
const HERO_TRANSITION_MS = 550;
/** User must scroll past this before the hero can return */
const SCROLLED_AWAY_THRESHOLD = 48;

export function useHeroSlideOut(
  panelRef: RefObject<HTMLElement | null>,
  setChanocasterActive: (active: boolean) => void,
  registerHeroNav: (api: HeroNavAPI | null) => void,
) {
  const lenis = useLenisInstance();
  const reducedMotion = useReducedMotion();
  const dismissedRef = useRef(false);
  const animatingRef = useRef(false);
  const hasScrolledAwayRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const restoreCooldownRef = useRef(false);
  const blockAutoRestoreRef = useRef(false);
  const pendingDismissResolveRef = useRef<(() => void) | null>(null);
  const pendingRestoreResolveRef = useRef<(() => void) | null>(null);

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

    const resolvePendingDismiss = () => {
      pendingDismissResolveRef.current?.();
      pendingDismissResolveRef.current = null;
    };

    const resolvePendingRestore = () => {
      pendingRestoreResolveRef.current?.();
      pendingRestoreResolveRef.current = null;
    };

    window.scrollTo(0, 0);
    lastScrollYRef.current = 0;

    const dismissHeroReduced = (): Promise<void> => {
      if (dismissedRef.current) return Promise.resolve();
      panel.classList.add('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      dismissedRef.current = true;
      hasScrolledAwayRef.current = true;
      setChanocasterActive(false);
      panel.parentElement?.classList.add('hero-reveal--spacer-collapsed');
      return Promise.resolve();
    };

    const restoreHeroReduced = (): Promise<void> => {
      if (!dismissedRef.current) return Promise.resolve();
      panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      dismissedRef.current = false;
      hasScrolledAwayRef.current = false;
      setChanocasterActive(true);
      panel.parentElement?.classList.remove('hero-reveal--spacer-collapsed');
      return Promise.resolve();
    };

    if (reducedMotion) {
      const update = () => {
        const scrollY = getScrollY();
        const scrollingUp = isScrollingUp(scrollY);
        markScrolledAway(scrollY);

        if (scrollY > 0 && !dismissedRef.current) {
          panel.classList.add('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
          dismissedRef.current = true;
          hasScrolledAwayRef.current = true;
          setChanocasterActive(false);
          panel.parentElement?.classList.add('hero-reveal--spacer-collapsed');
        } else if (
          !blockAutoRestoreRef.current &&
          dismissedRef.current &&
          hasScrolledAwayRef.current &&
          scrollY < 1 &&
          scrollingUp
        ) {
          panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
          dismissedRef.current = false;
          hasScrolledAwayRef.current = false;
          setChanocasterActive(true);
          panel.parentElement?.classList.remove('hero-reveal--spacer-collapsed');
        }

        lastScrollYRef.current = scrollY;
      };

      const goToHome = async () => {
        blockAutoRestoreRef.current = true;
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.1 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        await new Promise((r) => window.setTimeout(r, reducedMotion ? 0 : 1100));
        await restoreHeroReduced();
        blockAutoRestoreRef.current = false;
      };

      registerHeroNav({
        dismissHero: dismissHeroReduced,
        goToHome,
      });

      if (lenis) lenis.on('scroll', update);
      window.addEventListener('scroll', update, { passive: true });
      update();

      return () => {
        registerHeroNav(null);
        lenis?.off('scroll', update);
        window.removeEventListener('scroll', update);
        panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
        panel.parentElement?.classList.remove('hero-reveal--spacer-collapsed');
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
        hasScrolledAwayRef.current = true;
        setSpacerCollapsed(true);
        resolvePendingDismiss();
      } else {
        setSpacerCollapsed(false);
        restoreCooldownRef.current = true;
        window.setTimeout(() => {
          restoreCooldownRef.current = false;
        }, 150);
        resolvePendingRestore();
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

    const runDismiss = (programmatic = false): boolean => {
      if (dismissedRef.current || animatingRef.current || restoreCooldownRef.current) {
        return false;
      }
      animatingRef.current = true;
      if (!programmatic) {
        lockScroll();
      } else {
        document.documentElement.classList.add('hero-scroll-locked');
        lenis?.scrollTo(0, { immediate: true });
      }
      panel.classList.add('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      waitForTransition(() => {
        document.documentElement.classList.remove('hero-scroll-locked');
        finishAnimation(true);
      });
      return true;
    };

    const runRestore = (programmatic = false): boolean => {
      if (!dismissedRef.current || animatingRef.current) return false;
      if (!programmatic) {
        if (blockAutoRestoreRef.current) return false;
        if (!hasScrolledAwayRef.current) return false;
        const scrollY = getScrollY();
        if (!(scrollY < 1 && isScrollingUp(scrollY))) return false;
      }

      animatingRef.current = true;
      lockScroll();
      panel.classList.remove('hero-reveal__panel--dismissed', 'hero-reveal__panel--gone');
      waitForTransition(() => {
        hasScrolledAwayRef.current = false;
        finishAnimation(false);
      });
      return true;
    };

    const dismissHero = (): Promise<void> => {
      if (dismissedRef.current) return Promise.resolve();
      if (animatingRef.current) {
        return new Promise((resolve) => {
          pendingDismissResolveRef.current = resolve;
        });
      }
      return new Promise((resolve) => {
        pendingDismissResolveRef.current = resolve;
        if (!runDismiss(true)) {
          pendingDismissResolveRef.current = null;
          resolve();
        }
      });
    };

    const restoreHero = (): Promise<void> => {
      if (!dismissedRef.current) return Promise.resolve();
      if (animatingRef.current) {
        return new Promise((resolve) => {
          pendingRestoreResolveRef.current = resolve;
        });
      }
      return new Promise((resolve) => {
        pendingRestoreResolveRef.current = resolve;
        hasScrolledAwayRef.current = true;
        if (!runRestore(true)) {
          pendingRestoreResolveRef.current = null;
          resolve();
        }
      });
    };

    const goToHome = async (): Promise<void> => {
      blockAutoRestoreRef.current = true;
      const scrollY = getScrollY();

      if (scrollY < 1 && !dismissedRef.current) {
        blockAutoRestoreRef.current = false;
        return;
      }

      await new Promise<void>((resolve) => {
        if (scrollY < 1) {
          resolve();
          return;
        }
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.1, onComplete: () => resolve() });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          window.setTimeout(resolve, 1100);
        }
      });

      await restoreHero();
      blockAutoRestoreRef.current = false;
    };

    registerHeroNav({ dismissHero, goToHome });

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
        !blockAutoRestoreRef.current &&
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

      if (
        !blockAutoRestoreRef.current &&
        hasScrolledAwayRef.current &&
        scrollY < 1 &&
        e.deltaY < 0
      ) {
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
      registerHeroNav(null);
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
      blockAutoRestoreRef.current = false;
      pendingDismissResolveRef.current = null;
      pendingRestoreResolveRef.current = null;
      setChanocasterActive(true);
    };
  }, [lenis, reducedMotion, panelRef, registerHeroNav, setChanocasterActive]);
}
