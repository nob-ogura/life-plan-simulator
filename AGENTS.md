# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and route handlers.
- `src/features`: Vertical Slice Architecture by domain; slices group UI, handlers, and data access.
- `src/shared`: Cross-cutting utilities, auth, UI, and infrastructure helpers.
- `src/components`: Reusable UI primitives.
- `src/lib`: Small helpers and adapters.
- `src/types`: Generated shared types (Supabase types in `src/types/supabase.ts`).
- `tests/unit`, `tests/integration`, `tests/e2e`: Unit/Integration/E2E tests.
- `supabase/migrations`: Database migrations.
- `docs`: Specs, design, and workflow notes.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server.
- `pnpm build` / `pnpm start`: Production build and run.
- `pnpm lint`: Biome lint (auto-fixes).
- `pnpm format`: Biome format (auto-fixes).
- `pnpm typecheck`: TypeScript type checking.
- `pnpm test:unit`: Vitest unit tests.
- `pnpm test:integration`: Vitest integration tests.
- `pnpm test:e2e`: Playwright E2E tests.
- `pnpm supabase:push`: Apply migrations.
- `pnpm supabase:gen-types`: Regenerate Supabase types from schema.

## Coding Style & Naming Conventions
- TypeScript + Next.js App Router, Tailwind CSS.
- Biome formatting: 2-space indentation, 100-char line width (run `pnpm format`).
- CQRS pattern: write paths in `commands/`, read paths in `queries/`.
- Endpoint slices follow REPR layout: `request.ts`, `endpoint.ts`, `response.ts`, plus `handler.ts`, `action.ts`, `repository.ts` when needed.
- UI should call server actions (`action.ts`) rather than using `supabaseClient` directly.

## Testing Guidelines
- Prefer integration tests for endpoint-to-DB flows; keep unit tests for complex domain logic.
- Naming patterns: `tests/unit/**.test.ts(x)`, `tests/integration/**/*.integration.test.ts`, `tests/e2e/**/*.spec.ts`.
- Shared setup lives in `src/test/setup.ts`.

## Commit & Pull Request Guidelines
- Recent commit subjects are descriptive Japanese sentences without strict prefixes; keep messages specific and outcome-focused.
- PRs should include a short summary, test results, and UI screenshots when applicable.
- Vercel previews run on PRs; ensure preview deploys are green (see `docs/Vercel.md`).

## Configuration & Secrets
- Local env files: `.env` / `.env.local`.
- Required keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_PROJECT_ID`.
