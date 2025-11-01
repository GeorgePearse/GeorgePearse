import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "../utils/dates";
import { getTagColor } from "../utils/tagColors";
import { getProximityColor } from "../utils/proximityColor";
import type { RepositoryWithTags } from "../types/github";

interface RepositoryCardProps {
  repository: RepositoryWithTags;
  onReadmeClick?: () => void;
}

export const RepositoryCard = ({ repository, onReadmeClick }: RepositoryCardProps) => {
  const titleRef = useRef<HTMLAnchorElement>(null);
  const [titleColor, setTitleColor] = useState("rgb(37, 99, 235)"); // Default blue
  const {
    name,
    html_url: url,
    description,
    language,
    stargazers_count: stars,
    forks_count: forks,
    updated_at: updatedAt,
    allTags,
    docsUrl,
    hasDocsLink,
  } = repository;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        const color = getProximityColor(e.clientX, e.clientY, rect);
        setTitleColor(color);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <article className="repo-card">
      <header className="repo-card__header">
        <h3>
          <a
            ref={titleRef}
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ color: titleColor }}
          >
            {name}
          </a>
        </h3>
      </header>
      <div className="repo-card__actions">
        {onReadmeClick && (
          <button
            className="repo-card__readme"
            onClick={onReadmeClick}
            type="button"
            title="View README"
          >
            <span className="repo-card__readme-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
                  fill="currentColor"
                  opacity="0.5"
                />
                <path
                  d="M9 9h6M9 13h6M9 17h4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            README
          </button>
        )}
        {hasDocsLink && docsUrl && (
          <a className="repo-card__docs" href={docsUrl} target="_blank" rel="noreferrer">
            <span className="repo-card__docs-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path
                  d="M7 4a2 2 0 0 0-2 2v12.5A1.5 1.5 0 0 0 6.5 20h9a1.5 1.5 0 0 0 1.5-1.5v-11L14 4H7z"
                  fill="currentColor"
                  opacity="0.5"
                />
                <path
                  d="M14 4v3.5a1.5 1.5 0 0 0 1.5 1.5H17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12h4M9 15h2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Docs
          </a>
        )}
      </div>
      <p className="repo-card__description">{description || ""}</p>
      <dl className="repo-card__meta">
        {language && (
          <div className="repo-card__meta-item">
            <dt>Language</dt>
            <dd>{language}</dd>
          </div>
        )}
        <div className="repo-card__meta-item">
          <dt>Stars</dt>
          <dd>{stars}</dd>
        </div>
        <div className="repo-card__meta-item">
          <dt>Forks</dt>
          <dd>{forks}</dd>
        </div>
        <div className="repo-card__meta-item">
          <dt>Updated</dt>
          <dd>{formatDistanceToNow(updatedAt)}</dd>
        </div>
      </dl>
      <ul className="repo-card__tags">
        {allTags.map((tag) => {
          const colors = getTagColor(tag);
          return (
            <li
              key={tag}
              className="repo-card__tag"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              {tag}
            </li>
          );
        })}
      </ul>
    </article>
  );
};
