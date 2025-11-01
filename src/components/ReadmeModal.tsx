import { useEffect, useRef } from "react";

interface ReadmeModalProps {
  isOpen: boolean;
  repositoryName: string;
  readmeContent: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export const ReadmeModal = ({
  isOpen,
  repositoryName,
  readmeContent,
  isLoading,
  onClose,
}: ReadmeModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="readme-modal-overlay" ref={modalRef}>
      <div className="readme-modal">
        <div className="readme-modal__header">
          <h2>{repositoryName}</h2>
          <button
            className="readme-modal__close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
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
        </div>

        <div className="readme-modal__content">
          {isLoading && (
            <p className="readme-modal__loading">Loading README...</p>
          )}
          {!isLoading && readmeContent ? (
            <pre className="readme-modal__body">
              {readmeContent}
            </pre>
          ) : (
            !isLoading && (
              <p className="readme-modal__empty">
                No README found for this repository.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};
