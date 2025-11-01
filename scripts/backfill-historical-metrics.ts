import fs from "fs";
import path from "path";

interface DailyMetrics {
  date: string;
  totalCommits: number;
  totalStars: number;
  totalLinesOfCode: number;
}

interface RepoMetricsSnapshot {
  date: string;
  repos: Array<{
    name: string;
    stars: number;
    commits: number;
    loc: number;
  }>;
  aggregated: DailyMetrics;
}

interface HistoricalStorage {
  snapshots: RepoMetricsSnapshot[];
  lastUpdated: string;
}

interface CommitInfo {
  date: string;
  sha: string;
}

interface RepoProgress {
  name: string;
  completed: boolean;
  lastProcessedDate?: string;
  totalCommits: number;
  monthlySnapshots: Array<{
    month: string;
    commits: number;
    stars: number;
    loc: number;
  }>;
}

interface BackfillProgress {
  startedAt: string;
  lastUpdated: string;
  totalRepos: number;
  completedRepos: number;
  repoProgress: RepoProgress[];
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "GeorgePearse";
const HISTORICAL_DATA_PATH = path.join(
  process.cwd(),
  "data/historical-metrics.json"
);
const BACKFILL_PROGRESS_PATH = path.join(
  process.cwd(),
  "data/backfill-progress.json"
);
const BACKFILL_CACHE_DIR = path.join(process.cwd(), "data/backfill-cache");

// How far back to look (in months)
const LOOKBACK_MONTHS = 12;

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
  if (!fs.existsSync(BACKFILL_CACHE_DIR)) {
    fs.mkdirSync(BACKFILL_CACHE_DIR, { recursive: true });
  }
}

/**
 * Load backfill progress
 */
function loadBackfillProgress(): BackfillProgress | null {
  if (fs.existsSync(BACKFILL_PROGRESS_PATH)) {
    return JSON.parse(fs.readFileSync(BACKFILL_PROGRESS_PATH, "utf-8"));
  }
  return null;
}

/**
 * Save backfill progress
 */
function saveBackfillProgress(progress: BackfillProgress) {
  fs.writeFileSync(
    BACKFILL_PROGRESS_PATH,
    JSON.stringify(progress, null, 2)
  );
}

/**
 * Save individual repo cache
 */
function saveRepoCache(repoName: string, data: RepoProgress) {
  ensureCacheDir();
  const cachePath = path.join(
    BACKFILL_CACHE_DIR,
    `${repoName.replace(/\//g, "_")}.json`
  );
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
}

/**
 * Load individual repo cache
 */
function loadRepoCache(repoName: string): RepoProgress | null {
  const cachePath = path.join(
    BACKFILL_CACHE_DIR,
    `${repoName.replace(/\//g, "_")}.json`
  );
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  }
  return null;
}

/**
 * Get all commits for a repository with pagination
 */
async function getAllCommits(
  repo: string,
  since?: string
): Promise<CommitInfo[]> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is required");
  }

  const commits: CommitInfo[] = [];
  let page = 1;
  const perPage = 100;

  try {
    // Get default branch first
    const repoResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!repoResponse.ok) {
      console.warn(`Cannot access repo ${repo}: ${repoResponse.statusText}`);
      return [];
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || "main";

    while (true) {
      const url = new URL(
        `https://api.github.com/repos/${OWNER}/${repo}/commits`
      );
      url.searchParams.set("sha", defaultBranch);
      url.searchParams.set("per_page", perPage.toString());
      url.searchParams.set("page", page.toString());
      if (since) {
        url.searchParams.set("since", since);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Empty repository
          console.warn(`Repository ${repo} is empty`);
          return [];
        }
        console.warn(`Cannot fetch commits for ${repo}: ${response.statusText}`);
        break;
      }

      const pageCommits = await response.json();
      if (!Array.isArray(pageCommits) || pageCommits.length === 0) {
        break;
      }

      for (const commit of pageCommits) {
        commits.push({
          date: commit.commit.author.date,
          sha: commit.sha,
        });
      }

      console.log(
        `  Fetched page ${page} for ${repo}: ${pageCommits.length} commits (total: ${commits.length})`
      );

      // Check if there are more pages
      const linkHeader = response.headers.get("link");
      if (!linkHeader || !linkHeader.includes('rel="next"')) {
        break;
      }

      page++;

      // Rate limiting: pause between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error(`Error fetching commits for ${repo}:`, error);
  }

  return commits;
}

