import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ReadmeModalProps {
  owner: string;
  repo: string;
  onClose: () => void;
}

export const ReadmeModal = ({ owner, repo, onClose }: ReadmeModalProps) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/readme`,
          {
            headers: {
              Accept: "application/vnd.github.v3.raw",
            },
          }
        );

        if (!response.ok) {
          throw new Error("README not found");
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load README");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadme();
  }, [owner, repo]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="readme-modal-backdrop" onClick={onClose}>
      <div className="readme-modal" onClick={(e) => e.stopPropagation()}>
        <header className="readme-modal__header">
          <h2>{repo} README</h2>
          <button
            className="readme-modal__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path
                d="M18 6L6 18M6 6l12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="readme-modal__content">
          {isLoading && (
            <div className="readme-modal__loading">
              <div className="spinner"></div>
              <p>Loading README...</p>
            </div>
          )}
          {error && <p className="readme-modal__error">{error}</p>}
          {!isLoading && !error && (
            <div className="markdown-content">
              <Markdown
                components={{
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        style={(isDarkMode ? oneDark : oneLight) as any}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...rest}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
