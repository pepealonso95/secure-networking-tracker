# Secure Networking Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build, secure, test, document, publish, and deploy a private-by-user networking contact tracker with a static Next.js SPA and a separate Node API.

**Architecture:** One npm-workspace repository contains a statically exported Next.js client in `apps/web` and a Hono REST service in `apps/api`. Neon Managed Auth provides browser authentication, the API forwards each caller's JWT to the Neon Data API, and Postgres row-level security is the final ownership boundary.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui with Radix, Neon Managed Auth and Data API, Hono, Zod, Vitest, Playwright, Vercel, GitHub Actions.

---

### Task 1: Scaffold the standalone monorepo

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`, `tsconfig.base.json`
- Create: `apps/web/**`, `apps/api/**`

1. Initialize the nested Git repository and npm workspaces.
2. Scaffold a Next.js App Router project in `apps/web` and configure `output: "export"`.
3. Create the Hono Vercel Function package in `apps/api`.
4. Install exact dependency versions and commit `package-lock.json`.
5. Run the initial typecheck and builds, then commit.

### Task 2: Specify and test shared contact behavior

**Files:**
- Create: `apps/api/src/contact-schema.ts`
- Create: `apps/api/src/contact-schema.test.ts`
- Create: `apps/api/src/http.ts`
- Create: `apps/api/src/http.test.ts`

1. Write failing Vitest cases for input normalization, invalid names and priorities, field limits, ownership stripping, bearer parsing, and JSON error contracts.
2. Run the targeted tests and confirm they fail for missing behavior.
3. Implement the Zod schemas and response helpers.
4. Run the tests and confirm they pass, then commit.

### Task 3: Implement the authenticated Hono API

**Files:**
- Create: `apps/api/api/index.ts`
- Create: `apps/api/src/app.ts`, `apps/api/src/neon.ts`, `apps/api/src/types.ts`
- Create: `apps/api/vercel.json`

1. Add testable Hono routes for health and contact CRUD.
2. Add exact-origin CORS, request logging, bearer enforcement, and consistent not-found/error handling.
3. Create one request-scoped Neon client per protected call with the bearer token supplied through `dataApi.getToken`.
4. Query only contact fields, never accept `user_id`, and map empty update/delete results to 404.
5. Test unauthorized and contract behavior, typecheck, build, then commit.

### Task 4: Provision Neon and apply security

**Files:**
- Create: `database/migrations/001_contacts.sql`
- Create: `database/verify-security.sql`

1. Create the isolated Neon Free project in AWS US East 1.
2. Enable Managed Auth with email/password, immediate signup, localhost origins, and the final web origin when known.
3. Create the Data API using Neon Auth without broad default grants.
4. Apply the contacts schema, checks, timestamp trigger, index, grants, forced RLS, and separate SELECT/INSERT/UPDATE/DELETE policies.
5. Run catalog verification for constraints, grants, and policies, and save sanitized evidence.

### Task 5: Build the static SPA and authentication

**Files:**
- Create: `apps/web/src/app/{page.tsx,sign-in/page.tsx,sign-up/page.tsx,contacts/page.tsx}`
- Create: `apps/web/src/components/auth/**`, `apps/web/src/components/providers.tsx`
- Create: `apps/web/src/lib/neon.ts`, `apps/web/src/lib/api.ts`

1. Initialize shadcn non-interactively with Radix and add the required primitives.
2. Configure the two-URL Neon client with `BetterAuthReactAdapter` and keep every auth operation client-side.
3. Build custom accessible sign-in and sign-up forms with inline errors and loading states.
4. Add hydration-time route protection and authenticated bearer calls to the external API.
5. Verify that static export contains no API routes, Server Actions, proxy, or request-time server code.

### Task 6: Build and test contact CRUD UX

**Files:**
- Create: `apps/web/src/components/contacts/**`
- Create: `apps/web/src/hooks/use-contacts.ts`
- Create: `apps/web/src/lib/contacts.ts`, `apps/web/src/lib/contacts.test.ts`

1. Write tests for search, priority filtering, and all sort modes.
2. Build the desktop table, mobile cards, filter bar, priority badges, and accessible row actions.
3. Build sheet-based create/edit forms and destructive AlertDialog deletion.
4. Add skeleton, empty, error, pending, and toast states while preserving server authority.
5. Run unit tests, typecheck, lint, and production builds, then commit.

### Task 7: Add automated end-to-end and privacy tests

**Files:**
- Create: `tests/e2e/contact-flow.spec.ts`, `tests/e2e/privacy.spec.ts`
- Create: `playwright.config.ts`

1. Add Playwright coverage for signup, signin, create, edit, refresh persistence, sort, filter, invalid input, delete, and signout.
2. Add a two-account test proving User B cannot list, update, or delete User A's row while User A retains access.
3. Run the suite locally on desktop and mobile projects.
4. Save sanitized test output under `docs/evidence`.

### Task 8: Document the full grading surface

**Files:**
- Create: `README.md`
- Create: `docs/architecture.md`, `docs/evidence/README.md`
- Create: `.github/workflows/ci.yml`

1. Document architecture and request flow, setup, variables, schema, RLS, tests, deployment, limitations, and security decisions.
2. Add exact live URLs and repository URL after deployment.
3. Add screenshots for desktop, mobile, auth, CRUD persistence, and privacy evidence.
4. Add CI for install, lint, typecheck, unit tests, and both production builds.

### Task 9: Publish, deploy, and verify production

**Files:**
- Modify: `README.md`, `docs/evidence/**`

1. Scan the working tree and Git history for connection strings, credentials, test passwords, and Vercel metadata.
2. Create the public GitHub repository `pepealonso95/secure-networking-tracker` and push `main`.
3. Create separate Vercel projects for `apps/api` and `apps/web`, configure narrowly scoped variables, and deploy API first.
4. Add the API URL to the web project, deploy web, then add the production web domain to CORS and Neon Auth trusted origins.
5. Run production health, auth, CRUD, persistence, responsive layout, console, privacy, runtime-log, and database-security checks.
6. Commit sanitized final evidence and README links, push, and confirm both deployments are public and healthy.
