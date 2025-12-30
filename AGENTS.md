# Repository Guidelines

This repository is a Next.js (App Router) application for a life-plan simulator, using
TypeScript, Tailwind CSS, Supabase, and Playwright/Vitest for tests. Use `pnpm` for all
package scripts.

## Project Structure & Module Organization

- `src/app`: route handlers and UI for the App Router.
- `src/components`: shared UI components.
- `src/features`: feature-scoped modules.
- `src/lib`: utilities and client setup (e.g., Supabase helpers).
- `src/shared`: cross-cutting domain helpers/types.
- `src/types`: generated and shared TypeScript types (including Supabase).
- `src/test`: test setup and factories.
- `tests/e2e`: Playwright specs (`*.spec.ts`).
- `tests/integration`: Vitest integration tests (`*.integration.test.ts`).
- `supabase/migrations`: database migrations.
- `docs`: supporting documentation.

## Build, Test, and Development Commands

- `pnpm dev`: run the local dev server on http://localhost:3000.
- `pnpm build`: build the production bundle.
- `pnpm start`: run the built app.
- `pnpm lint`: run Biome lint + fixes.
- `pnpm format`: format code with Biome.
- `pnpm typecheck`: TypeScript typecheck without emit.
- `pnpm test:unit`: run Vitest unit tests.
- `pnpm test:integration`: run Vitest integration tests.
- `pnpm test:e2e`: run Playwright end-to-end tests.
- `pnpm supabase:push`: apply migrations to remote Supabase.
- `pnpm supabase:gen-types`: regenerate Supabase types into `src/types/supabase.ts`.

## Coding Style & Naming Conventions

Formatting and linting are enforced by Biome (`biome.json`) with 2-space indentation and
a 100 character line width. Prefer TypeScript, keep imports organized, and follow existing
file naming patterns, especially for tests: `*.spec.ts` (e2e) and `*.integration.test.ts`.

## Testing Guidelines

Vitest is used for unit/integration tests; Playwright is used for e2e. Shared test setup
lives in `src/test/setup.ts` and factories in `src/test/factories`. Integration tests that
touch Supabase require `.env` values for Supabase keys. For e2e auth, the test-only
endpoint `POST /__e2e/login` can be used (enabled via `NODE_ENV=test` or `E2E_ENABLED=true`).

## Security & Configuration Tips

Store secrets in `.env` or `.env.local` and never commit them. Supabase keys are required
for integration tests and type generation; verify they are set before running those tasks.
