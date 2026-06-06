# Calo Việt — Vietnamese calorie and nutrition tracker

Calo Việt is a full-stack calorie tracking ecosystem for Vietnamese users. It includes a React/Vite web dashboard, a dedicated admin panel, an Expo mobile architecture, an Express REST API, PostgreSQL + Prisma schema, JWT authentication, seeded Vietnamese food data, nutrition/weight tracking, analytics, barcode placeholders, and upload-ready food-image placeholders.

## Monorepo structure

```txt
apps/
  web/       React + Vite power-user dashboard and mobile-first PWA-ready UI
  admin/     Dedicated admin operations panel
  mobile/    React Native Expo app architecture for iOS and Android
packages/
  api/       Node.js Express TypeScript REST API
  database/  Prisma schema, Prisma client export, seed data
  shared/    Shared validation schemas and nutrition calculators
docs/
  API.md     Endpoint documentation and payload examples
```

## Prerequisites

- Node.js 20 or newer.
- npm 10 or newer.
- PostgreSQL 14 or newer is optional. It is only needed when demo mode is disabled.
- A shell with standard development tools.

> This repository is an existing monorepo. Do not scaffold a new project; install and run the workspaces from this root directory.

## Installation steps

1. Clone or open the existing repository and enter the repo root.
2. Install workspace dependencies:

```bash
npm install
```

3. Optional: copy the environment template when you want to override defaults:

```bash
cp .env.example .env
```

4. Review the `.env` values before running migrations or the real database-backed API. The repository defaults to demo mode, so this step is not required to launch the local dashboard.

## Demo mode for local development

Demo mode is enabled by default for the API, web dashboard, and Expo app. It bypasses PostgreSQL and Prisma queries, serves local mock data for foods, today's dashboard, diary entries, goals, weight tracking, reports/statistics, suggestions, and admin food review, and stores only in-memory/session demo changes.

From a fresh checkout, run the local dashboard without PostgreSQL:

```bash
npm install
npm run dev
```

Then open the Vite web dashboard at <http://localhost:5173>. Log in with either demo account:

- User: `demo@calo.vn` / any password
- Admin: `admin@calo.vn` / any password

For mobile demo data, run:

```bash
npm run dev --workspace @calo/mobile
```

The Expo home, food search, diary, statistics, and profile tabs use the same local mock nutrition data and do not require PostgreSQL.

To opt out of demo mode and use the real API/database flow, set these environment values before starting apps:

```env
CALO_DEMO_MODE="false"
VITE_DEMO_MODE="false"
EXPO_PUBLIC_DEMO_MODE="false"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calo?schema=public"
```

## Environment setup

The root `.env.example` documents the shared settings used by the API, Prisma, Vite apps, and Expo app:

```env
CALO_DEMO_MODE="true"
VITE_DEMO_MODE="true"
EXPO_PUBLIC_DEMO_MODE="true"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calo?schema=public"
PORT=4000
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
UPLOAD_DIR="uploads"
VITE_API_URL="http://localhost:4000/api"
EXPO_PUBLIC_API_URL="http://localhost:4000/api"
```

Production deployments must set demo mode values to `false`, replace `JWT_SECRET`, use a production PostgreSQL URL, and restrict `CORS_ORIGIN` to trusted frontend origins.

## Database setup

Demo mode does not need these steps. Use them only when `CALO_DEMO_MODE=false`.

1. Start PostgreSQL.
2. Create a database named `calo` or update `DATABASE_URL` with the correct database name.
3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Run migrations during local development:

```bash
npm run prisma:migrate -- --name init
```

For production, prefer Prisma deploy migrations from your deployment pipeline instead of `migrate dev`.

## Seed instructions

Seed categories, demo users, barcode products, and Vietnamese food records:

```bash
npm run seed
```

Seeded accounts:

- User: `demo@calo.vn` / `password123`
- Admin: `admin@calo.vn` / `password123`

## Development commands

Run API, web, and admin together:

```bash
npm run dev
```

Run individual workspaces:

