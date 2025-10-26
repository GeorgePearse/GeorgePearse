"""Main data collection and graph generation pipeline."""

import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Union

from .github_api import GitHubAPIClient
from .graphs import MetricsGraphGenerator
from .models import MetricsRecord
from .storage import MetricsStorage


class MetricsCollector:
    """Collects GitHub metrics and generates graphs."""

    def __init__(
        self,
        username: str,
        csv_path: Union[str, Path] = "data/metrics.csv",
        output_dir: Union[str, Path] = "assets",
    ) -> None:
        """Initialize metrics collector.

        Args:
            username: GitHub username
            csv_path: Path to CSV file for storing metrics
            output_dir: Directory for output graph SVGs
        """
        self.username = username
        self.api_client = GitHubAPIClient(username)
        self.storage = MetricsStorage(csv_path)
        self.graph_generator = MetricsGraphGenerator(output_dir)

    def collect_current_metrics(self) -> MetricsRecord:
        """Collect current GitHub metrics from API.

        Returns:
            MetricsRecord with current metrics
        """
        user_info = self.api_client.get_user_info()
        total_stars = self.api_client.get_total_stars(only_public=True)

        record = MetricsRecord(
            date=datetime.now(),
            followers=user_info.followers,
            total_stars=total_stars,
        )

        return record

    def backfill_historical_data(self, days_back: int = 30) -> None:
        """Attempt to backfill historical data from API.

        This is a simplified approach - GitHub API doesn't provide historical
        metrics, so we can use the stargazer timeline for repos to estimate
        past star counts. For now, this is a placeholder that creates daily
        entries from current data going back.

        Args:
            days_back: Number of days to backfill
        """
        existing_records = self.storage.load_metrics()

        # If we already have data, don't backfill
        if existing_records:
            return

        current_metrics = self.collect_current_metrics()

        # Generate estimated historical data (same values for past N days)
        # In a real implementation, you'd use GitHub's stargazer timeline
        for i in range(days_back, 0, -1):
            record = MetricsRecord(
                date=datetime.now() - timedelta(days=i),
                followers=current_metrics.followers,
                total_stars=current_metrics.total_stars,
            )
            self.storage.add_record(record)

    def update_and_generate_graphs(self) -> tuple[Path, Path]:
        """Update metrics and generate graphs.

        Returns:
            Tuple of (followers_graph_path, stars_graph_path)
        """
        # Collect current metrics
        current_record = self.collect_current_metrics()

        # Add to storage
        self.storage.add_record(current_record)

        # Load all records for graph generation
        all_records = self.storage.load_metrics()

        # Generate graphs
        followers_path, stars_path = self.graph_generator.generate_side_by_side_graphs(
            all_records
        )

        return followers_path, stars_path

    def run(self, backfill: bool = False) -> Dict:
        """Run the full metrics collection and graph generation pipeline.

        Args:
            backfill: Whether to backfill historical data on first run

        Returns:
            Dictionary with results
        """
        print(f"Collecting metrics for user: {self.username}")

        # Backfill if requested and no data exists
        if backfill:
            print("Attempting to backfill historical data...")
            self.backfill_historical_data(days_back=30)

        # Update metrics and generate graphs
        print("Updating current metrics...")
        followers_path, stars_path = self.update_and_generate_graphs()

        # Get latest record for logging
        latest = self.storage.get_latest_record()

        result = {
            "success": True,
            "message": f"Collected metrics for {self.username}",
            "followers": latest.followers if latest else None,
            "total_stars": latest.total_stars if latest else None,
            "followers_graph": str(followers_path),
            "stars_graph": str(stars_path),
        }

        return result


if __name__ == "__main__":
    username = os.getenv("GITHUB_USERNAME", "GeorgePearse")
    collector = MetricsCollector(
        username=username,
        csv_path="data/metrics.csv",
        output_dir="assets",
    )

    # Run with backfill on first execution
    result = collector.run(backfill=True)
    print(f"Result: {result}")
