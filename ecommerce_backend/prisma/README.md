# Prisma migrations

- `prisma migrate deploy` applies already-generated and committed migrations from `prisma/migrations`.
  Use this in CI/CD or production. If there are no migrations committed, this command will not create tables.

- `prisma migrate dev` creates a new migration from your current `schema.prisma` and applies it to the database.
  Use this during development to create the initial migration.

- DATABASE_URL must be available to Prisma CLI. Prefer setting it directly in `.env`:
  Example: DATABASE_URL="mysql://USER:PASS@HOST:PORT/DB"
  Alternatively, provide `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`, `MYSQL_PORT`
  and the `prisma/init.js` helper will compose it. Note: If your environment injects `MYSQL_URL`
  as a full URL (e.g., mysql://host:port/db), the init script will parse it and extract host/port/db.

Common flows:
1) First time setup (no migrations yet):
   - Copy `.env.example` to `.env` and fill values.
   - `npm run prisma:generate`
   - `npm run db:init`  (attempts `prisma migrate dev --name init`, and if permissions prevent shadow DB creation, it falls back to `prisma db push` to create tables)

2) Subsequent deployments (migrations committed):
   - Ensure `.env` has `DATABASE_URL`
   - `npm run prisma:migrate`  (runs `prisma migrate deploy`)
   - If your environment does not allow `CREATE DATABASE` (shadow DB), you can continue using `prisma db push` for schema updates, but note it won’t create migration files.
