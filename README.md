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

## Core features

- JWT register/login/logout/me with bcrypt password hashing.
- User profile, goals, BMI, BMR, TDEE, calorie target, and macro target calculations.
- Food database with categories, verified seed data, user custom foods, favorites-ready model, recent/popular search endpoints, and admin verification.
- Daily diary for breakfast/lunch/dinner/snack with per-portion calorie and macro calculations.
- Weight tracking and goal progress data.
- Daily, weekly, monthly, yearly reports with calories, macros, meal breakdown, top foods, and weight history.
- Rule-based smart suggestions for missing calories/protein or calorie-overrun warnings.
- Barcode manual lookup/submission and food image upload placeholder for future AI recognition.
- Redis and cloud storage can be added without changing API boundaries; the current upload service stores local files under `uploads/`.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 10+

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start PostgreSQL and create the database named `calo`, then update `DATABASE_URL` if needed.

4. Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Seed categories, users, barcode products, and 100+ Vietnamese foods:

```bash
npm run seed
```

Seeded accounts:

- User: `demo@calo.vn` / `password123`
- Admin: `admin@calo.vn` / `password123`

6. Run the ecosystem:

```bash
npm run dev
```

Default URLs:

- API: http://localhost:4000/api/health
- Web dashboard: http://localhost:5173
- Admin panel: http://localhost:5174
- Mobile: `npm run dev --workspace @calo/mobile`

## Development commands

```bash
npm run build
npm run typecheck
npm run seed
npm run prisma:generate
npm run prisma:migrate -- --name change_name
```

## Product notes

- Vietnamese food search supports Vietnamese and English names, category filters, and calorie range filters.
- The web dashboard is responsive and includes bottom-navigation style ergonomics on small screens.
- The Expo app includes the required daily-user screen architecture: onboarding/auth-ready profile, home, add/search food, diary, barcode placeholder, weight/stats/report/profile placeholders.
- Admin functionality is intentionally separated into `apps/admin` while the web dashboard also exposes an admin route for power users with admin tokens.
