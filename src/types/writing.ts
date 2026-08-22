export interface PostRecord {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) the post was originally published. */
  date: string;
  /** Original Medium URL, kept so the canonical source stays attributable. */
  canonical: string;
  tags: string[];
  summary: string;
  readingMinutes: number;
  content: string;
}
