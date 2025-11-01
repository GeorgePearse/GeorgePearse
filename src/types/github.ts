export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  homepage: string | null;
  topics?: string[];
  updated_at: string;
  archived: boolean;
  fork: boolean;
}

export interface RepositoryWithTags extends GitHubRepo {
  allTags: string[];
  docsUrl: string | null;
}
