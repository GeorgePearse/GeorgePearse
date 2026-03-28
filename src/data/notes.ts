import type { NoteRecord } from "../types/notes";

const SECTION_LABELS: Record<string, string> = {
  "": "General",
  "ai-coding": "AI Coding",
  cuda: "CUDA",
  deployment: "Deployment",
  economics: "Economics",
  health: "Health",
  object_detection: "Object Detection",
  optimization: "Optimization",
  politics: "Politics",
  tech: "Tech",
};

const FALLBACK_SUMMARY = "Local notes imported into this site for in-app browsing.";
const NOTE_FILE_PATTERN = /\.md$/i;

const noteModules = import.meta.glob("../content/notes/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const titleFromFilename = (filename: string) =>
  filename
    .replace(NOTE_FILE_PATTERN, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");

const normaliseSummary = (value: string) =>
  value
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractTitle = (content: string, path: string) => {
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (title) {
    return title;
  }

  const segments = path.split("/");
  const filename = segments[segments.length - 1] ?? path;
  return titleFromFilename(filename);
};

const extractSummary = (content: string) => {
  const paragraphs = content.split(/\n\s*\n/);

  for (const paragraph of paragraphs) {
    const candidate = paragraph.trim();
    if (!candidate || candidate.startsWith("#") || candidate.startsWith("```")) {
      continue;
    }

    const summary = normaliseSummary(candidate);
    if (summary.length > 0) {
      return summary;
    }
  }

  return FALLBACK_SUMMARY;
};

const formatSectionLabel = (sectionKey: string) => {
  if (sectionKey in SECTION_LABELS) {
    return SECTION_LABELS[sectionKey];
  }

  return sectionKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");
};

const relativePathFromModule = (modulePath: string) => modulePath.replace("../content/notes/", "");

export const notes: NoteRecord[] = Object.entries(noteModules)
  .map(([modulePath, content]) => {
    const path = relativePathFromModule(modulePath);
    const segments = path.split("/");
    const sectionKey = segments.length > 1 ? segments[0] : "";

    return {
      id: path.replace(NOTE_FILE_PATTERN, ""),
      title: extractTitle(content, path),
      path,
      sectionKey,
      sectionLabel: formatSectionLabel(sectionKey),
      summary: extractSummary(content),
      content,
    };
  })
  .sort((left, right) => {
    if (left.path === "index.md") {
      return -1;
    }

    if (right.path === "index.md") {
      return 1;
    }

    if (left.sectionLabel !== right.sectionLabel) {
      return left.sectionLabel.localeCompare(right.sectionLabel);
    }

    return left.title.localeCompare(right.title);
  });

export const notesByPath = Object.fromEntries(notes.map((note) => [note.path, note]));

export const resolveNotePath = (href: string, currentPath: string) => {
  if (
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  ) {
    return null;
  }

  const [targetPath] = href.split("#");
  if (!targetPath || !NOTE_FILE_PATTERN.test(targetPath)) {
    return null;
  }

  const currentDirectory = currentPath.includes("/")
    ? currentPath.slice(0, currentPath.lastIndexOf("/") + 1)
    : "";
  const resolvedUrl = new URL(href, `https://notes.local/${currentDirectory}`);
  const resolvedPath = resolvedUrl.pathname.replace(/^\//, "");

  return NOTE_FILE_PATTERN.test(resolvedPath) ? resolvedPath : null;
};
