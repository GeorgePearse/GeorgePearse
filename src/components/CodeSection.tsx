import { useMemo, useState } from "react";
import { MetricsChart } from "./MetricsChart";
import { RepositoryGrid } from "./RepositoryGrid";
import { TagFilter } from "./TagFilter";
import type { TagMeta } from "./TagFilter";
import { useGitHubRepos } from "../hooks/useGitHubRepos";

const TAG_DESCRIPTION =
  "Tags are pulled directly from the repository topics you maintain on GitHub.";

type SortOption = "updated" | "stars" | "name";

export const CodeSection = ({ username }: { username: string }) => {
  const { repositories, isLoading, error } = useGitHubRepos({ username });
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("stars");

  const tags: TagMeta[] = useMemo(() => {
    const counts = new Map<string, number>();
    repositories.forEach((repo) => {
      repo.allTags.forEach((tag) => {
        const normalised = tag.toLowerCase();
        counts.set(normalised, (counts.get(normalised) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [repositories]);

  const languages: TagMeta[] = useMemo(() => {
    const counts = new Map<string, number>();
    repositories.forEach((repo) => {
      if (repo.language) {
        counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    const filtered = repositories.filter((repo) => {
      const matchesTag = activeTag ? repo.allTags.includes(activeTag) : true;
      if (!matchesTag) {
        return false;
      }

      const matchesLanguage = activeLanguage ? repo.language === activeLanguage : true;
      if (!matchesLanguage) {
        return false;
      }

      if (searchTerm.trim().length === 0) {
        return true;
      }

      const query = searchTerm.toLowerCase();
      return (
        repo.name.toLowerCase().includes(query) ||
        (repo.description ?? "").toLowerCase().includes(query) ||
        repo.allTags.some((tag) => tag.includes(query))
      );
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [repositories, activeTag, activeLanguage, searchTerm, sortBy]);

  return (
    <>
      <section id="code" className="section">
        <div className="section-header">
          <h2>Code</h2>
          <p className="subtitle">A searchable index of active, archived, and experimental work.</p>
          <p className="repo-count">
            Repositories indexed <span className="highlight-number">{repositories.length}</span>
          </p>
        </div>

        <div className="filters-panel">
          <div className="search-field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder="Search by name, description, or tag"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="tag-panel">
            <div className="tag-panel__header">
              <h3>Sort By</h3>
              <p>Order repositories by different criteria</p>
            </div>
            <div className="tag-filter">
              <button
                className={`tag-pill ${sortBy === "updated" ? "active" : ""}`}
                onClick={() => setSortBy("updated")}
                type="button"
              >
                Last Updated
              </button>
              <button
                className={`tag-pill ${sortBy === "stars" ? "active" : ""}`}
                onClick={() => setSortBy("stars")}
                type="button"
              >
                Stars
              </button>
              <button
                className={`tag-pill ${sortBy === "name" ? "active" : ""}`}
                onClick={() => setSortBy("name")}
                type="button"
              >
                Name
              </button>
            </div>
          </div>
          <div className="tag-panel">
            <div className="tag-panel__header">
              <h3>Languages</h3>
              <p>Filter by primary programming language</p>
            </div>
            {languages.length > 0 ? (
              <TagFilter
                tags={languages}
                activeTag={activeLanguage}
                onTagSelect={setActiveLanguage}
              />
            ) : (
              <p className="tag-panel__empty">No language data available.</p>
            )}
          </div>
          <div className="tag-panel">
            <div className="tag-panel__header">
              <h3>Tags</h3>
              <p>{TAG_DESCRIPTION}</p>
            </div>
            {tags.length > 0 ? (
              <TagFilter tags={tags} activeTag={activeTag} onTagSelect={setActiveTag} />
            ) : (
              <p className="tag-panel__empty">
                Add topics to your repositories on GitHub to see tags appear here.
              </p>
            )}
          </div>
        </div>

        {isLoading && <p className="status-message">Loading repositories…</p>}
        {error && (
          <div className="status-message error">
            <p>Unable to load repositories right now.</p>
            <p>
              {error} Try again later or add a GitHub token in a <code>.env.local</code> file using
              <code>VITE_GITHUB_TOKEN</code>.
            </p>
          </div>
        )}

        {!isLoading && !error && <RepositoryGrid repositories={filteredRepositories} />}
      </section>

      <MetricsChart />
    </>
  );
};