/**
 * Estimate lines of code from GitHub language statistics
 */
async function estimateRepositoryLOC(repo: string): Promise<number> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is required");
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/languages`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const languages = (await response.json()) as Record<string, number>;
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);

    // Rough estimate: average 40 bytes per line
    return Math.round(totalBytes / 40);
  } catch (error) {
    console.error(`Error estimating LOC for ${repo}:`, error);
    return 0;
  }
}

/**
 * Get current star count
 */
async function getCurrentStarCount(repo: string): Promise<number> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is required");
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error(`Error fetching stars for ${repo}:`, error);
    return 0;
  }
}

/**
 * Group commits by month
 */
function groupCommitsByMonth(commits: CommitInfo[]): Map<string, number> {
  const monthlyCommits = new Map<string, number>();

  for (const commit of commits) {
    const date = new Date(commit.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    monthlyCommits.set(monthKey, (monthlyCommits.get(monthKey) || 0) + 1);
  }

  return monthlyCommits;
}

/**
 * Generate cumulative monthly snapshots
 */
function generateCumulativeSnapshots(
  monthlyCommits: Map<string, number>,
  stars: number,
  loc: number
): Array<{ month: string; commits: number; stars: number; loc: number }> {
  const sortedMonths = Array.from(monthlyCommits.keys()).sort();
  const snapshots: Array<{
    month: string;
    commits: number;
    stars: number;
    loc: number;
  }> = [];

  let cumulativeCommits = 0;
  for (const month of sortedMonths) {
    cumulativeCommits += monthlyCommits.get(month) || 0;
    snapshots.push({
      month,
      commits: cumulativeCommits,
      stars, // Stars are current count (we don't have historical star data)
      loc, // LOC is current count
    });
  }

  return snapshots;
}

/**
 * Process a single repository
 */
async function processRepository(
  repo: any,
  progress: BackfillProgress
): Promise<RepoProgress> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Processing: ${repo.name}`);
  console.log(`${"=".repeat(60)}`);

  // Check if we have cached progress
  let repoProgress = loadRepoCache(repo.name);
  if (repoProgress?.completed) {
    console.log(`✓ Already completed (cached)`);
    return repoProgress;
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - LOOKBACK_MONTHS);

  console.log(`📅 Date range: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`);

  // Fetch all commits
  console.log(`📥 Fetching commit history...`);
  const commits = await getAllCommits(repo.name, startDate.toISOString());
  console.log(`✓ Found ${commits.length} commits in the lookback period`);

  // Get current metrics
  console.log(`📊 Fetching current metrics...`);
  const stars = await getCurrentStarCount(repo.name);
  const loc = await estimateRepositoryLOC(repo.name);
  console.log(`✓ Stars: ${stars}, LOC: ${loc.toLocaleString()}`);

  // Group by month and generate cumulative snapshots
  console.log(`📈 Generating monthly snapshots...`);
  const monthlyCommits = groupCommitsByMonth(commits);
  const monthlySnapshots = generateCumulativeSnapshots(
    monthlyCommits,
    stars,
    loc
  );
  console.log(`✓ Generated ${monthlySnapshots.length} monthly snapshots`);

  repoProgress = {
    name: repo.name,
    completed: true,
    totalCommits: commits.length,
    monthlySnapshots,
  };

  // Save individual repo cache
  saveRepoCache(repo.name, repoProgress);
  console.log(`💾 Cached progress for ${repo.name}`);

  return repoProgress;
}

/**
 * Aggregate all repo snapshots into historical metrics
 */
function aggregateSnapshots(allRepoProgress: RepoProgress[]): RepoMetricsSnapshot[] {
  // Collect all unique months
  const allMonths = new Set<string>();
  for (const repoProgress of allRepoProgress) {
    for (const snapshot of repoProgress.monthlySnapshots) {
      allMonths.add(snapshot.month);
    }
  }

  const sortedMonths = Array.from(allMonths).sort();
  const snapshots: RepoMetricsSnapshot[] = [];

  for (const month of sortedMonths) {
    // Get the last day of the month for the date
    const [year, monthNum] = month.split("-").map(Number);
    const lastDay = new Date(year, monthNum, 0);
    const dateStr = lastDay.toISOString().split("T")[0];

    let totalCommits = 0;
    let totalStars = 0;
    let totalLOC = 0;
    const repos: Array<{ name: string; stars: number; commits: number; loc: number }> = [];

    for (const repoProgress of allRepoProgress) {
      // Find the snapshot for this month or the most recent one before it
      let repoSnapshot = null;
      for (const snapshot of repoProgress.monthlySnapshots) {
        if (snapshot.month <= month) {
          repoSnapshot = snapshot;
        } else {
          break;
        }
      }

      if (repoSnapshot) {
        totalCommits += repoSnapshot.commits;
        totalStars += repoSnapshot.stars;
        totalLOC += repoSnapshot.loc;

        repos.push({
          name: repoProgress.name,
          stars: repoSnapshot.stars,
          commits: repoSnapshot.commits,
          loc: repoSnapshot.loc,
        });
      }
    }

    snapshots.push({
      date: dateStr,
      repos,
      aggregated: {
        date: dateStr,
        totalCommits,
        totalStars,
        totalLOC,
      },
    });
  }

  return snapshots;
}

