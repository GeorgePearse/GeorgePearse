export type Project = {
  name: string;
  url: string;
  description: string;
};

export const projects: Project[] = [
  {
    name: "bayesian_filters",
    url: "https://github.com/GeorgePearse/bayesian_filters",
    description: "Kalman filtering and optimal estimation library in Python.",
  },
  {
    name: "mcp-tui-test",
    url: "https://github.com/GeorgePearse/mcp-tui-test",
    description: "MCP server for testing terminal UIs, like Playwright for TUI applications.",
  },
  {
    name: "QDrant-NLP",
    url: "https://github.com/GeorgePearse/QDrant-NLP",
    description: "Lightweight UIs and tooling for the Qdrant vector database.",
  },
  {
    name: "optillm-rs",
    url: "https://github.com/GeorgePearse/optillm-rs",
    description: "Rust port of optillm for use with AI coding agents.",
  },
  {
    name: "ImageComposer",
    url: "https://github.com/GeorgePearse/ImageComposer",
    description:
      "Synthetic image dataset composer: pick backgrounds and foregrounds, it does the rest.",
  },
];
