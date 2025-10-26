"""GitHub API client for fetching metrics."""

import os
from typing import List, Optional

import requests

from .models import GitHubRepo, GitHubUser


class GitHubAPIClient:
    """Client for fetching data from the GitHub API."""

    BASE_URL = "https://api.github.com"

    def __init__(self, username: str, token: Optional[str] = None) -> None:
        """Initialize GitHub API client.

        Args:
            username: GitHub username
            token: GitHub personal access token (optional, for higher rate limits)
        """
        self.username = username
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.session = requests.Session()
        if self.token:
            self.session.headers.update({"Authorization": f"token {self.token}"})

    def get_user_info(self) -> GitHubUser:
        """Fetch user information including follower count.

        Returns:
            GitHubUser with username and followers count

        Raises:
            requests.RequestException: If API request fails
        """
        url = f"{self.BASE_URL}/users/{self.username}"
        response = self.session.get(url)
        response.raise_for_status()

        data = response.json()
        return GitHubUser(username=self.username, followers=data["followers"])

    def get_all_repos(self, only_public: bool = True) -> List[GitHubRepo]:
        """Fetch all repositories for the user.

        Args:
            only_public: If True, only return public repositories

        Returns:
            List of GitHubRepo objects

        Raises:
            requests.RequestException: If API request fails
        """
        repos: List[GitHubRepo] = []
        page = 1
        per_page = 100

        while True:
            url = f"{self.BASE_URL}/users/{self.username}/repos"
            params = {"page": page, "per_page": per_page, "sort": "updated"}

            response = self.session.get(url, params=params)
            response.raise_for_status()

            data = response.json()
            if not data:
                break

            for repo_data in data:
                if only_public and repo_data["private"]:
                    continue

                repos.append(
                    GitHubRepo(
                        name=repo_data["name"],
                        stars=repo_data["stargazers_count"],
                        is_public=not repo_data["private"],
                    )
                )

            page += 1

        return repos

    def get_total_stars(self, only_public: bool = True) -> int:
        """Get total stars across all repositories.

        Args:
            only_public: If True, only count stars from public repositories

        Returns:
            Total number of stars
        """
        repos = self.get_all_repos(only_public=only_public)
        return sum(repo.stars for repo in repos)
