import { useState } from 'react';
import type { AIProject } from '../content/types';
import { GitHubIcon, PlayIcon } from '../icons';

export function AIProjectCard({ project }: { project: AIProject }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <article className="ai-project-card">
      <div className="ai-project-video">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${project.youtubeId}?autoplay=1`}
            title={project.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="ai-project-video-trigger"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${project.title} demo video`}
          >
            <img
              loading="lazy"
              src={`https://img.youtube.com/vi/${project.youtubeId}/hqdefault.jpg`}
              alt={project.title}
            />
            <span className="ai-project-play-icon">
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      <div className="ai-project-info">
        <h3>
          <a href={project.liveHref} target="_blank" rel="noreferrer">
            {project.title}
          </a>
        </h3>
        <p className="rem1">{project.stack}</p>
        <a
          className="ai-project-repo-link"
          href={project.repoHref}
          target="_blank"
          rel="noreferrer"
          aria-label="View source code on GitHub"
        >
          <GitHubIcon />
        </a>
      </div>
    </article>
  );
}
