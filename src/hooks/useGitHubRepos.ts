import { useEffect, useMemo, useState } from "react";
import type { GitHubRepo, RepositoryWithTags } from "../types/github";

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

const PER_PAGE = 100;

const buildRequestHeaders = () => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (typeof token === "string" && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const normalise = (repo: GitHubRepo): RepositoryWithTags => {
  const repoTopics = repo.topics ?? [];
  const normalisedTopics = repoTopics.map((tag) => tag.toLowerCase());
  const homepage = typeof repo.homepage === "string" ? repo.homepage.trim() : "";
  const docsUrl = homepage.length > 0 ? homepage : `${repo.html_url}#readme`;

  return {
    ...repo,
    allTags: Array.from(new Set(normalisedTopics)),
    docsUrl,
  };
};

const fetchPage = async (username: string, page: number): Promise<GitHubRepo[]> => {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=${PER_PAGE}&page=${page}&sort=updated`,
    {
      headers: buildRequestHeaders(),
    }
  );

  if (!response.ok) {
    // Surface GitHub API rate limit headers when possible to aid debugging.
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    const rateLimitReset = response.headers.get("x-ratelimit-reset");
    const rateInfo = rateLimitRemaining
      ? `Rate limit remaining: ${rateLimitRemaining}. Resets at: ${rateLimitReset}`
      : undefined;

    throw new Error(
      `Failed to fetch repositories (status ${response.status}). ${rateInfo ?? ""}`.trim()
    );
  }

  const data = (await response.json()) as GitHubRepo[];
  return data;
};

export const useGitHubRepos = (options: UseGitHubReposOptions): UseGitHubReposResult => {
  const { username, includeArchived = false, includeForks = false } = options;
  const [repositories, setRepositories] = useState<RepositoryWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRepositories = async () => {
      setIsLoading(true);
      setError(null);

      const aggregated: GitHubRepo[] = [];
      let page = 1;

      try {
        while (true) {
          const pageData = await fetchPage(username, page);
          aggregated.push(...pageData);
          if (pageData.length < PER_PAGE) {
            break;
          }
          page += 1;
        }

        if (cancelled) {
          return;
        }

        const filtered = aggregated.filter((repo) => {
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

        setRepositories(normalised);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadRepositories();

    return () => {
      cancelled = true;
    };
  }, [username, includeArchived, includeForks]);

  const enhanced = useMemo(() => repositories, [repositories]);

  return { repositories: enhanced, isLoading, error };
};
