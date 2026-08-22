import { useEffect } from "react";
import type { PostRecord } from "../types/writing";
import { MarkdownContent } from "./MarkdownContent";
import { formatPostDate } from "../utils/dates";

interface PostModalProps {
  post: PostRecord;
  onClose: () => void;
}

export const PostModal = ({ post, onClose }: PostModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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
      <div className="readme-modal" onClick={(event) => event.stopPropagation()}>
        <header className="readme-modal__header">
          <div className="note-modal__title">
            <p className="note-modal__eyebrow">
              {formatPostDate(post.date)} · {post.readingMinutes} min read
            </p>
            <h2>{post.title}</h2>
            {post.canonical && (
              <p className="note-modal__path">
                Originally published on{" "}
                <a href={post.canonical} target="_blank" rel="noreferrer">
                  Medium
                </a>
              </p>
            )}
          </div>
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
          <MarkdownContent
            content={post.content}
            components={{
              a(props) {
                const { children, href = "", node: _node, ...rest } = props;
                const isExternal = /^(https?:)?\/\//.test(String(href));

                return (
                  <a
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    {...rest}
                  >
                    {children}
                  </a>
                );
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
