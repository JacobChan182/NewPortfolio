import { useEffect, useState, type RefObject } from 'react';
import type Lenis from 'lenis';

type UseSectionScrollProgressOptions = {
  lenis: Lenis | null;
  /** When false, progress stays at 1 (fully revealed) */
  enabled?: boolean;
};

/**
 * Scroll progress (0 → 1) while a tall section scrolls through the viewport.
 * Uses getBoundingClientRect so it stays in sync with Lenis smooth scroll.
 */
export function useSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  { lenis, enabled = true }: UseSectionScrollProgressOptions,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled) {
      setProgress(enabled ? 0 : 1);
      return;
    }

    let frame = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = section.offsetHeight - window.innerHeight;

      if (scrollRange <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
        return;
      }

      const scrolled = -rect.top;
      setProgress(Math.min(Math.max(scrolled / scrollRange, 0), 1));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    if (lenis) lenis.on('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(section);

    onScroll();

    return () => {
      cancelAnimationFrame(frame);
      lenis?.off('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      resizeObserver.disconnect();
    };
  }, [sectionRef, lenis, enabled]);

  return progress;
}
