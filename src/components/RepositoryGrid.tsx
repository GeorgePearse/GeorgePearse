import { useState } from "react";
import type { RepositoryWithTags } from "../types/github";
import { RepositoryCard } from "./RepositoryCard";
import { ReadmeModal } from "./ReadmeModal";

interface RepositoryGridProps {
  repositories: RepositoryWithTags[];
}

export const RepositoryGrid = ({ repositories }: RepositoryGridProps) => {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);

  const handleReadmeClick = async (repo: RepositoryWithTags) => {
    setSelectedRepo(repo.name);
    setIsLoadingReadme(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.html_url.split("/").slice(-2).join("/")}/readme`,
        {
          headers: {
            Accept: "application/vnd.github.v3.raw",
          },
        }
      );
      if (response.ok) {
        const text = await response.text();
        setReadmeContent(text);
      } else {
        setReadmeContent(null);
      }
    } catch {
      setReadmeContent(null);
    } finally {
      setIsLoadingReadme(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedRepo(null);
    setReadmeContent(null);
  };

  if (repositories.length === 0) {
    return <p className="empty-state">No repositories match the current filters.</p>;
  }

  return (
    <>
      <section className="repo-grid">
        {repositories.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repository={repo}
            onReadmeClick={() => handleReadmeClick(repo)}
          />
        ))}
      </section>
      <ReadmeModal
        isOpen={selectedRepo !== null}
        repositoryName={selectedRepo || ""}
        readmeContent={readmeContent}
        isLoading={isLoadingReadme}
        onClose={handleCloseModal}
      />
    </>
  );
};
