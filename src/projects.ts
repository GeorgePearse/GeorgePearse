export type Project = {
  name: string;
  url: string;
  description: string;
};

export const projects: Project[] = [
  {
    name: "optillm-rs",
    url: "https://github.com/GeorgePearse/optillm-rs",
    description:
      "Rust port of optillm, the inference-time optimisation proxy for LLMs. A drop-in OpenAI-compatible server whose approaches and plugins are checked against upstream optillm 0.4.0 by a parity harness in CI.",
  },
  {
    name: "mcp-tui-test",
    url: "https://github.com/GeorgePearse/mcp-tui-test",
    description:
      "Like Playwright, but for terminal UIs. An MCP server in Python that lets AI assistants launch a TUI, send keystrokes, read the screen buffer and assert on text at given positions.",
  },
  {
    name: "squeeze",
    url: "https://github.com/GeorgePearse/squeeze",
    description:
      "CPU dimensionality reduction for Python: UMAP plus ten reducers (t-SNE, PaCMAP, TriMap, PHATE and more) compiled from Rust, with reproducible comparisons on Digits and Fashion-MNIST.",
  },
  {
    name: "bayesian_filters",
    url: "https://github.com/GeorgePearse/bayesian_filters",
    description:
      "Kalman, extended and unscented Kalman filters, smoothers and particle filters in NumPy and SciPy. A maintained fork of filterpy, published on PyPI with Python 3.12+ packaging and docs.",
  },
  {
    name: "relay-opal",
    url: "https://github.com/GeorgePearse/relay-opal",
    description:
      "Relay, a forward-only credit-assignment estimator for pre-norm transformers that never runs a backward pass, packaged as a PyTorch library with an OPAL agent that retunes the estimator and optimiser mid-training.",
  },
];
