import { useEffect } from "react";
import { notesByPath, resolveNotePath } from "../data/notes";
import type { NoteRecord } from "../types/notes";
import { MarkdownContent } from "./MarkdownContent";

interface NoteModalProps {
  note: NoteRecord;
  onClose: () => void;
  onSelectNote: (path: string) => void;
}

export const NoteModal = ({ note, onClose, onSelectNote }: NoteModalProps) => {
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
            <p className="note-modal__eyebrow">{note.sectionLabel}</p>
            <h2>{note.title}</h2>
            <p className="note-modal__path">{note.path}</p>
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
            content={note.content}
            components={{
              a(props) {
                const { children, href = "", node: _node, ...rest } = props;
                const notePath = resolveNotePath(String(href), note.path);
                const targetNote = notePath ? notesByPath[notePath] : null;

                if (targetNote) {
                  return (
                    <a
                      href={href}
                      onClick={(event) => {
                        event.preventDefault();
                        onSelectNote(targetNote.path);
                      }}
                      {...rest}
                    >
                      {children}
                    </a>
                  );
                }

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
