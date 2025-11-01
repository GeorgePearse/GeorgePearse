import { useState } from "react";
import type { RepositoryWithTags } from "../types/github";
import { RepositoryCard } from "./RepositoryCard";
import { ReadmeModal } from "./ReadmeModal";

interface RepositoryGridProps {
  repositories: RepositoryWithTags[];
}

interface ModalState {
  owner: string;
  repo: string;
}

export const RepositoryGrid = ({ repositories }: RepositoryGridProps) => {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  if (repositories.length === 0) {
    return <p className="empty-state">No repositories match the current filters.</p>;
  }

  const extractOwnerFromUrl = (url: string): string => {
    const match = url.match(/github\.com\/([^/]+)\//);
    return match ? match[1] : "";
  };

  return (
    <>
      <section className="repo-grid">
        {repositories.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repository={repo}
            onReadmeClick={() =>
              setModalState({
                owner: extractOwnerFromUrl(repo.html_url),
                repo: repo.name,
              })
            }
          />
        ))}
      </section>
      {modalState && (
        <ReadmeModal
          owner={modalState.owner}
          repo={modalState.repo}
          onClose={() => setModalState(null)}
        />
      )}
    </>
  );
};
