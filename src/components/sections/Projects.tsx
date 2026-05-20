import { site } from '../../content/site';
import { ScrollReveal } from '../ui/ScrollReveal';

export function Projects() {
  return (
    <section id="projects" className="section">
      <ScrollReveal>
        <h2 className="section__title">{site.projects.title}</h2>
      </ScrollReveal>
      <div className="projects">
        {site.projects.items.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 80}>
            <article className={`project ${project.reverse ? 'project--reverse' : ''}`}>
              <div className="project__copy card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <p className="project__stack">{project.stack}</p>
              </div>
              <a className="project__media" href={project.href} target="_blank" rel="noopener noreferrer">
                <img src={project.image} alt={project.imageAlt} loading="lazy" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('project__media--placeholder');
                }} />
                <span className="project__media-fallback">{project.imageAlt}</span>
              </a>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}