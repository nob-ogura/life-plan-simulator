# Life Plan Simulator

## Setup

1) Install dependencies.

```bash
pnpm install
```

2) Create your local environment file.

```bash
cp .env.example .env
```

3) Update `.env` with the required values.

4) Start the development server.

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Quality checks

Run formatting:

```bash
pnpm format
```

Run linting:

```bash
pnpm lint
```

Run unit tests:

```bash
pnpm test:unit
```

Run integration tests:

```bash
pnpm test:integration
```

Run E2E tests:

```bash
pnpm test:e2e
```

Integration tests that exercise Supabase (e.g. auth trigger, RLS) require these env vars in `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

## E2E auth shortcut

Playwright can authenticate by calling the server-only endpoint below.

- Route: `POST /__e2e/login`
- Enabled only when `NODE_ENV === "test"` or `E2E_ENABLED === "true"`
- Body: `{ "email": "optional@example.com" }` (defaults to `e2e@example.com`)
- Implementation lives at `src/app/e2e/login/route.ts` via rewrite

Example:

```bash
curl -X POST http://localhost:3000/__e2e/login \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e@example.com"}'
```

## Supabase migrations

1) Log in to Supabase CLI.

```bash
pnpm supabase login
```

2) Link the project (use your project ref).

```bash
pnpm supabase link --project-ref <project-ref>
```

3) Push migrations to the remote database.

```bash
pnpm supabase db push
```

4) Regenerate TypeScript types after schema changes.

```bash
pnpm supabase:gen-types
```
