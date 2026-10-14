import { useRef } from 'react';
import type { SiteContent } from '../content/types';
import { useSectionFadeIn } from '../hooks/useSectionFadeIn';
import { ProjectCard } from './ProjectCard';

export function Projects({ projects }: { projects: SiteContent['projects'] }) {
  const ref = useRef<HTMLElement>(null);
  useSectionFadeIn(ref);

  return (
    <section className="section projects" id="projects" ref={ref}>
      <div className="section-title" id="projects-title">
        <h2>{projects.heading}</h2>
      </div>
      <h3 id="projects-subtitle">{projects.workSubtitle}</h3>

      <div className="section-center projects-center">
        {projects.work.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <h3 className="personal-projects-title text-center">
        {projects.personalHeading}
      </h3>
      <div className="section-center projects-center">
        {projects.personal.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
