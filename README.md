# FoodMission Data UI

Analytics dashboard for FoodMission (Next.js App Router, React, Tailwind).

## Prerequisites

- **Node.js 20** — use [`.nvmrc`](.nvmrc) (`nvm use` / `fnm use`)
- npm (lockfile: `package-lock.json`)

## Getting started

```bash
npm ci
cp .env.example .env   # then edit values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See [`.env.example`](.env.example):

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_API_URL` | Analytics API base URL |
| `KEYCLOAK_*` | Keycloak OIDC for Better Auth |
| `BETTER_AUTH_SECRET` | Session signing secret |
| `BETTER_AUTH_URL` | App base URL (e.g. `http://localhost:3000`) |

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Run `lint`, `typecheck`, and `build` before opening a PR (CI runs the same checks).

## Contributing

### Issues

Use **New issue** and pick a template:

- **Bug report** — UI / dashboard problems
- **Feature request** — new analytics or UX
- **Chore** — tooling, CI, dependencies
- **Blank issue** — anything else

Templates live in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/).

### Pull requests

New PRs use [`.github/pull_request_template.md`](.github/pull_request_template.md) for the description checklist.

### Automation

| What | Where |
| ---- | ----- |
| **CI** (lint, typecheck, build, CodeQL) | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |
| **Security** (TruffleHog, license check, Semgrep) | [`.github/workflows/security.yml`](.github/workflows/security.yml) |
| **Dependabot** (npm daily, Actions weekly) | [`.github/dependabot.yml`](.github/dependabot.yml) |

Workflows run on push and pull requests to `main`. CI uses placeholder env vars for build-time auth config (see `env` in `ci.yml`).

**License policy:** production deps must use permissive licenses (MIT/Apache/BSD/ISC, etc.). The license job runs `npm ci --omit=optional` so Sharp/libvips (LGPL) is not installed—this app does not use `next/image` (`images.unoptimized` in `next.config.ts`). A small documented exception list covers unavoidable transitive metadata (e.g. `caniuse-lite` CC-BY-4.0, MapLibre jsonlint). Build/lint jobs use a full `npm ci` (Tailwind needs optional native bindings).

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Deploy on Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
