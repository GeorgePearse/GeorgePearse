"""Data models for GitHub metrics."""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class MetricsRecord:
    """A single record of GitHub metrics at a point in time."""

    date: datetime
    followers: int
    total_stars: int

    def to_csv_row(self) -> str:
        """Convert record to CSV row."""
        return f"{self.date.date()},{self.followers},{self.total_stars}"

    @classmethod
    def from_csv_row(cls, row: str) -> "MetricsRecord":
        """Create record from CSV row."""
        parts = row.strip().split(",")
        if len(parts) != 3:
            raise ValueError(f"Invalid CSV row: {row}")

        date_str, followers_str, stars_str = parts
        return cls(
            date=datetime.strptime(date_str, "%Y-%m-%d"),
            followers=int(followers_str),
            total_stars=int(stars_str),
        )


@dataclass
class GitHubUser:
    """GitHub user information."""

    username: str
    followers: int


@dataclass
class GitHubRepo:
    """GitHub repository information."""

    name: str
    stars: int
    is_public: bool
