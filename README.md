# Secure Networking Tracker

A private contact tracker built as two separate applications: a statically exported Next.js SPA and a Node.js API on Vercel. Neon provides Managed Better Auth, Postgres persistence, the Data API, and row-level security.

## Live deliverables

- Web app: deployment pending
- API health: deployment pending
- Public repository: [github.com/pepealonso95/secure-networking-tracker](https://github.com/pepealonso95/secure-networking-tracker)

## What the app does

- Email and password account creation, sign-in, and sign-out
- Private contacts with name, company, role, where met, notes, and priority
- Create, read, edit, and delete flows with refresh persistence
- Search across every descriptive field
- Priority filtering and recent, name, or priority sorting
- Desktop table and mobile cards
- Loading, empty, filtered-empty, error, invalid-input, pending, success, and destructive confirmation states

## Architecture

```text
Browser
  -> Neon Managed Auth for identity and JWT
  -> Hono REST API on Vercel with Authorization: Bearer <JWT>
  -> Neon Data API with the same JWT
  -> Postgres grants and row-level security
  -> contacts rows owned by auth.user_id()
```

The web deployment is a strict static export. `apps/web/next.config.ts` sets `output: "export"`, and the build emits only files under `apps/web/out`. The Next.js app has no API route, Server Action, proxy, middleware, request-time Server Component, cookie access, or database secret.

The API is an independent Hono application deployed as a Node.js 24 Vercel Function. See [the detailed request flow](docs/architecture.md).

## Repository map

```text
apps/web/                 Next.js client-only SPA
apps/api/                 Hono REST API
database/migrations/      Reproducible Postgres schema and policies
database/verify-security.sql
tests/e2e/                Playwright product and privacy flows
docs/evidence/            Sanitized verification evidence
docs/plans/               Implementation plan
```

## API contract

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Public service health |
| GET | `/api/contacts` | List the caller's contacts |
| POST | `/api/contacts` | Create a caller-owned contact |
| PATCH | `/api/contacts/:id` | Update a visible caller-owned contact |
| DELETE | `/api/contacts/:id` | Delete a visible caller-owned contact |

Successes use `{ "data": ... }`. Failures use `{ "error": { "code", "message", "fieldErrors?" } }`. Protected routes require a bearer JWT. The API never reads an ownership value from request JSON.

## Database schema

The migration is committed at [`database/migrations/001_contacts.sql`](database/migrations/001_contacts.sql). The core table is:

```sql
create table public.contacts (
  id bigint generated always as identity primary key,
  user_id text not null default auth.user_id(),
  name text not null,
  company text,
  role text,
  where_met text,
  notes text,
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_not_blank check (char_length(btrim(name)) between 1 and 100),
  constraint contacts_priority_valid check (priority in ('high', 'medium', 'low'))
);
```

Additional checks enforce maximum lengths. A trigger updates `updated_at`, and `(user_id, updated_at desc)` supports the private recent-contact query.

## Row-level security

RLS is enabled and forced. Four separate policies apply to the `authenticated` role:

| Operation | `USING` | `WITH CHECK` |
| --- | --- | --- |
| SELECT | `(select auth.user_id()) = user_id` | not applicable |
| INSERT | not applicable | `(select auth.user_id()) = user_id` |
| UPDATE | `(select auth.user_id()) = user_id` | `(select auth.user_id()) = user_id` |
| DELETE | `(select auth.user_id()) = user_id` | not applicable |

The `authenticated` role receives only SELECT, INSERT, UPDATE, and DELETE on `contacts`, plus the required identity-sequence access. `anonymous` receives no contact privileges. The Neon Data API validates the caller JWT and supplies `auth.user_id()` for policy evaluation.

## Local setup

Requirements: Node.js 24, npm, a Neon project with Managed Auth and Data API, and the Vercel CLI for the API runtime.

```bash
npm ci
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env.local
npm run dev
```

Use only the variables relevant to each application. Do not add a database connection string to either deployed runtime.

### Environment variables

| Variable | App | Public or secret | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | web | public | Separate Hono API origin |
| `NEXT_PUBLIC_NEON_AUTH_URL` | web | public | Neon Managed Auth endpoint |
| `NEXT_PUBLIC_NEON_DATA_API_URL` | web | public | Required second URL for the unified Neon client |
| `NEON_DATA_API_URL` | API | server-scoped public endpoint | Request-scoped Data API client |
| `CORS_ALLOWED_ORIGINS` | API | server config | Exact comma-separated web origins |
| `DATABASE_URL` | migration only | secret | Schema changes and catalog verification |

Only placeholders are committed in `.env.example`. Real `.env*` files and `.vercel` metadata are ignored.

## Tests and quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
E2E_PASSWORD='<temporary value>' E2E_BASE_URL='<web url>' E2E_API_URL='<api url>' npm run test:e2e
```

Vitest covers validation, normalization, ownership-field stripping, bearer parsing, API error contracts, unauthorized routes, search, filtering, and sorting. Playwright covers account creation, sign-in state, CRUD, refresh persistence, invalid input, filters, sorting, sign-out, responsive layouts, and two-account privacy.

The privacy test creates a contact as User A, then proves User B receives an empty list and 404 responses when trying to update or delete User A's id. User A can still read and delete the same row.

See [`docs/evidence`](docs/evidence/README.md) for the sanitized final run.

## Deployment

The monorepo is connected to two Vercel projects:

1. API project root: `apps/api`. Set `NEON_DATA_API_URL` and `CORS_ALLOWED_ORIGINS`.
2. Web project root: `apps/web`. Set all three `NEXT_PUBLIC_*` variables.
3. Deploy the API first, then place its production URL in `NEXT_PUBLIC_API_URL`.
4. Add the web production origin to API CORS, Neon Auth trusted domains, and Data API CORS.
5. Rebuild the web app because public variables are embedded into its static JavaScript.

## Security decisions

- The browser never receives `DATABASE_URL` or a cookie-signing secret.
- The Node API forwards only the current bearer JWT to the Data API.
- Input schemas discard `user_id`, timestamps, and other non-editable fields.
- CORS reflects only exact configured origins.
- Database checks duplicate important API constraints.
- RLS is forced and verified from Postgres catalogs.
- No anonymous contact grants or broad default Data API grants are enabled.

## Known limitations

- Email confirmation is disabled to support immediate classroom grading. A production deployment should enable verification and a transactional email provider.
- Filtering and sorting happen in the browser after the private collection is returned. Pagination would be needed for a large network.
- The app does not include teams, sharing, admin tools, AI features, or social login.
- Neon Auth and `@neondatabase/neon-js` are beta interfaces, so the package is pinned exactly and the lockfile is committed.

