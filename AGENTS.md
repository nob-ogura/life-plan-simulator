# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: shared UI components.
- `src/features`: Vertical Slice Architecture modules (group by domain → slice).
- `src/lib`: reusable utilities and helpers.
- `src/shared`: cross-cutting/shared kernel code.
- `src/types`: shared TypeScript types (including Supabase types).
- `tests/integration`: end-to-end style API flow tests.
- `docs`: design notes and architecture guidance (see `docs/Guideline.md`).

## Architecture Overview
Follow Vertical Slice Architecture and the RER (Request/Endpoint/Response) pattern described in
`docs/Guideline.md`. Keep endpoint glue thin, delegate to handlers, and keep domain rules in domain models.

## Build, Test, and Development Commands
- `pnpm dev`: start the local dev server.
- `pnpm build`: production build.
- `pnpm start`: run the built app.
- `pnpm lint`: run Biome lint + formatting checks (may write fixes).
- `pnpm format`: format all files with Biome.
- `pnpm typecheck`: run TypeScript checks (`tsc --noEmit`).
- `pnpm test:unit`: run Vitest unit tests (jsdom).
- `pnpm test:integration`: run tests in `tests/integration`.
- `pnpm supabase:gen-types`: regenerate `src/types/supabase.ts` (requires `.env` and
  `SUPABASE_PROJECT_ID`).

## Coding Style & Naming Conventions
- TypeScript + React + Next.js (App Router).
- Formatting/linting via Biome (`biome.json`): 2-space indent, 100-char line width, organize imports.
- Use the alias `@/` for `src` (e.g., `@/lib/foo`).
- Test files: `*.test.ts` or `*.test.tsx`.

## Testing Guidelines
- Unit tests: colocated under `src` and matched by `src/**/*.test.{ts,tsx}`.
- Integration tests: `tests/integration/**/*.test.{ts,tsx}`.
- Test setup: `src/test/setup.ts`.
- Prefer integration tests for slice-level behavior and unit tests for complex domain logic.

## Commit & Pull Request Guidelines
- Commit messages are descriptive and sentence-style (often Japanese); match this tone and detail.
- PRs should include a concise summary, testing notes (commands run), and screenshots for UI changes.
- Link related docs or issues when relevant.

## Security & Configuration Tips
- Create local env files from `.env.example` (`cp .env.example .env`).
- Keep secrets out of the repo; use `.env.local` for overrides when needed.
