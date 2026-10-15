import type { FeaturedClient as FeaturedClientContent } from '../content/types';

export function FeaturedClient({
  client,
}: {
  client: FeaturedClientContent;
}) {
  const siteLabel = client.href.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <article className="featured-client">
      <div className="featured-client-info">
        <p>{client.description}</p>
      </div>
      <a
        className="featured-client-window"
        href={client.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${siteLabel} in a new tab`}
      >
        <img
          loading="lazy"
          src={`/images/${client.preview}`}
          alt={client.heading}
        />
      </a>
    </article>
  );
}
