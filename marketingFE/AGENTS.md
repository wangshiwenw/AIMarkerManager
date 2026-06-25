# AGENTS.md

This is the marketing frontend, a Next.js 16 AI market manager demo maintained with npm.

## Current Project Shape

- No login or third-party auth is enabled.
- `/` redirects to `/home`.
- `/home` is the landing page.
- `/cockpit`, `/plans`, `/plans/planesDetail?step=0`, `/auth`, `/materials`, `/leads`, `/distribution`, and `/companies` mount the current repo demo through App Router pages.
- The current demo data lives in `src/features/marketing-workbench/data/`; public demo assets live in `public/current-demo/assets/`.
- Backend integration should replace the local demo data with API-backed React modules when the product contract is ready.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run format
```

## Conventions

- Use the `@/*` import alias for source imports.
- Keep shared demo shell code in `src/features/marketing-workbench/`.
- Keep public demo assets under `public/current-demo/assets/`.
- Keep npm as the only package manager for this frontend.
