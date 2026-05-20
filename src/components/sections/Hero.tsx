import { site } from '../../content/site';
import { ScrollReveal } from '../ui/ScrollReveal';

export function Hero() {
  return (
    <section id="home" className="section hero">
      <div className="hero__content">
        <ScrollReveal>
          <p className="hero__brand">{site.brand}</p>
          <p className="hero__tagline">{site.hero.tagline}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
