# Real GitHub Metrics System

This guide explains the new real metrics collection system that replaces the synthetic data generation.

## Overview

The new system collects **real GitHub data** instead of generating synthetic historical trends. It builds up historical data over time by taking daily snapshots of your repositories.

## Key Changes

### What Changed

1. **New Script**: `scripts/gather-real-metrics.ts` replaces the old synthetic data generation
2. **Real Data Collection**: Fetches actual commit counts, stars, and lines of code from GitHub API
3. **Historical Snapshots**: Stores daily snapshots in `data/historical-metrics.json`
4. **Accumulated Data**: Builds real historical trends over time instead of generating fake ones

### Data Sources

- **Stars**: Real star counts from GitHub API
- **Commits**: Real commit counts per repository (all-time)
- **Lines of Code**: Estimated from GitHub language statistics (bytes / 40)

## How It Works

### 1. Daily Snapshots

The script runs daily (via GitHub Actions) and:
1. Fetches current metrics for all repositories
2. Creates a snapshot for today
3. Stores it in `data/historical-metrics.json`
4. Generates monthly aggregated data for charts

### 2. Data Files

- **`data/historical-metrics.json`**: Daily snapshots with per-repo breakdown
- **`src/data/repos-metrics.json`**: Monthly aggregated data used by the frontend
- **`src/data/cached-repos.json`**: Repository metadata cache

### 3. Automated Collection

GitHub Actions workflow (`.github/workflows/gather-real-metrics.yml`) runs:
- **Schedule**: Daily at 3 AM UTC
- **Trigger**: Can also be run manually via workflow_dispatch

## Usage

### Manual Execution

```bash
# Set your GitHub token
export GITHUB_TOKEN='your_personal_access_token'

# Gather real metrics
npm run metrics

# Or refresh cache and gather metrics
npm run metrics:refresh
```

### First Run

On the first run:
- The script will have only 1 day of data
- It will show a note that it's "building historical data"
- Each subsequent run adds more real data
- After 12+ months, you'll have a full year of real historical trends

### Requirements

**Required**: GitHub Personal Access Token with `public_repo` scope

Get a token at: https://github.com/settings/tokens

## Monitoring

The script provides detailed output:

```
🔍 Gathering real repository metrics from GitHub...

📊 Processing 92 repositories...

[1/92] my-repo... ✅ commits: 145, stars: 23, LOC: 12,450
[2/92] another-repo... ✅ commits: 67, stars: 5, LOC: 3,200
...

============================================================
📈 AGGREGATED REAL METRICS:
============================================================
Total Commits: 25,442
Total Stars: 71
Total Lines of Code: 3,012,571
============================================================
```

## Benefits

1. **Accuracy**: Shows real GitHub activity instead of synthetic trends
2. **Transparency**: Historical snapshots show exactly when data was collected
3. **Granularity**: Per-repository breakdown available in historical storage
4. **Growth Tracking**: Real trends emerge as you accumulate snapshots over time

## Migration Notes

The old `gather-metrics.ts` script is still available but deprecated. The new system:
- Requires a GitHub token (old script had a fallback to random data)
- Stores more detailed data (per-repo snapshots)
- Takes longer to run (real API calls vs. synthetic generation)
- Provides more accurate results

## Troubleshooting

### "GITHUB_TOKEN is required" Error

Set your token in the environment:
```bash
export GITHUB_TOKEN='ghp_your_token_here'
```

Or add it to your `.env` file (not committed to git):
```
GITHUB_TOKEN=ghp_your_token_here
```

### Rate Limiting

The script includes a 100ms delay between repository requests to avoid rate limits. If you have many repositories, the script may take a few minutes to complete.

### Missing Data

If a repository shows 0 commits or LOC:
- Check if the repository is empty
- Verify your token has access to the repository
- Check the console output for specific error messages

## Future Improvements

Potential enhancements:
- Add configurable date ranges for historical backfill
- Support for organization repositories
- More detailed commit activity (by author, time of day, etc.)
- Integration with GitHub Statistics API for contribution graphs
