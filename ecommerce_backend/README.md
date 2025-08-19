# E-commerce Backend (Express + Prisma + MySQL)

This container exposes REST APIs for authentication, product catalog, cart, checkout/payment (integration point), and order history/tracking.

Key endpoints:
- Swagger UI: /docs
- OpenAPI JSON: /openapi.json

Getting started:
1) Copy .env.example to .env and fill values (JWT_SECRET, DB credentials).
2) Install deps: npm install
3) Generate Prisma client and run migrations:
   - npm run prisma:generate
   - npm run prisma:dev  (creates DB schema in dev and tracks migrations)
4) Seed data: npm run db:seed
5) Start server:
   - npm run dev  (hot reload)
   - npm start

Environment variables:
- MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT
- JWT_SECRET
- PAYMENT_PROVIDER, PAYMENT_API_KEY (not used in code except as integration placeholder)
- CORS_ORIGIN

Payments:
- checkoutService contains a payment integration point. Replace the stub with a call to your provider and save provider reference in paymentRef.

Scripts:
- prisma:generate, prisma:dev, prisma:migrate, db:seed, openapi:generate

```bash
curl -X POST http://localhost:3001/auth/register -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"secret123","name":"Alice"}'
```
