# Contributing

Thanks for your interest in HiSMaComp.

## Local setup

- **Node.js 20+** and npm
- Clone the repo, then `npm install`
- Copy `.env.example` to `.env` and set `VITE_STADIA_API_KEY` (see [README.md](README.md#quick-start))

## Checks before you open a PR

These mirror what CI runs on `main`:

```bash
npm run lint:check
npm run typecheck
npm run test:coverage
```

For a full local pass closer to CI (includes the GitHub Pages build and bundle-size check):

```bash
npm run verify:ci
```

## End-to-end tests

Install Chromium once, then run Playwright:

```bash
npm run test:e2e:install
npm run test:e2e
```

Visual capture specs are tagged `@visual` and are run separately (`npm run test:visual`).

## Deploy and secrets

GitHub Actions deployment and optional Sentry keys are documented in the [README](README.md#deploy-github-pages).
