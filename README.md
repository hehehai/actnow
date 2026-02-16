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
| **Database** | PostgreSQL + Drizzle ORM |
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
│   └── web/                      # Full-stack application (port 3001)
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
- PostgreSQL database (local or hosted)

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/hehehai/actnow.git
cd actnow
pnpm install
```

2. Configure environment variables:

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` with your values (see [Environment Variables](#environment-variables) below). This file is used by
the web app, API, auth, and database tooling.

3. Create the database (if you haven't yet), then initialize the schema:

```bash
pnpm run db:push
```

Optional seed data:

```bash
pnpm run db:seed
```

## Development

Start the development server:

```bash
pnpm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

### Commands

```bash
# Development
pnpm run dev          # Start all apps
pnpm run dev:web      # Start web app only

# Type Checking
pnpm run check-types  # Check TypeScript types across all packages

# Code Quality
pnpm run check        # Biome formatting and linting
npx ultracite fix     # Auto-fix code issues

# Database
pnpm run db:push      # Push schema changes to database
pnpm run db:generate  # Generate migration files
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio
pnpm run db:seed      # Seed database with sample data
```

## Environment Variables

### Files and loading

- Use `apps/web/.env` (copy from `apps/web/.env.example`).
- Server-side code reads `process.env`.
- Only variables prefixed with `VITE_` are exposed to the browser. **Never** put secrets in `VITE_` variables.

### Variable Reference

#### Core Configuration

| Variable | Required | Description | Notes |
|----------|----------|-------------|-------|
| `CORS_ORIGIN` | Yes | Allowed origin for auth and API requests | Set to your app URL in production (e.g. `https://your-domain.com`). |
| `BETTER_AUTH_URL` | Yes | Base URL used by Better Auth for redirects and emails | Should match the public URL of the app. |
| `DATABASE_URL` | Yes | PostgreSQL connection string | Used by the app and Drizzle tooling; add SSL options if your host requires it. |

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
| `VERCEL_URL` | Optional | Vercel deployment URL | Used to compute base URL in production. |
| `VERCEL_ENV` | Optional | Vercel environment name | When `production`, base URL falls back to `site.url`. |

## Build

```bash
pnpm run build
```

Build output is located at `apps/web/dist/` (`client/` for static assets, `server/` for the server bundle).

## Deployment

### Overview

This repository does not include provider-specific deployment config (no `wrangler.toml`, `vercel.json`, or `Dockerfile`),
so you will need to add one for your target platform. The build output already separates static assets and the server
bundle, which most platforms can consume.

### Production Build

```bash
pnpm run build
```

### Deploy Checklist

1. Provide all required environment variables from [Environment Variables](#environment-variables).
2. Serve the build output:
   - Static assets: `apps/web/dist/client`
   - Server bundle: `apps/web/dist/server`
3. Configure your platform to route requests to the server bundle and serve static assets.

### Cloudflare Workers (if you choose Cloudflare)

1. Create `apps/web/wrangler.toml` (not checked in) and point it to the build output:
   - `main` should point at `dist/server/index.js`
   - `assets` should point at `dist/client`
2. Put non-sensitive values in `wrangler.toml` and secrets via `wrangler secret put`.
3. Deploy with Wrangler.

### Other Platforms

For Vercel, Docker, or a custom Node host, add the appropriate adapter/config for TanStack Start and ensure the runtime
has the same environment variables as in `apps/web/.env`.

## License

[Apache License 2.0](LICENSE)
