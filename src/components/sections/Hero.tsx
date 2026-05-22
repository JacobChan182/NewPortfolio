import { useRef } from 'react';
import { site } from '../../content/site';
import { ChanocasterHeroLogo } from '../three/ChanocasterBackground';
import { ScrollReveal } from '../ui/ScrollReveal';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section id="home" ref={heroRef} className="section hero hero--draggable">
      <div className="hero__layout">
        <div className="hero__content">
          <ScrollReveal>
            <p className="hero__brand">{site.brand}</p>
            <p className="hero__tagline">{site.hero.tagline}</p>
          </ScrollReveal>
        </div>
        <ChanocasterHeroLogo eventSourceRef={heroRef} />
      </div>
    </section>
  );
}
