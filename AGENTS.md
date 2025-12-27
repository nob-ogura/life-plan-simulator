# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: shared UI components.
- `src/features`: Vertical Slice Architecture modules grouped by domain → slice.
- `src/lib`: reusable utilities/helpers.
- `src/shared`: cross-cutting/shared kernel code.
- `src/types`: shared TypeScript types (e.g., Supabase types).
- `tests/integration`: end-to-end style API flow tests.
- `docs`: design notes and architecture guidance (see `docs/Guideline.md`).

## Architecture Overview
- Follow Vertical Slice Architecture (VSA) and the RER (Request/Endpoint/Response) pattern.
- Keep endpoint glue thin: endpoints accept input/auth and delegate to handlers.
- Put domain rules in domain models; shared domain rules live in shared kernel.

## Build, Test, and Development Commands
- `pnpm dev`: run local dev server.
- `pnpm build`: production build.
- `pnpm start`: run the built app.
- `pnpm lint`: Biome lint + formatting checks (may apply fixes).
- `pnpm format`: format all files with Biome.
- `pnpm typecheck`: TypeScript checks (`tsc --noEmit`).
- `pnpm test:unit`: Vitest unit tests (jsdom).
- `pnpm test:integration`: run `tests/integration`.
- `pnpm supabase:gen-types`: regenerate `src/types/supabase.ts` (needs `.env`).

## Coding Style & Naming Conventions
- TypeScript + React + Next.js (App Router).
- Biome formatting: 2-space indent, 100-char line width, organized imports.
- Use `@/` alias for `src` (e.g., `@/lib/date`).
- Test files: `*.test.ts` or `*.test.tsx`.

## Testing Guidelines
- Prefer integration tests for slice-level behavior; unit tests for complex domain logic.
- Unit tests live under `src/**` and match `src/**/*.test.{ts,tsx}`.
- Integration tests live under `tests/integration/**/*.test.{ts,tsx}`.
- Test setup: `src/test/setup.ts`.

## Commit & Pull Request Guidelines
- Commit messages are descriptive, sentence-style, often Japanese (see recent history).
- PRs should include a concise summary, testing notes (commands run), and screenshots for UI changes.
- Link relevant docs or issues when applicable.

## Security & Configuration Tips
- Create local env files from `.env.example` (`cp .env.example .env`).
- Keep secrets out of the repo; use `.env.local` for overrides.
