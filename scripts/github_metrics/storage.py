"""CSV storage for GitHub metrics."""

import csv
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Union

from .models import MetricsRecord


class MetricsStorage:
    """Manages reading and writing metrics to CSV file."""

    def __init__(self, csv_path: Union[str, Path]) -> None:
        """Initialize storage with CSV file path.

        Args:
            csv_path: Path to CSV file for storing metrics
        """
        self.csv_path = Path(csv_path)

    def _ensure_file_exists(self) -> None:
        """Ensure CSV file exists with headers."""
        if not self.csv_path.exists():
            self.csv_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.csv_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["date", "followers", "total_stars"])

    def load_metrics(self) -> List[MetricsRecord]:
        """Load all metrics records from CSV.

        Returns:
            List of MetricsRecord objects
        """
        self._ensure_file_exists()

        records: List[MetricsRecord] = []
        with open(self.csv_path, "r", newline="") as f:
            reader = csv.reader(f)
            next(reader)  # Skip header

            for row in reader:
                if row:  # Skip empty rows
                    try:
                        record = MetricsRecord.from_csv_row(",".join(row))
                        records.append(record)
                    except ValueError:
                        # Skip malformed rows
                        continue

        return records

    def add_record(self, record: MetricsRecord) -> None:
        """Add a single metrics record to CSV.

        Args:
            record: MetricsRecord to add
        """
        self._ensure_file_exists()

        # Check if today's record already exists
        existing = self.load_metrics()
        if existing and existing[-1].date.date() == record.date.date():
            # Update today's record instead of adding a duplicate
            self.update_latest_record(record)
            return

        with open(self.csv_path, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(
                [record.date.date(), record.followers, record.total_stars]
            )

    def update_latest_record(self, record: MetricsRecord) -> None:
        """Update the latest record in the CSV.

        Args:
            record: MetricsRecord to update with
        """
        self._ensure_file_exists()

        records = self.load_metrics()
        if not records:
            self.add_record(record)
            return

        # Replace the last record if it's from today
        if records[-1].date.date() == record.date.date():
            records[-1] = record
            self._write_all_records(records)

    def _write_all_records(self, records: List[MetricsRecord]) -> None:
        """Write all records to CSV (overwrite).

        Args:
            records: List of MetricsRecord objects to write
        """
        with open(self.csv_path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["date", "followers", "total_stars"])

            for record in records:
                writer.writerow(
                    [record.date.date(), record.followers, record.total_stars]
                )

    def get_latest_record(self) -> Optional[MetricsRecord]:
        """Get the most recent metrics record.

        Returns:
            The latest MetricsRecord or None if no records exist
        """
        records = self.load_metrics()
        return records[-1] if records else None

    def get_records_since(self, days_ago: int) -> List[MetricsRecord]:
        """Get metrics records from the last N days.

        Args:
            days_ago: Number of days to look back

        Returns:
            List of MetricsRecord objects from the last N days
        """
        cutoff = datetime.now() - __import__("datetime").timedelta(days=days_ago)
        all_records = self.load_metrics()
        return [r for r in all_records if r.date >= cutoff]
