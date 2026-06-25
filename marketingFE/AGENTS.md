# AGENTS.md

This is the marketing frontend, a Next.js 16 admin dashboard maintained with npm.

## Current Project Shape

- No login or third-party auth is enabled.
- `/` and `/dashboard` redirect to `/dashboard/overview`.
- Dashboard data is still mocked through local route handlers in `src/app/api/*`.
- Backend integration should happen through the existing feature API layers:
  - `src/features/products/api/*`
  - `src/features/users/api/*`
  - `src/lib/api-client.ts`

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
- Keep data access inside feature API modules and route handlers.
- Use `PageContainer` for dashboard page headers.
- Import icons from `@/components/icons`.
- Keep npm as the only package manager for this frontend.
