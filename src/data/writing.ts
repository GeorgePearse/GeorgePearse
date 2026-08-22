import type { PostRecord } from "../types/writing";

/**
 * Long-form posts, imported from Medium by scripts/import_medium.py.
 *
 * The Markdown files are the source of truth for the site — Medium is only
 * where they were first published. Frontmatter is parsed here rather than
 * pulling in a YAML dependency, because the importer writes a fixed, narrow
 * shape (a quoted scalar or a bracketed list of quoted scalars).
 */

const FALLBACK_SUMMARY = "A post imported from Medium.";
const WORDS_PER_MINUTE = 220;

const postModules = import.meta.glob("../content/writing/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

interface ParsedFrontmatter {
  fields: Record<string, string>;
  body: string;
}

const parseFrontmatter = (raw: string): ParsedFrontmatter => {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) {
    return { fields: {}, body: raw };
  }

  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return { fields, body: raw.slice(match[0].length) };
};

const unquote = (value: string | undefined) => (value ?? "").replace(/^"(.*)"$/s, "$1");

const parseTags = (value: string | undefined) => {
  const inner = /^\[(.*)\]$/s.exec((value ?? "").trim())?.[1] ?? "";
  return inner
    .split(",")
    .map((tag) => unquote(tag.trim()))
    .filter(Boolean);
};

const stripMarkdown = (value: string) =>
  value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** First real prose paragraph — skipping headings, images and code fences. */
const extractSummary = (body: string) => {
  for (const paragraph of body.split(/\n\s*\n/)) {
    const candidate = paragraph.trim();
    if (
      !candidate ||
      candidate.startsWith("#") ||
      candidate.startsWith("```") ||
      candidate.startsWith("![") ||
      candidate.startsWith(">")
    ) {
      continue;
    }

    const summary = stripMarkdown(candidate);
    if (summary.length > 0) {
      return summary;
    }
  }

  return FALLBACK_SUMMARY;
};

const estimateReadingMinutes = (body: string) =>
  Math.max(
    1,
    Math.round(stripMarkdown(body).split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE)
  );

export const posts: PostRecord[] = Object.entries(postModules)
  .map(([modulePath, raw]) => {
    const { fields, body } = parseFrontmatter(raw);
    const filename = modulePath.split("/").pop() ?? modulePath;
    const id = filename.replace(/\.md$/i, "");

    return {
      id,
      title: unquote(fields.title) || id,
      date: unquote(fields.date),
      canonical: unquote(fields.canonical),
      tags: parseTags(fields.tags),
      summary: extractSummary(body),
      readingMinutes: estimateReadingMinutes(body),
      content: body.trim(),
    };
  })
  // Newest first: these are dated pieces, not a reference tree like the notes.
  .sort((left, right) => right.date.localeCompare(left.date));

export const postsById = Object.fromEntries(posts.map((post) => [post.id, post]));

export const postTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
  a.localeCompare(b)
);
