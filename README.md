Stuff to add: 
- [ ] One of those flow chart things which shows the amount of projects that make it to each stage, through Idea -> PoC -> Real Implementation -> Blog or popular package
- [ ] Embedding scatter plot of starred repos
- [ ] Graph of starred repos
- [ ] Better searchable interface of starred repos.
- [ ] Find a way to encourage me to work on certain projects via. how they're visualised (e.g. traffic light system or similar).
- [ ] A general webserver and react UI for all coding CLIs (similar to how ML experiment trackes all have interfaces that make it easy to work with irrespective of the training framework used)

# George Pearse · Project Notebook

This repository now powers a Vite + React site that documents everything I am studying and
building. The homepage presents a card for every public repository on my
[GitHub profile](https://github.com/GeorgePearse), enriched with tags so that projects can be sorted
by topic (computer vision, LLMs, VLMs, MLOps, and more).

## About the Site

I now use this as a study notebook: whenever I dive into a new area of technology, I start by
building something and keep track of where it becomes difficult. Those lessons surface here so I can
return to them quickly, and so others can trace the same path.

The React app fetches repositories directly from the GitHub API and surfaces the GitHub Topics you
define on each repository. Keep your topics up to date on GitHub and this site will reflect them in
real time. Each card also includes a docs button that links to the repository's documentation
(GitHub Pages homepage when present, otherwise the README).

## Running Locally

```bash
npm install
npm run dev
```

The dev server listens on http://localhost:5173 by default. Any of the following commands will also
work if you prefer alternative package managers:

```bash
pnpm install && pnpm dev
yarn install && yarn dev
```

### Optional: Authenticated GitHub Requests

Unauthenticated requests are limited to 60 calls per hour. To raise the limit while developing
locally, create a `.env.local` file and supply a fine-grained personal access token that has the
`public_repo` scope:

```
VITE_GITHUB_TOKEN=ghp_exampletoken
```

⚠️ Because this is a client-side application, do **not** commit personal access tokens. Only use a
token for local development if you are comfortable exposing it to the browser; the production build
should rely on the unauthenticated rate limit or be fronted by your own proxy/API.

## Updating Tags & Content

- Update the about copy by editing `src/components/AboutSection.tsx`.
- Adjust card layout or data fields inside `src/components/RepositoryCard.tsx`.
- Maintain GitHub Topics directly in each repository to curate tags; no code changes required.

To force a refresh of repository data during development, reload the page or restart the dev server;
the app requests fresh data on each visit.

## Directory Layout

```
├── assets/                 # Static assets (favicon, graphs, etc.)
├── src/
│   ├── components/         # React component modules
│   ├── hooks/              # Data-fetching and domain hooks
│   ├── styles/             # Global styles
│   └── utils/              # Formatting helpers
├── data/                   # Historical metrics CSV (retained from previous setup)
├── scripts/                # Legacy metrics scripts (unchanged)
├── index.html              # Vite entrypoint
├── package.json            # Project manifest
└── vite.config.ts          # Build configuration
```

## Legacy Metrics

The original metrics-generation scripts and assets remain untouched under `scripts/` and `data/` so
that GitHub profile graphics continue to render as before. They can be invoked independently of the
React app whenever you want to refresh the SVG charts.
