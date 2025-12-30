# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and route handlers.
- `src/features`: Feature-level modules (domain UI + logic).
- `src/shared`: Cross-cutting utilities, domain logic, and shared UI.
- `src/components`: Reusable UI primitives/components.
- `src/lib` and `src/types`: Supporting helpers and shared types.
- `tests/e2e`: Playwright end-to-end tests.
- `tests/integration`: Vitest integration tests.
- `supabase/migrations`: Database migrations.
- `docs`: Project documentation.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server at http://localhost:3000.
- `pnpm build`: Create production build.
- `pnpm start`: Run the production server.
- `pnpm format`: Apply Biome formatting.
- `pnpm lint`: Run Biome checks with auto-fix.
- `pnpm typecheck`: TypeScript type check.
- `pnpm test:unit`: Run Vitest unit tests.
- `pnpm test:integration`: Run Vitest integration tests.
- `pnpm test:e2e`: Run Playwright E2E tests.

## Coding Style & Naming Conventions
- Formatting and linting are enforced by Biome (2-space indentation, line width 100).
- Prefer TypeScript strictness and explicit types at module boundaries.
- React component files are typically PascalCase (e.g., `LifeEventSection.tsx`).
- Test file patterns:
  - Unit: `*.test.ts` / `*.test.tsx` (often co-located in `src/`).
  - Integration: `*.integration.test.ts` in `tests/integration`.
  - E2E: `*.spec.ts` in `tests/e2e`.

## Testing Guidelines
- Unit and integration tests run with Vitest; E2E tests run with Playwright.
- Integration tests that hit Supabase require env vars in `.env`:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
- Keep tests deterministic; prefer fixtures over shared state.

## Configuration & Data
- Create local config via `cp .env.example .env` and fill required values.
- Supabase migrations live in `supabase/migrations`; update types with `pnpm supabase:gen-types` after schema changes.
