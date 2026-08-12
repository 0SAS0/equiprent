# EquipRent

EquipRent is a monorepo for equipment rental management. It contains a Next.js web app, a NestJS API, a Prisma/PostgreSQL database package, and a Clojure report service used for CSV/PDF reports.

## Project structure

```txt
apps/
  api/              NestJS backend API
  web/              Next.js frontend
  report-service/   Clojure CSV/PDF report service
packages/
  db/               Prisma schema, generated client and database helpers
```

## Requirements

- Node.js compatible with the project dependencies
- pnpm
- Docker Desktop, for PostgreSQL and the report service
- Java 21, only if you want to run `apps/report-service` locally without Docker
- Clojure CLI, only if you want to run `apps/report-service` locally without Docker

## Environment variables

Create a local `.env` file in the repository root. The file is ignored by Git and should not be committed.

Example:

```env
# Database used by Prisma/API
DATABASE_URL="postgresql://equiprent:equiprent_secret@localhost:5432/equiprent"

# API
PORT=3001
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
REPORT_SERVICE_URL="http://localhost:3002"

# Optional API hardening configuration
# Comma-separated list of allowed browser origins.
# If omitted, the API falls back to local/equiprent defaults.
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=300

# Email notifications
# Required only when sending emails through Resend.
RESEND_API_KEY="re_replace-with-your-resend-api-key"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Report service, used by Docker Compose and by local Clojure runs
DB_HOST=localhost
DB_NAME=equiprent
DB_USER=equiprent
DB_PASSWORD=equiprent_secret
```

### Notes about secrets

- Never commit `.env`, `.env.local`, production secrets, API keys or database passwords.
- Use a long random value for `BETTER_AUTH_SECRET` in real environments.
- The Docker Compose database credentials are development defaults only.

## Install dependencies

```bash
pnpm install
```

## Start development environment

### 1. Start PostgreSQL and report service

```bash
docker compose up -d postgres report-service
```

This starts:

- PostgreSQL on `localhost:5432`
- Report service on `localhost:3002`

If you only want the database:

```bash
docker compose up -d postgres
```

### 2. Generate Prisma client

```bash
pnpm db:generate
```

### 3. Run migrations

```bash
pnpm db:migrate
```

### 4. Start frontend and backend

```bash
pnpm dev
```

This runs:

- web app on `http://localhost:3000`
- API on `http://localhost:3001`, assuming `PORT=3001`

You can also start them separately:

```bash
pnpm dev:web
pnpm dev:api
```

## Report service

The API proxies report endpoints through `/reports` and talks to the report service through `REPORT_SERVICE_URL`.

Public API endpoints used by the frontend:

- `GET /reports/csv`
- `GET /reports/pdf`
- `GET /reports/stats`

Internal report-service endpoints:

- `GET /report/csv`
- `GET /report/pdf`
- `GET /report/stats`
- `GET /health`

### Run report service with Docker

Recommended for local development:

```bash
docker compose up -d report-service
```

The service depends on the `postgres` service and uses the database settings from `docker-compose.yml`.

### Run report service locally without Docker

From `apps/report-service`:

```bash
clojure -M:run
```

Make sure these variables are set for local runs:

```env
DB_HOST=localhost
DB_NAME=equiprent
DB_USER=equiprent
DB_PASSWORD=equiprent_secret
PORT=3002
```

## Useful commands

```bash
# Start web and API
pnpm dev

# Start only web
pnpm dev:web

# Start only API
pnpm dev:api

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Build API
pnpm --filter @equiprent/api build

# Test API
pnpm --filter @equiprent/api test

# Build web
pnpm --filter @equiprent/web build

# Production dependency audit
pnpm audit --prod
```

## Validation and security already configured

The API includes:

- global NestJS `ValidationPipe` with DTO whitelisting and transformation
- role checks for sensitive equipment, reservation, return and report endpoints
- security headers
- configurable CORS
- basic global rate limiting
- pagination limits on list endpoints

## Troubleshooting

### API cannot connect to the database

Check that PostgreSQL is running:

```bash
docker compose ps
```

Then verify `DATABASE_URL` points to the local database:

```env
DATABASE_URL="postgresql://equiprent:equiprent_secret@localhost:5432/equiprent"
```

### Reports do not work

Check that report service is running:

```bash
docker compose up -d report-service
```

Then open:

```txt
http://localhost:3002/health
```

Also verify the API has:

```env
REPORT_SERVICE_URL="http://localhost:3002"
```

### Auth/cookies do not work locally

Make sure frontend and backend URLs match the env values:

```env
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### After dependency changes

If dependencies or Prisma schema changed, run:

```bash
pnpm install
pnpm db:generate
```
