# HiSMaComp

Interactive historical map visualization of European city populations from 800 to 1750 AD. Explore data by century using a timeline, with map markers sized by population and a responsive layout for desktop and mobile.

## Live demo

https://a-a-m-k.github.io/HiSMaComp/

## Features

- Interactive timeline across 8 centuries (800-1750 AD)
- Data-driven map markers with a legend
- Responsive UI for desktop, tablet, and mobile
- Automatic zoom calculations to keep visible towns in view
- Screenshot export as PNG
- PWA support with a service worker
- Error boundaries with friendly recovery UI

## Tech stack

- React 18, TypeScript, Vite
- MapLibre GL JS, React Map GL
- MUI v6
- Vitest, React Testing Library, Playwright
- ESLint, Prettier, Husky, lint-staged
- GitHub Actions for CI and deployment

## Architecture at a glance

```
src/
├── components/        # React components
│   ├── controls/      # Timeline, Legend, Screenshot
│   ├── map/           # MapView and MapLayer
│   ├── ui/            # Reusable UI components
│   └── dev/           # Dev tools (ErrorBoundary, PerformanceMonitor)
├── context/           # React Context (AppContext)
├── hooks/             # Custom React hooks
├── services/          # Business logic (YearDataService with caching)
├── utils/             # Utilities (zoom calculations, GeoJSON conversion)
├── constants/         # Configuration constants
└── theme/             # MUI theme configuration
```

## Notable implementation details

- App data (year, towns, loading, error) lives in React Context; map view state (center, zoom) is derived in the container and passed as props.
- Service layer caches computed year data to avoid redundant processing.
- Custom zoom algorithm based on Mercator projection to keep towns in view.

## Quick start

Prereqs: Node.js 20+ and npm, plus a Stadia Maps API key.

```bash
git clone https://github.com/a-a-m-k/HiSMaComp.git
cd HiSMaComp
npm install
```

Create `.env` in the project root:

```bash
cp .env.example .env
```

Set your key (you can get one from https://client.stadiamaps.com/). The key is read by Vite at build time and used by the MapLibre tiles; it is not committed to git and stays in your local `.env`.

```env
VITE_STADIA_API_KEY=your-stadia-maps-api-key-here
```

Run locally:

```bash
npm run dev
```

Open http://localhost:5173

## Environment variables

| Variable              | Required | Description                                                                                            |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `VITE_STADIA_API_KEY` | Yes      | Stadia Maps API key for map tiles. Get one at [client.stadiamaps.com](https://client.stadiamaps.com/). |
| `VITE_BASE_PATH`      | No       | Base path for production (e.g. `/HiSMaComp/` for GitHub Pages).                                        |

## Scripts

| Script                  | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start development server |
| `npm run build`         | Build for production     |
| `npm run test`          | Run tests in watch mode  |
| `npm run test:run`      | Run all tests            |
| `npm run test:coverage` | Run tests with coverage  |
| `npm run test:e2e`      | Run Playwright tests     |
| `npm run lint`          | Run linting              |
| `npm run deploy`        | Deploy to GitHub Pages   |
| `npm run perf:audit`    | Run Lighthouse audit     |

## Deployment (GitHub Pages)

Set `VITE_STADIA_API_KEY` as a GitHub Actions secret, then push to `main`.
The workflow builds with the key and deploys to GitHub Pages.

GitHub CLI alternative:

```bash
gh secret set VITE_STADIA_API_KEY --repo a-a-m-k/HiSMaComp
```

## License and attribution

This project is open source. Map data attribution:

- Stadia Maps
- Stamen Design
- OpenMapTiles
- OpenStreetMap
