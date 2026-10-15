import type { WorkProject } from '../content/types';

export function WorkProjectCard({ project }: { project: WorkProject }) {
  return (
    <article className="work-project-card">
      <a
        className="work-project-preview"
        href={project.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${project.title}`}
      >
        <img
          loading="lazy"
          src={`/images/${project.preview}`}
          alt={project.title}
        />
      </a>
      <div className="work-project-info">
        <h3>
          <a href={project.href} target="_blank" rel="noreferrer">
            {project.title}
          </a>
        </h3>
        <p className="rem1">{project.stack}</p>
        {project.clientLogos && (
          <div id="clients-logos-container">
            {project.clientLogos.map((client) => (
              <img
                key={client.id}
                loading="lazy"
                src={`/images/${client.src}`}
                className="client-logo"
                id={client.id}
                alt={client.alt}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
