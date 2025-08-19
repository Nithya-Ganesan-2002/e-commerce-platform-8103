# Prisma migrations

- `prisma migrate deploy` applies already-generated and committed migrations from `prisma/migrations`.
  Use this in CI/CD or production. If there are no migrations committed, this command will not create tables.

- `prisma migrate dev` creates a new migration from your current `schema.prisma` and applies it to the database.
  Use this during development to create the initial migration.

- DATABASE_URL must be available to Prisma CLI. Set it in `.env` or provide `MYSQL_URL`, `MYSQL_USER`,
  `MYSQL_PASSWORD`, `MYSQL_DB`, `MYSQL_PORT` and the `prisma/init.js` helper will compose it.

Common flows:
1) First time setup (no migrations yet):
   - Copy `.env.example` to `.env` and fill values.
   - `npm run prisma:generate`
   - `npm run db:init`  (runs `prisma migrate dev --name init`)

2) Subsequent deployments (migrations committed):
   - Ensure `.env` has `DATABASE_URL`
   - `npm run prisma:migrate`  (runs `prisma migrate deploy`)
