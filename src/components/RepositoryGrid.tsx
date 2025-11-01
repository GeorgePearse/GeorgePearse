import type { RepositoryWithTags } from "../types/github";
import { RepositoryCard } from "./RepositoryCard";

interface RepositoryGridProps {
  repositories: RepositoryWithTags[];
}

export const RepositoryGrid = ({ repositories }: RepositoryGridProps) => {
  if (repositories.length === 0) {
    return <p className="empty-state">No repositories match the current filters.</p>;
  }

  return (
    <section className="repo-grid">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </section>
  );
};
