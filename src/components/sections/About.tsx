import { ScrollReveal } from '../ui/ScrollReveal';
import aboutPhoto from '../media/IMG_5584.jpg';

// ── Edit your About Me text here ──────────────────────────────────────────────
const ABOUT_PARAGRAPHS = [
  "I'm Jacob, a Computer Science major at the University of Toronto.",
  "I'm from the San Francisco Bay Area, but as an American-Canadian dual citizen, I've always loved visiting Toronto and Ottawa during the holidays to see my extended family.",
  "I'm passionate about many things, including tech, music, food, swimming/lifting, and video games.",
  "Right now I'm focused on learning as much as I can, both through my academics and through building fun projects, and I can't wait to show off some of what I've done so far!",
];
// ─────────────────────────────────────────────────────────────────────────────

export function About() {
  return (
    <section id="about" className="section about-split">
      <ScrollReveal className="about-split__image-col">
        <img
          src={aboutPhoto}
          alt="Me and Goong Goong"
          className="about-split__photo"
        />
      </ScrollReveal>

      <ScrollReveal className="about-split__text-col" delay={120}>
        <h2 className="section__title">About Me</h2>
        {ABOUT_PARAGRAPHS.map((p) => (
          <p key={p.slice(0, 32)} className="about-split__p">{p}</p>
        ))}
      </ScrollReveal>
    </section>
  );
}
