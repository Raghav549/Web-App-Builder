# Ai Pop Cute Support

A mobile-first social voting and fan support platform for Ai, a pop idol contestant. Users sign up, vote daily for Ai, post content, follow each other, message, and engage with the community. Ai has a full creator dashboard for analytics and management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from $PORT env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 at `/api`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Tailwind CSS

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `lib/db/src/schema/` — Drizzle ORM table schemas (users, posts, social, messages)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/app/src/pages/` — React page components (41 pages)
- `artifacts/app/src/contexts/AuthContext.tsx` — Auth state management

## Architecture decisions

- JWT auth stored in localStorage (`ai_token` key); `setAuthTokenGetter` in custom-fetch auto-attaches bearer header
- Daily vote limit: one vote per user per calendar day (enforced by `votes.vote_date` uniqueness check)
- Ai's creator account: `aipopgirl@demo.com` / `ai123456789`, role=`creator`, MixChannel ID: `18641424`
- All new users get `isVerified: true` by default (blue badge shown on all profiles)
- Creator routes redirect to `/creator` on login (checked in LoginPage); regular users go to `/home`

## Product

**Fan features:** Landing page with vote count, Ai profile page, daily voting with progress meter, post feed with likes/comments/shares, follow system, private messaging (DMs + group chats), search, notifications.

**Creator features (Ai only):** Dashboard with analytics, vote analytics with charts, supporter leaderboard, post management (pin/edit/delete), comment moderation, profile editing, goal setting.

## Demo Accounts

- Creator: `aipopgirl@demo.com` / `ai123456789` → redirects to `/creator`
- Demo fans: `sakura@demo.com`, `mixpop@demo.com`, `cute88@demo.com`, `yellow@demo.com`, `supporter1@demo.com` — all with password `demo123456`

## User preferences

- White-and-yellow cute/kawaii theme
- Mobile-first layout with bottom navigation bar
- No emojis in UI (use icons from lucide-react)
- Blue verification badge on all user profiles

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after changing schema files
- Never import `@workspace/api-client-react/src/custom-fetch` without adding it to the package `exports` first
- The `pg` package is not in the workspace catalog — use `drizzle-orm` (which is) for DB access

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
