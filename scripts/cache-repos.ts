#!/usr/bin/env node

/**
 * Cache all GitHub repositories data locally
 * Fetches repository data from GitHub API and stores it as JSON for offline availability
 * Run via: npx ts-node scripts/cache-repos.ts
 */

import fs from "fs";
import path from "path";

const GITHUB_USERNAME = "GeorgePearse";
const CACHE_DIR = path.join(process.cwd(), "src", "data");
const CACHE_FILE = path.join(CACHE_DIR, "cached-repos.json");
const PER_PAGE = 100;

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  topics: string[];
  stargazers_count: number;
  watchers_count: number;
}

async function fetchRepositories(): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const repositories: GitHubRepo[] = [];
  let page = 1;

  console.log(`Fetching repositories for @${GITHUB_USERNAME}...`);

  while (true) {
    const url = new URL(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos`
    );
    url.searchParams.set("per_page", PER_PAGE.toString());
    url.searchParams.set("page", page.toString());
    url.searchParams.set("sort", "updated");

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch page ${page}: ${response.status} ${response.statusText}`
      );
      console.error(errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const pageData = (await response.json()) as GitHubRepo[];

    if (pageData.length === 0) {
      break;
    }

    repositories.push(...pageData);
    console.log(`  Fetched page ${page}: ${pageData.length} repos`);

    if (pageData.length < PER_PAGE) {
      break;
    }

    page += 1;
  }

  console.log(`Total repositories fetched: ${repositories.length}`);
  return repositories;
}

async function cacheRepositories(): Promise<void> {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log(`Created cache directory: ${CACHE_DIR}`);
    }

    // Fetch fresh data
    const repos = await fetchRepositories();

    // Create cache object with timestamp
    const cache = {
      timestamp: new Date().toISOString(),
      username: GITHUB_USERNAME,
      repositoryCount: repos.length,
      repositories: repos,
    };

    // Write to cache file
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`\n✓ Cache updated: ${CACHE_FILE}`);
    console.log(`  Repositories cached: ${repos.length}`);
    console.log(`  Cache timestamp: ${cache.timestamp}`);
  } catch (error) {
    console.error("Error caching repositories:", error);
    process.exit(1);
  }
}

// Run the cache function
cacheRepositories();
