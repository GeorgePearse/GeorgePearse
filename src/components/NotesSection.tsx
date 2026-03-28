import { useMemo, useState } from "react";
import { notes, notesByPath } from "../data/notes";
import { NoteModal } from "./NoteModal";

const searchNote = (query: string, ...values: string[]) => {
  const normalisedQuery = query.trim().toLowerCase();
  if (normalisedQuery.length === 0) {
    return true;
  }

  return values.some((value) => value.toLowerCase().includes(normalisedQuery));
};

export const NotesSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNotePath, setActiveNotePath] = useState<string | null>(null);

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) =>
        searchNote(searchTerm, note.title, note.sectionLabel, note.path, note.summary, note.content)
      ),
    [searchTerm]
  );

  const activeNote = activeNotePath ? notesByPath[activeNotePath] : null;

  return (
    <section id="notes" className="section">
      <div className="section-header">
        <h2>Notes</h2>
        <p className="subtitle">Imported locally from the notes repo and readable in-app.</p>
        <p className="repo-count">
          Notes imported <span className="highlight-number">{notes.length}</span>
        </p>
      </div>

      <div className="filters-panel notes-toolbar">
        <div className="search-field">
          <label htmlFor="notes-search">Search Notes</label>
          <input
            id="notes-search"
            type="search"
            placeholder="Search by title, topic, path, or content"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {filteredNotes.length > 0 ? (
        <section className="note-grid">
          {filteredNotes.map((note) => (
            <article key={note.id} className="note-card">
              <p className="note-card__eyebrow">{note.sectionLabel}</p>
              <h3>
                <button
                  type="button"
                  className="note-card__title"
                  onClick={() => setActiveNotePath(note.path)}
                >
                  {note.title}
                </button>
              </h3>
              <p className="note-card__summary">{note.summary}</p>
              <p className="note-card__path">{note.path}</p>
              <div className="note-card__actions">
                <button
                  type="button"
                  className="note-card__open"
                  onClick={() => setActiveNotePath(note.path)}
                >
                  Open Note
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="empty-state">No notes match the current search.</p>
      )}

      {activeNote && (
        <NoteModal
          note={activeNote}
          onClose={() => setActiveNotePath(null)}
          onSelectNote={setActiveNotePath}
        />
      )}
    </section>
  );
};
