import type { PersonalProject, WorkProject } from '../content/types';

function isPersonalProject(
  project: WorkProject | PersonalProject,
): project is PersonalProject {
  return 'demoHref' in project;
}

export function ProjectCard({
  project,
}: {
  project: WorkProject | PersonalProject;
}) {
  const display = (
    <a href={project.href} className="project-display" id={project.id}>
      <img
        loading="lazy"
        src={`/images/${project.logo}`}
        className="project-logo"
        id={project.logoId}
        alt={project.title}
      />
      <img
        loading="lazy"
        src={project.preview}
        className="project-preview"
        alt={project.title}
      />
    </a>
  );

  const demoHref = isPersonalProject(project) ? project.demoHref : undefined;
  const demoLabel = isPersonalProject(project) ? project.demoLabel : undefined;

  const info = (
    <div className="project-info">
      <h3>{project.title}</h3>
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
      {demoHref && (
        <a className="demo-link" href={demoHref}>
          {demoLabel} &rarr;
        </a>
      )}
    </div>
  );

  return (
    <article className={`project-${project.orientation}`}>
      {project.displayFirst ? (
        <>
          {display}
          {info}
        </>
      ) : (
        <>
          {info}
          {display}
        </>
      )}
    </article>
  );
}
