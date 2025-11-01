import { useEffect, useMemo, useState } from "react";
import type { GitHubRepo, RepositoryWithTags } from "../types/github";
import cachedReposData from "../data/cached-repos.json";

interface UseGitHubReposOptions {
  username: string;
  includeForks?: boolean;
  includeArchived?: boolean;
}

interface UseGitHubReposResult {
  repositories: RepositoryWithTags[];
  isLoading: boolean;
  error: string | null;
}

const normalise = (repo: GitHubRepo): RepositoryWithTags => {
  const repoTopics = repo.topics ?? [];
  const normalisedTopics = repoTopics.map((tag) => tag.toLowerCase());
  const homepage = typeof repo.homepage === "string" ? repo.homepage.trim() : "";
  const hasDocsLink = homepage.length > 0;
  const docsUrl = hasDocsLink ? homepage : null;

  return {
    ...repo,
    allTags: Array.from(new Set(normalisedTopics)),
    docsUrl,
    hasDocsLink,
  };
};

export const useGitHubRepos = (options: UseGitHubReposOptions): UseGitHubReposResult => {
  const { username, includeArchived = false, includeForks = false } = options;
  const [repositories, setRepositories] = useState<RepositoryWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processRepositories = (repos: GitHubRepo[]) => {
      const filtered = repos.filter((repo) => {
        if (!includeForks && repo.fork) {
          return false;
        }
        if (!includeArchived && repo.archived) {
          return false;
        }
        return true;
      });

      const normalised = filtered.map(normalise).sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      return normalised;
    };

    // Load from cache (instant, no API calls)
    if (
      cachedReposData &&
      typeof cachedReposData === "object" &&
      "repositories" in cachedReposData
    ) {
      const cached = cachedReposData as { repositories: GitHubRepo[] };
      const processed = processRepositories(cached.repositories);
      setRepositories(processed);
      setIsLoading(false);
      setError(null);
    } else {
      setError("No cached repository data available");
    }
  }, [username, includeArchived, includeForks]);

  const enhanced = useMemo(() => repositories, [repositories]);

  return { repositories: enhanced, isLoading, error };
};
