import { useRef, type ReactNode } from 'react';
import { useHeroSlideOut } from '../../hooks/useHeroSlideOut';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { HeroRevealProvider, useHeroReveal } from './HeroRevealContext';

type HeroRevealProps = {
  children: ReactNode;
};

function HeroRevealInner({ children }: HeroRevealProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { setChanocasterActive } = useHeroReveal();

  useHeroSlideOut(panelRef, setChanocasterActive);

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

/** Fixed full-viewport hero that slides up on scroll to reveal sections below. */
export function HeroReveal({ children }: HeroRevealProps) {
  return (
    <HeroRevealProvider>
      <HeroRevealInner>{children}</HeroRevealInner>
    </HeroRevealProvider>
  );
}
