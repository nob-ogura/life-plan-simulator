# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: shared UI components.
- `src/features`: Vertical Slice Architecture feature modules (group by domain, then slice).
- `src/lib`: reusable utilities and helpers.
- `src/shared`: cross-cutting concerns and shared kernel code.
- `src/types`: shared TypeScript types (including Supabase types).
- `tests/integration`: end-to-end style tests for API flows.
- `docs`: design notes and architecture guidance (see `docs/Guideline.md`).

Architecture notes: follow the Vertical Slice Architecture and RER (Request/Endpoint/Response) pattern described in `docs/Guideline.md`. Keep endpoint glue thin, delegate to handlers, and keep domain rules in domain models.

## Build, Test, and Development Commands
- `pnpm dev`: start local dev server.
- `pnpm build`: production build.
- `pnpm start`: run the built app.
- `pnpm lint`: run Biome lint + formatting checks (writes fixes).
- `pnpm format`: format all files with Biome.
- `pnpm typecheck`: run TypeScript checks (`tsc --noEmit`).
- `pnpm test:unit`: run unit tests with Vitest (jsdom).
- `pnpm test:integration`: run integration tests in `tests/integration`.
- `pnpm supabase:gen-types`: regenerate `src/types/supabase.ts` (needs `.env` + `SUPABASE_PROJECT_ID`).

## Coding Style & Naming Conventions
- TypeScript + React + Next.js (App Router).
- Formatting/linting via Biome (`biome.json`): 2-space indent, 100 char line width, organize imports.
- Use the path alias `@/` for `src` (e.g., `@/lib/foo`).
- Tests use `*.test.ts` or `*.test.tsx`.

## Testing Guidelines
- Unit tests: colocated under `src` and matched by `src/**/*.test.{ts,tsx}`.
- Integration tests: `tests/integration/**/*.test.{ts,tsx}`.
- Test setup: `src/test/setup.ts`.
- Prefer integration tests for slice-level behavior; unit tests for complex domain logic.

## Commit & Pull Request Guidelines
- Commit messages in history are descriptive, sentence-style (often Japanese). Match that tone and detail.
- PRs should include: a concise summary, testing notes (commands run), and screenshots for UI changes. Link related docs or issues when relevant.

## Configuration Tips
- Create local env files from `.env.example` (`cp .env.example .env`).
- Keep secrets out of the repo; use `.env.local` for overrides when needed.
