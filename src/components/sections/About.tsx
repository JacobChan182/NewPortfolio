import { site } from '../../content/site';
import { ScrollReveal } from '../ui/ScrollReveal';

export function About() {
  return (
    <section id="about" className="section">
      <ScrollReveal>
        <h2 className="section__title">{site.about.title}</h2>
      </ScrollReveal>
      <div className="prose-grid">
        <ScrollReveal className="card" delay={80}>
          {site.about.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </ScrollReveal>
        <ScrollReveal className="card" delay={160}>
          {site.interests.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </ScrollReveal>
        <ScrollReveal className="card card--accent" delay={240}>
          <h3 className="card__title">{site.hireMe.title}</h3>
          {site.hireMe.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
