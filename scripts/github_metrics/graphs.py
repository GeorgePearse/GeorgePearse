"""Graph generation for GitHub metrics using matplotlib."""

from datetime import datetime
from pathlib import Path
from typing import Union

import matplotlib.pyplot as plt
import matplotlib.dates as mdates

from .models import MetricsRecord


class MetricsGraphGenerator:
    """Generates SVG graphs for GitHub metrics."""

    # GitHub dark theme colors
    DARK_BG = "#0d1117"
    DARK_FG = "#c9d1d9"
    DARK_BORDER = "#30363d"
    ACCENT_BLUE = "#58a6ff"
    ACCENT_GREEN = "#3fb950"

    def __init__(self, output_dir: Union[str, Path]) -> None:
        """Initialize graph generator.

        Args:
            output_dir: Directory to save graph SVGs
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _setup_style(self) -> None:
        """Configure matplotlib for GitHub dark theme."""
        plt.rcParams["figure.facecolor"] = self.DARK_BG
        plt.rcParams["axes.facecolor"] = self.DARK_BG
        plt.rcParams["axes.edgecolor"] = self.DARK_BORDER
        plt.rcParams["text.color"] = self.DARK_FG
        plt.rcParams["axes.labelcolor"] = self.DARK_FG
        plt.rcParams["xtick.color"] = self.DARK_FG
        plt.rcParams["ytick.color"] = self.DARK_FG
        plt.rcParams["grid.color"] = self.DARK_BORDER
        plt.rcParams["grid.alpha"] = 0.3

    def generate_side_by_side_graphs(
        self, records: list[MetricsRecord]
    ) -> tuple[Path, Path]:
        """Generate side-by-side followers and stars graphs.

        Args:
            records: List of MetricsRecord objects

        Returns:
            Tuple of (followers_graph_path, stars_graph_path)
        """
        if not records:
            raise ValueError("No metrics records provided")

        self._setup_style()

        # Extract data
        dates = [r.date for r in records]
        followers = [r.followers for r in records]
        stars = [r.total_stars for r in records]

        # Create side-by-side graphs
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

        # Followers graph
        ax1.plot(
            dates,
            followers,
            color=self.ACCENT_BLUE,
            linewidth=2.5,
            marker="o",
            markersize=4,
        )
        ax1.set_title("Followers Over Time", fontsize=14, fontweight="bold", pad=15)
        ax1.set_xlabel("Date", fontsize=11)
        ax1.set_ylabel("Followers", fontsize=11)
        ax1.grid(True, alpha=0.2)
        ax1.xaxis.set_major_locator(mdates.MonthLocator())
        ax1.xaxis.set_major_formatter(mdates.DateFormatter("%b"))
        fig.autofmt_xdate(rotation=45, ha="right")

        # Add current value annotation
        if followers:
            latest_followers = followers[-1]
            ax1.text(
                0.98,
                0.95,
                f"Current: {latest_followers}",
                transform=ax1.transAxes,
                fontsize=11,
                verticalalignment="top",
                horizontalalignment="right",
                bbox=dict(
                    boxstyle="round",
                    facecolor=self.DARK_BORDER,
                    alpha=0.8,
                    edgecolor=self.ACCENT_BLUE,
                ),
            )

        # Stars graph
        ax2.plot(
            dates,
            stars,
            color=self.ACCENT_GREEN,
            linewidth=2.5,
            marker="o",
            markersize=4,
        )
        ax2.set_title("Total Repository Stars Over Time", fontsize=14, fontweight="bold", pad=15)
        ax2.set_xlabel("Date", fontsize=11)
        ax2.set_ylabel("Stars", fontsize=11)
        ax2.grid(True, alpha=0.2)
        ax2.xaxis.set_major_locator(mdates.MonthLocator())
        ax2.xaxis.set_major_formatter(mdates.DateFormatter("%b"))
        fig.autofmt_xdate(rotation=45, ha="right")

        # Add current value annotation
        if stars:
            latest_stars = stars[-1]
            ax2.text(
                0.98,
                0.95,
                f"Current: {latest_stars}",
                transform=ax2.transAxes,
                fontsize=11,
                verticalalignment="top",
                horizontalalignment="right",
                bbox=dict(
                    boxstyle="round",
                    facecolor=self.DARK_BORDER,
                    alpha=0.8,
                    edgecolor=self.ACCENT_GREEN,
                ),
            )

        plt.tight_layout()

        # Save both graphs in one figure
        combined_path = self.output_dir / "metrics_overview.svg"
        plt.savefig(combined_path, format="svg", facecolor=self.DARK_BG)
        plt.close()

        # Also generate individual graphs for flexibility
        followers_path = self._generate_single_graph(
            dates, followers, "Followers Over Time", self.ACCENT_BLUE, "followers_graph.svg"
        )
        stars_path = self._generate_single_graph(
            dates, stars, "Total Repository Stars", self.ACCENT_GREEN, "stars_graph.svg"
        )

        return followers_path, stars_path

    def _generate_single_graph(
        self,
        dates: list,
        values: list[int],
        title: str,
        color: str,
        filename: str,
    ) -> Path:
        """Generate a single graph.

        Args:
            dates: List of datetime objects
            values: List of values to plot
            title: Graph title
            color: Line color
            filename: Output filename

        Returns:
            Path to generated SVG
        """
        self._setup_style()

        fig, ax = plt.subplots(figsize=(10, 5))

        ax.plot(dates, values, color=color, linewidth=2.5, marker="o", markersize=5)
        ax.set_title(title, fontsize=14, fontweight="bold", pad=15)
        ax.set_xlabel("Date", fontsize=11)
        ax.set_ylabel("Count", fontsize=11)
        ax.grid(True, alpha=0.2)
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%b"))
        fig.autofmt_xdate(rotation=45, ha="right")

        # Add current value
        if values:
            current_value = values[-1]
            ax.text(
                0.98,
                0.95,
                f"Current: {current_value}",
                transform=ax.transAxes,
                fontsize=11,
                verticalalignment="top",
                horizontalalignment="right",
                bbox=dict(
                    boxstyle="round",
                    facecolor=self.DARK_BORDER,
                    alpha=0.8,
                    edgecolor=color,
                ),
            )

        plt.tight_layout()

        path = self.output_dir / filename
        plt.savefig(path, format="svg", facecolor=self.DARK_BG)
        plt.close()

        return path
