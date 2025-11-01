import fs from "fs";
import path from "path";

interface DailyMetrics {
  date: string;
  totalCommits: number;
  totalStars: number;
  totalLinesOfCode: number;
}

interface MetricsData {
  generatedAt: string;
  metrics: DailyMetrics[];
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

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "GeorgePearse";
const HISTORICAL_DATA_PATH = path.join(
  process.cwd(),
  "data/historical-metrics.json"
);

/**
 * Fetches total commits for a repository (all-time count)
 */
async function getRepoCommitCount(repo: string): Promise<number> {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "GITHUB_TOKEN is required. Please set it in your environment."
    );
  }

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
      return 0;
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || "main";

    // Get commit count from the default branch
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/commits?sha=${defaultBranch}&per_page=1`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `Cannot fetch commits for ${repo}: ${response.statusText}`
      );
      return 0;
    }

    // Parse Link header to get total count
    const linkHeader = response.headers.get("link");
    if (!linkHeader) {
      // If no link header, there's probably just 1 commit or none
      const commits = await response.json();
      return Array.isArray(commits) && commits.length > 0 ? 1 : 0;
    }

    // Parse the "last" link to get total page count
    const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (lastMatch) {
      return parseInt(lastMatch[1], 10);
    }

    return 1;
  } catch (error) {
    console.error(`Error fetching commits for ${repo}:`, error);
    return 0;
  }
}

/**
 * Estimate lines of code from GitHub language statistics
 */
async function estimateRepositoryLOC(repo: string): Promise<number> {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "GITHUB_TOKEN is required. Please set it in your environment."
    );
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
      console.warn(`Cannot fetch languages for ${repo}: ${response.statusText}`);
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
 * Load existing historical data
 */
function loadHistoricalData(): HistoricalStorage {
  if (fs.existsSync(HISTORICAL_DATA_PATH)) {
    const data = fs.readFileSync(HISTORICAL_DATA_PATH, "utf-8");
    return JSON.parse(data);
  }
  return {
    snapshots: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save historical data
 */
function saveHistoricalData(data: HistoricalStorage): void {
  const dir = path.dirname(HISTORICAL_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(HISTORICAL_DATA_PATH, JSON.stringify(data, null, 2));
}

/**
 * Generate monthly aggregated metrics from snapshots
 */
function generateMonthlyMetrics(snapshots: RepoMetricsSnapshot[]): DailyMetrics[] {
  if (snapshots.length === 0) {
    return [];
  }

  // Group snapshots by month
  const monthlyGroups = new Map<string, RepoMetricsSnapshot[]>();

  for (const snapshot of snapshots) {
    const date = new Date(snapshot.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, []);
    }
    monthlyGroups.get(monthKey)!.push(snapshot);
  }

  // Take the last snapshot from each month
  const monthlyMetrics: DailyMetrics[] = [];
  const sortedMonths = Array.from(monthlyGroups.keys()).sort();

  for (const monthKey of sortedMonths) {
    const snapshotsInMonth = monthlyGroups.get(monthKey)!;
    // Take the last snapshot of the month
    const lastSnapshot = snapshotsInMonth[snapshotsInMonth.length - 1];
    monthlyMetrics.push(lastSnapshot.aggregated);
  }

  return monthlyMetrics;
}

/**
 * Collect current real metrics from GitHub
 */
async function collectCurrentMetrics() {
  console.log("🔍 Gathering real repository metrics from GitHub...\n");

  if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN environment variable is required!");
    console.error("   Please set your GitHub personal access token:");
    console.error("   export GITHUB_TOKEN='your_token_here'\n");
    process.exit(1);
  }

  // Load cached repos data
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

  if (
    !cachedReposData.repositories ||
    !Array.isArray(cachedReposData.repositories)
  ) {
    console.error("❌ Error: Invalid cached repos data");
    process.exit(1);
  }

  const repos = cachedReposData.repositories;
  console.log(`📊 Processing ${repos.length} repositories...\n`);

  // Collect metrics for each repo
  const repoMetrics: Array<{
    name: string;
    stars: number;
    commits: number;
    loc: number;
  }> = [];

  let totalCommits = 0;
  let totalStars = 0;
  let totalLOC = 0;

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const progress = `[${i + 1}/${repos.length}]`;

    process.stdout.write(`${progress} ${repo.name}...`);

    // Get real data
    const commits = await getRepoCommitCount(repo.name);
    const stars = repo.stargazers_count || 0;
    const loc = await estimateRepositoryLOC(repo.name);

    repoMetrics.push({
      name: repo.name,
      stars,
      commits,
      loc,
    });

    totalCommits += commits;
    totalStars += stars;
    totalLOC += loc;

    console.log(` ✅ commits: ${commits}, stars: ${stars}, LOC: ${loc.toLocaleString()}`);

    // Rate limiting: pause briefly between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n" + "=".repeat(60));
  console.log("📈 AGGREGATED REAL METRICS:");
  console.log("=".repeat(60));
  console.log(`Total Commits: ${totalCommits.toLocaleString()}`);
  console.log(`Total Stars: ${totalStars.toLocaleString()}`);
  console.log(`Total Lines of Code: ${totalLOC.toLocaleString()}`);
  console.log("=".repeat(60) + "\n");

  return {
    repoMetrics,
    aggregated: {
      date: new Date().toISOString().split("T")[0],
      totalCommits,
      totalStars,
      totalLinesOfCode: totalLOC,
    },
  };
}

async function main() {
  try {
    // Collect current real metrics
    const { repoMetrics, aggregated } = await collectCurrentMetrics();

    // Load historical data
    const historicalData = loadHistoricalData();

    // Create today's snapshot
    const today = new Date().toISOString().split("T")[0];
    const newSnapshot: RepoMetricsSnapshot = {
      date: today,
      repos: repoMetrics,
      aggregated,
    };

    // Check if we already have a snapshot for today
    const existingIndex = historicalData.snapshots.findIndex(
      (s) => s.date === today
    );

    if (existingIndex >= 0) {
      console.log("📝 Updating today's snapshot...\n");
      historicalData.snapshots[existingIndex] = newSnapshot;
    } else {
      console.log("📝 Adding new snapshot for today...\n");
      historicalData.snapshots.push(newSnapshot);
    }

    // Sort snapshots by date
    historicalData.snapshots.sort((a, b) => a.date.localeCompare(b.date));
    historicalData.lastUpdated = new Date().toISOString();

    // Save historical data
    saveHistoricalData(historicalData);
    console.log(`💾 Historical data saved to: ${HISTORICAL_DATA_PATH}`);
    console.log(`   Total snapshots: ${historicalData.snapshots.length}\n`);

    // Generate monthly metrics for the chart
    const monthlyMetrics = generateMonthlyMetrics(historicalData.snapshots);

    // If we have less than 12 months of data, we need to show what we have
    const metricsData: MetricsData = {
      generatedAt: new Date().toISOString(),
      metrics: monthlyMetrics,
    };

    // Write metrics data for the frontend
    const outputPath = path.join(process.cwd(), "src/data/repos-metrics.json");
    fs.writeFileSync(outputPath, JSON.stringify(metricsData, null, 2));

    console.log(`📊 Metrics output saved to: ${outputPath}`);
    console.log(`   Data points: ${monthlyMetrics.length}\n`);

    if (monthlyMetrics.length < 12) {
      console.log("⚠️  Note: Building real historical data over time.");
      console.log(
        `   Currently have ${monthlyMetrics.length} month(s) of real data.`
      );
      console.log(
        "   Run this script daily to accumulate more historical snapshots.\n"
      );
    }

    console.log("✅ Done! All metrics are based on real GitHub data.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
