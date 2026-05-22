import { useRef, type ReactNode } from 'react';
import { useHeroSlideOut } from '../../hooks/useHeroSlideOut';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type HeroRevealProps = {
  children: ReactNode;
};

/** Fixed full-viewport hero that slides up on scroll to reveal sections below. */
export function HeroReveal({ children }: HeroRevealProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useHeroSlideOut(panelRef);

  if (reducedMotion) {
    return <div className="hero-reveal hero-reveal--static">{children}</div>;
  }

  return (
    <div className="hero-reveal">
      <div ref={panelRef} className="hero-reveal__panel">
        {children}
      </div>
    </div>
  );
}
