import { useRef } from 'react';
import type { SiteContent } from '../content/types';
import { useSectionFadeIn } from '../hooks/useSectionFadeIn';
import { WorkProjectCard } from './WorkProjectCard';
import { AIProjectCard } from './AIProjectCard';
import { FeaturedClient } from './FeaturedClient';

export function Projects({ projects }: { projects: SiteContent['projects'] }) {
  const ref = useRef<HTMLElement>(null);
  useSectionFadeIn(ref);

  return (
    <section className="section projects" id="projects" ref={ref}>
      <div className="section-title" id="projects-title">
        <h2>{projects.heading}</h2>
      </div>

      <h3 className="personal-projects-title text-center">
        {projects.aiHeading}
      </h3>
      <div className="section-center ai-projects-grid">
        {projects.ai.map((project) => (
          <AIProjectCard key={project.id} project={project} />
        ))}
      </div>

      <h3 className="personal-projects-title text-center">
        {projects.featuredClient.heading}
      </h3>
      <div className="section-center">
        <FeaturedClient client={projects.featuredClient} />
      </div>

      <h3 className="personal-projects-title text-center">
        {projects.workSubtitle}
      </h3>
      <div className="section-center work-projects-grid">
        {projects.work.map((project) => (
          <WorkProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
