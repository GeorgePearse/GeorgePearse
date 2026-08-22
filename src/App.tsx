import { useEffect, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { CodeSection } from "./components/CodeSection";
import { WritingSection } from "./components/WritingSection";

const GITHUB_USERNAME = "GeorgePearse";

type View = "writing" | "code";

const VIEWS: Array<{ id: View; label: string; blurb: string }> = [
  { id: "writing", label: "Writing", blurb: "Posts and notes" },
  { id: "code", label: "Code", blurb: "Repositories and metrics" },
];

const isView = (value: string): value is View => VIEWS.some((view) => view.id === value);

/** The hash is the shareable handle for a view, so #code deep-links to Code. */
const viewFromHash = (): View => {
  const hash = window.location.hash.replace("#", "");
  return isView(hash) ? hash : "writing";
};

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);

  useEffect(() => {
    const syncFromHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const selectView = (next: View) => {
    setView(next);
    // replaceState rather than assigning location.hash: this keeps the back
    // button meaningful instead of stacking one entry per tab click.
    window.history.replaceState(null, "", `#${next}`);
  };

  return (
    <div className="app-shell">
      <main>
        <AboutSection />

        <nav className="view-nav" aria-label="Sections">
          {VIEWS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`view-nav__tab ${view === entry.id ? "active" : ""}`}
              aria-current={view === entry.id ? "page" : undefined}
              onClick={() => selectView(entry.id)}
            >
              <span className="view-nav__label">{entry.label}</span>
              <span className="view-nav__blurb">{entry.blurb}</span>
            </button>
          ))}
        </nav>

        {view === "writing" ? <WritingSection /> : <CodeSection username={GITHUB_USERNAME} />}
      </main>

      <footer className="footer">
        <p>
          Built with React &amp; Vite. Repository data fetched live from GitHub for the{" "}
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
            @{GITHUB_USERNAME}
          </a>{" "}
          account.
        </p>
      </footer>
    </div>
  );
}