```bash
npm run dev --workspace @calo/api
npm run dev --workspace @calo/web
npm run dev --workspace @calo/admin
npm run dev --workspace @calo/mobile
```

Default local URLs:

- API health: <http://localhost:4000/api/health>
- Web dashboard: <http://localhost:5173>
- Admin panel: <http://localhost:5174>
- Expo mobile app: the Expo URL printed by `npm run dev --workspace @calo/mobile`

## Build commands

Build all buildable workspaces:

```bash
npm run build
```

Type-check all workspaces:

```bash
npm run typecheck
```

Run package-specific checks:

```bash
npm run typecheck --workspace @calo/api
npm run typecheck --workspace @calo/web
npm run typecheck --workspace @calo/admin
npm run typecheck --workspace @calo/mobile
```

## Core features

- JWT register/login/logout/me with bcrypt password hashing.
- User profile, goals, BMI, BMR, TDEE, calorie target, and macro target calculations.
- Food database with categories, verified seed data, user custom foods, recent/popular search endpoints, and admin verification.
- Daily diary for breakfast/lunch/dinner/snack with per-portion calorie and macro calculations.
- Weight tracking and goal progress data.
- Daily, weekly, monthly, yearly reports with calories, macros, meal breakdown, top foods, and weight history.
- Rule-based smart suggestions for missing calories/protein or calorie-overrun warnings.
- Barcode manual lookup/submission and food image upload placeholder for future AI recognition.
- Local upload storage under `uploads/`; Redis/cloud storage can be added later without changing API boundaries.

## Project health report

### What was reviewed

- Frontend route tree, dashboard, diary, foods, reports, goals, settings, admin route, shared API client, auth store, Tailwind styles, responsive navigation, and form accessibility.
- Dedicated admin app login flow, API calls, responsive layout, and auth-token handling.
- Expo mobile shell, tabs, screens, API client, import style, and route icon typing.
- Express API routes for auth, users, foods, diary, meal templates, weights, reports, suggestions, barcode, uploads, and admin operations.
- Prisma schema relations, indexes, uniqueness constraints, seed data, and database helper exports.
- Shared validation schemas and nutrition calculation helpers.
- Repository setup docs, environment template, and commands.

### What was fixed

- Reworked API route handlers to use clearer typed helpers, shared date handling, safer search filters, stricter upload limits, reusable goal creation, active-goal rollover, food recalculation when diary food changes, and weight upsert behavior for same-day entries.
- Added shared validation hardening for trimmed text, bounded numbers, normalized emails, nutrient limits, diary quantity limits, and weight limits.
- Improved API error responses for Zod validation and HTTP errors.
- Added missing `.env.example` because the README setup referenced it.
- Improved web app route fallback, stale-token boot handling, form labels, required inputs, error states, admin verification action, responsive tables, and focus styles.
- Improved dedicated admin app from a hard-coded one-click login into a credential form with error handling, logout, admin role enforcement, and responsive spacing.
- Improved mobile TypeScript quality by replacing loose icon lookup and inline style constants with typed maps and stylesheet entries.
- Added Prisma indexes for `Food.englishName` and `MealTemplate.userId` to support common lookup paths.

### Remaining limitations

- The mobile app still uses placeholder screens for diary/stat/profile flows and does not include persistent authentication storage yet.
- Food image recognition and barcode scanning remain placeholders by design.
- Local file uploads use local disk storage; production should use cloud/object storage.
- End-to-end tests, API integration tests, and visual regression tests are not yet present.
- Dependency installation could not be completed in this environment because the npm registry returned `403 Forbidden` for scoped packages, so full build/typecheck execution is blocked until dependencies are available.

### Recommended future improvements

- Add automated API integration tests against a disposable PostgreSQL database.
- Add Playwright smoke tests for login, diary entry creation, admin verification, and responsive navigation.
- Add Expo authentication, secure token storage, and real diary/report mobile screens.
- Add production migration scripts using `prisma migrate deploy`.
- Add rate limiting and audit logging for admin mutating routes.
- Move uploads to S3-compatible storage and validate uploaded MIME types.