/**
 * Main backfill process
 */
async function main() {
  console.log("🚀 Starting Historical Metrics Backfill");
  console.log("=".repeat(60));
  console.log(`Lookback period: ${LOOKBACK_MONTHS} months\n`);

  if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN environment variable is required!");
    console.error("   export GITHUB_TOKEN='your_token_here'\n");
    process.exit(1);
  }

  ensureCacheDir();

  // Load cached repos
  const cachedReposPath = path.join(
    process.cwd(),
    "src/data/cached-repos.json"
  );

  if (!fs.existsSync(cachedReposPath)) {
    console.error("❌ Error: cached-repos.json not found!");
    console.error("   Please run: npm run cache\n");
    process.exit(1);
  }

  const cachedReposData = JSON.parse(fs.readFileSync(cachedReposPath, "utf-8"));
  const repos = cachedReposData.repositories;

  console.log(`📊 Processing ${repos.length} repositories\n`);

  // Load or create progress
  let progress = loadBackfillProgress();
  if (!progress) {
    progress = {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalRepos: repos.length,
      completedRepos: 0,
      repoProgress: [],
    };
  }

  const allRepoProgress: RepoProgress[] = [];

  // Process each repository
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];

    console.log(`\n[${i + 1}/${repos.length}] ${repo.name}`);

    try {
      const repoProgress = await processRepository(repo, progress);
      allRepoProgress.push(repoProgress);

      if (repoProgress.completed) {
        progress.completedRepos = allRepoProgress.filter((r) => r.completed).length;
      }

      progress.lastUpdated = new Date().toISOString();
      saveBackfillProgress(progress);

      console.log(
        `\n✓ Progress: ${progress.completedRepos}/${progress.totalRepos} repos completed`
      );
    } catch (error) {
      console.error(`❌ Error processing ${repo.name}:`, error);
      console.log(`💾 Progress saved. You can resume later.\n`);
      // Continue to next repo instead of exiting
    }

    // Rate limiting between repos
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 AGGREGATING HISTORICAL DATA");
  console.log("=".repeat(60) + "\n");

  // Aggregate all snapshots
  const historicalSnapshots = aggregateSnapshots(allRepoProgress);
  console.log(`✓ Generated ${historicalSnapshots.length} historical snapshots\n`);

  // Save to historical metrics file
  const historicalData: HistoricalStorage = {
    snapshots: historicalSnapshots,
    lastUpdated: new Date().toISOString(),
  };

  const dir = path.dirname(HISTORICAL_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    HISTORICAL_DATA_PATH,
    JSON.stringify(historicalData, null, 2)
  );
  console.log(`💾 Historical data saved to: ${HISTORICAL_DATA_PATH}`);

  // Generate monthly metrics for frontend
  const metricsData = {
    generatedAt: new Date().toISOString(),
    metrics: historicalSnapshots.map((s) => s.aggregated),
  };

  const outputPath = path.join(process.cwd(), "src/data/repos-metrics.json");
  fs.writeFileSync(outputPath, JSON.stringify(metricsData, null, 2));
  console.log(`📊 Frontend metrics saved to: ${outputPath}`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ BACKFILL COMPLETE!");
  console.log("=".repeat(60));
  console.log(`Total snapshots: ${historicalSnapshots.length}`);
  console.log(`Repositories processed: ${progress.completedRepos}/${progress.totalRepos}`);
  console.log(`\nYou can now delete the backfill cache:`);
  console.log(`  rm -rf ${BACKFILL_CACHE_DIR}`);
  console.log(`  rm ${BACKFILL_PROGRESS_PATH}\n`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  console.log("\n💾 Progress has been saved. You can resume by running the script again.");
  process.exit(1);
});
