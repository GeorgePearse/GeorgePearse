import { useMemo, useState } from "react";
import { posts, postTags, postsById } from "../data/writing";
import { NotesSection } from "./NotesSection";
import { PostModal } from "./PostModal";
import { TagFilter } from "./TagFilter";
import { formatPostDate } from "../utils/dates";

const matchesSearch = (query: string, ...values: string[]) => {
  const normalised = query.trim().toLowerCase();
  if (normalised.length === 0) {
    return true;
  }

  return values.some((value) => value.toLowerCase().includes(normalised));
};

export const WritingSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const tags = useMemo(
    () =>
      postTags.map((tag) => ({
        label: tag,
        count: posts.filter((post) => post.tags.includes(tag)).length,
      })),
    []
  );

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (activeTag && !post.tags.includes(activeTag)) {
          return false;
        }

        return matchesSearch(searchTerm, post.title, post.summary, post.content, ...post.tags);
      }),
    [searchTerm, activeTag]
  );

  const activePost = activePostId ? postsById[activePostId] : null;

  return (
    <>
      <section id="writing" className="section">
        <div className="section-header">
          <h2>Writing</h2>
          <p className="subtitle">
            Long-form posts on computer vision, data-centric ML, and the tooling around them. First
            published on Medium, archived here in full.
          </p>
          <p className="repo-count">
            Posts <span className="highlight-number">{posts.length}</span>
          </p>
        </div>

        <div className="filters-panel notes-toolbar">
          <div className="search-field">
            <label htmlFor="writing-search">Search Writing</label>
            <input
              id="writing-search"
              type="search"
              placeholder="Search by title, summary, tag, or body"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="tag-panel">
            <div className="tag-panel__header">
              <h3>Topics</h3>
              <p>Tags carried over from the original posts.</p>
            </div>
            <TagFilter tags={tags} activeTag={activeTag} onTagSelect={setActiveTag} />
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <section className="note-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="note-card post-card">
                <p className="note-card__eyebrow">
                  {formatPostDate(post.date)} · {post.readingMinutes} min read
                </p>
                <h3>
                  <button
                    type="button"
                    className="note-card__title"
                    onClick={() => setActivePostId(post.id)}
                  >
                    {post.title}
                  </button>
                </h3>
                <p className="note-card__summary">{post.summary}</p>
                {post.tags.length > 0 && (
                  <div className="post-card__tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="repo-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="note-card__actions">
                  <button
                    type="button"
                    className="note-card__open"
                    onClick={() => setActivePostId(post.id)}
                  >
                    Read Post
                  </button>
                  {post.canonical && (
                    <a
                      className="post-card__source"
                      href={post.canonical}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Medium
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className="empty-state">No posts match the current search.</p>
        )}

        {activePost && <PostModal post={activePost} onClose={() => setActivePostId(null)} />}
      </section>

      <NotesSection />
    </>
  );
};
