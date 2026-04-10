# Actnow

Inspiration is fleeting, Don't hesitate ~ Actnow. A platform for sharing and discovering creative inspiration.

[![GitHub stars](https://img.shields.io/github/stars/hehehai/actnow)](https://github.com/hehehai/actnow/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/hehehai/actnow)](https://github.com/hehehai/actnow/network/members)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Factnow.dev)](https://actnow.dev)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Features

- **Share Inspiration** - Post your creative ideas, code snippets, and design concepts
- **Discover Content** - Browse posts with multiple feed options (Latest, Trending, Popular)
- **Weekly Leaderboard** - Discover top-rated posts each week
- **Social Engagement** - Like and save your favorite posts
- **Tag System** - Organize and discover content by tags
- **Subscription Billing** - Better Auth + Polar plans (`Free` / `Pro` / `Pro+`) with monthly and yearly billing
- **Profile System** - User bio, social links, and account/session management in profile settings
- **Feedback Workflow** - In-app feedback create/update/delete under authenticated user routes
- **Admin Dashboard** - Analytics, user management, and content moderation

## Subscription Rules

| Plan | Max Posts | Private Posts |
|------|-----------|---------------|
| `FREE` | 20 | Not allowed (public only) |
| `PRO` | 3000 | Allowed |
| `PRO_PLUS` | 10000 | Allowed |

- Post limits and visibility constraints are enforced server-side in API services.
- Subscription snapshot is synced from Polar webhook events into local user fields for fast UI queries (menu/profile/panel).

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TanStack Start (SSR), TanStack Router |
| **Styling** | Tailwind CSS v4, shadcn/ui (base-nova) |
| **API Layer** | oRPC (end-to-end type-safe RPC) |
| **Database** | Cloudflare D1 + Drizzle ORM |
| **Authentication** | Better Auth (Email/Password, GitHub, Google OAuth) |
| **File Storage** | Cloudflare R2 + Image/Video Transformations |
| **Email** | React Email + Resend |
| **Deployment** | Cloudflare Workers + Wrangler |
| **Code Quality** | Biome + Ultracite |
| **Package Manager** | pnpm (monorepo workspaces) |

## Project Structure

```
actnow/
├── apps/
│   └── web/                      # Full-stack application (port 3002)
│       └── src/
│           ├── routes/           # File-based routing
│           │   ├── (auth)/       # Auth pages (login/signup/reset)
│           │   ├── (app)/        # Protected app routes
│           │   ├── (admin)/      # Admin dashboard routes
│           │   └── api/          # API route handlers
│           ├── components/
│           │   ├── ui/           # shadcn/ui components
│           │   ├── shared/       # Shared components
│           │   └── features/     # Feature-specific components
│           ├── lib/              # Utilities (auth-client, utils)
│           ├── hooks/            # Custom React hooks
│           └── stores/           # State management
│
├── packages/
│   ├── api/                      # oRPC entrypoints + routers/services
│   │   └── src/
│   │       ├── routers/          # Thin route handlers (app / panel / common / auth)
│   │       ├── services/         # Domain business logic (app/*, panel/*)
│   │       └── lib/              # Shared server utilities
│   ├── auth/                     # Better Auth configuration
│   ├── db/                       # Drizzle database schema
│   ├── email/                    # React Email templates
│   └── common/                   # Shared types and validations
```

## Installation

### Prerequisites

- Node.js 24+
- pnpm 10+
- Cloudflare account (for remote D1 / Workers deploy)

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/hehehai/actnow.git
cd actnow
pnpm install
```

2. Configure local Worker secrets:

```bash
cp apps/web/.dev.vars.example apps/web/.dev.vars
```

Edit `apps/web/.dev.vars` with your values (see [Environment Variables](#environment-variables) below).
For local TanStack Start + Cloudflare development, this is the preferred config source.
`apps/web/.env` is now only a legacy fallback for plain Node-based tooling.

3. Configure D1 in [`apps/web/wrangler.toml`](/Users/guanwei/x/doit/actnow-react/apps/web/wrangler.toml):

- Local development uses the checked-in `env.development` D1 binding together with `.wrangler/state`.
- Before running against a real Cloudflare database, replace `database_id` with your actual D1 database ID.
- Keep the binding name as `DB`, because the app and auth layer resolve D1 from that binding.

4. Initialize the local D1 schema:

```bash
pnpm run db:generate
pnpm run db:migrate
```

Optional seed data:

```bash
pnpm run db:seed
```

`db:seed` will reset the local D1 sample tables before inserting fresh demo data.

## Development

Start the development server:

```bash
pnpm run dev
```

Visit [http://localhost:3002](http://localhost:3002)

### Commands

```bash
# Development
pnpm run dev          # Start all apps (runs local D1 migrations, then vite dev with CLOUDFLARE_ENV=development)
pnpm run dev:web      # Start web app only

# Type Checking
pnpm run check-types  # Check TypeScript types across all packages

# Code Quality
pnpm run check        # Biome formatting and linting
npx ultracite fix     # Auto-fix code issues

# Database
pnpm run db:generate            # Generate migration files
pnpm run db:migrate             # Alias of local D1 migration
pnpm run db:migrate:local       # Apply migrations to local D1 (development env)
pnpm run db:migrate:remote      # Apply migrations to remote D1 (development env)
pnpm run db:migrate:production  # Apply migrations to production D1
pnpm run db:seed                # Reset and seed local D1 with sample data
pnpm run cf-typegen             # Generate Wrangler/Cloudflare runtime types from development env
```

## Environment Variables

### Files and loading

- Use `apps/web/.dev.vars` for local Worker development with `vite dev` / Wrangler bindings.
- Keep non-secret runtime defaults in [`apps/web/wrangler.toml`](/Users/guanwei/x/doit/actnow-react/apps/web/wrangler.toml).
- `apps/web/.env` is only a fallback for plain Node-based tooling.
- In the Cloudflare runtime, server-side code reads Worker bindings/env first.
- Only variables prefixed with `VITE_` are exposed to the browser. **Never** put secrets in `VITE_` variables.

### Variable Reference

#### Core Configuration

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `CORS_ORIGIN` | Yes | Allowed origin for auth and API requests | Set to your app URL in production (e.g. `https://your-domain.com`). |
| `BETTER_AUTH_URL` | Yes | Base URL used by Better Auth for redirects and emails | Should match the public URL of the app. |

#### Database (D1)

- D1 is configured through the `DB` binding in [`apps/web/wrangler.toml`](/Users/guanwei/x/doit/actnow-react/apps/web/wrangler.toml), not through `DATABASE_URL`.
- Local D1 state is persisted in [`apps/web/.wrangler/state`](/Users/guanwei/x/doit/actnow-react/apps/web/.wrangler/state) after running migrations.
- Local development uses the `development` environment in Wrangler config.
- Replace the placeholder `database_id` values in Wrangler config before applying remote migrations or deploying.

#### Authentication

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `BETTER_AUTH_SECRET` | Yes | Token signing secret | Generate with `pnpm dlx @better-auth/cli@latest secret` and keep it private. |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID | Needed for GitHub login. |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret | Needed for GitHub login; keep secret. |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID | Needed for Google login. |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret | Needed for Google login; keep secret. |

#### Polar Billing

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `POLAR_ACCESS_TOKEN` | Yes | Polar organization access token | Create in Polar organization settings. |
| `POLAR_WEBHOOK_SECRET` | Yes | Secret used to verify Polar webhook payloads | Configure webhook endpoint at `/api/auth/polar/webhooks`. |
| `POLAR_ENVIRONMENT` | Yes | Polar environment (`sandbox` or `production`) | Keep token/product IDs aligned with the selected environment. |
| `POLAR_PRODUCT_PRO_MONTHLY_ID` | Yes | Polar product ID for Pro monthly | Used by pricing checkout slug `pro-monthly`. |
| `POLAR_PRODUCT_PRO_YEARLY_ID` | Yes | Polar product ID for Pro yearly | Used by pricing checkout slug `pro-yearly`. |
| `POLAR_PRODUCT_PRO_PLUS_MONTHLY_ID` | Yes | Polar product ID for Pro+ monthly | Used by pricing checkout slug `pro-plus-monthly`. |
| `POLAR_PRODUCT_PRO_PLUS_YEARLY_ID` | Yes | Polar product ID for Pro+ yearly | Used by pricing checkout slug `pro-plus-yearly`. |

### API Namespaces

- `app.*`: authenticated user-facing business APIs (`post`, `like`, `user`, `feedback`)
- `panel.*`: admin/panel APIs
- `common.*` / `auth.*`: shared and auth-related endpoints

#### Email (Resend)

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `EMAIL_USER` | Yes | From email address used in transactional emails | Must be a sender verified in Resend. |
| `RESEND_API_KEY` | Yes | Resend API key | Required for verification and magic-link emails. |

#### Cloudflare R2 Storage

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `CLOUD_FLARE_R2_ACCOUNT_ID` | Optional | Cloudflare account ID for R2 | Required if you enable media uploads. |
| `CLOUD_FLARE_S3_UPLOAD_BUCKET` | Optional | R2 bucket name | Required if you enable media uploads. |
| `CLOUD_FLARE_S3_UPLOAD_KEY` | Optional | R2 S3 access key | Keep secret. |
| `CLOUD_FLARE_S3_UPLOAD_SECRET` | Optional | R2 S3 secret key | Keep secret. |
| `VITE_CLOUD_FLARE_R2_URL` | Optional | Public base URL for reading media | Can be an R2 public URL or custom domain; exposed to the client. |

#### Platform/Runtime (Optional)

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `VERCEL_URL` | Optional | Legacy alternate deployment URL | Only used as a fallback in shared URL helpers. |
| `VERCEL_ENV` | Optional | Legacy alternate deployment environment | Only used as a fallback in shared URL helpers. |

## Build

```bash
pnpm run build
```

Build output is located at `apps/web/dist/` (`client/` for static assets, `server/` for the server bundle).

## Deployment

This project is now configured for Cloudflare Workers + D1 through the checked-in [`apps/web/wrangler.toml`](/Users/guanwei/x/doit/actnow-react/apps/web/wrangler.toml).

### Production Build

```bash
pnpm run build
```

### Cloudflare Deploy Checklist

1. Create real D1 databases in Cloudflare and replace the placeholder `database_id` values in [`apps/web/wrangler.toml`](/Users/guanwei/x/doit/actnow-react/apps/web/wrangler.toml).
2. Apply the schema to the remote D1 database:

```bash
pnpm run db:migrate:production
```

3. Set production secrets with Wrangler, for example:

```bash
cd apps/web
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put POLAR_ACCESS_TOKEN
wrangler secret put POLAR_WEBHOOK_SECRET
```

4. Deploy the app:

```bash
pnpm run deploy
```

Wrangler will deploy the Worker plus the built client assets from `apps/web/dist/`.

## License

[Apache License 2.0](LICENSE)
