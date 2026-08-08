# Auth Service Architecture

## Purpose

The auth service owns users, roles, passwords, access tokens, refresh tokens, password reset tokens, and user profile CRUD. Other services should not create or validate users directly.

The service is protected by an internal service API key and uses JWT Bearer tokens for protected user routes.

## Runtime

- Runtime: Node.js >= 24
- Framework: Express 5
- Language: TypeScript
- Database: PostgreSQL via Prisma
- Default local port in .env.example: 3000, but recommended system port is 4001
- Entry point: src/index.ts
- Routes root: src/routes/index.ts

## Install and Run

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Production-style local run:

```bash
npm run build
npm run start:development
```

Useful checks:

```bash
npm run types:check
npm run lint:check
npm run format:check
```

## Required Environment

From .env.example and src/config/environment.ts:

```env
PORT=4001
NODE_ENV=development
SERVICE_NAME=auth-service
DATABASE_URL=postgresql://user:password@localhost:5432/auth_service_db
BFF_API_KEY=shared-key-used-by-bff
JWT_SECRET=shared-jwt-secret
JWT_EXPIRES_IN=15
JWT_REFRESH_EXPIRES_IN=7
JWT_RESET_PASSWORD_EXPIRES_IN=1
LOG_LEVEL=info
APP_VERSION=1.0.0
BASE_URL=http://localhost:4001
APP_URL=http://localhost:5173
COMPANY_NAME="Local Development"
COMPANY_EMAIL=noreply@localhost
LOGO_URL=https://via.placeholder.com/200?text=Logo
SUPPORT_EMAIL=support@localhost
RESEND_API_KEY=re_development_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

The BFF's `AUTH_API_KEY` must equal this service's `BFF_API_KEY`.

## Database

Prisma schema: prisma/schema.prisma

Main models:

- User
- RefreshToken
- ResetPasswordToken
- RestaurantUser / admin-related role models depending on migrations

Commands:

```bash
npm run prisma:generate
npm run prisma:migrate:new
npm run prisma:migrate
npm run prisma:studio
```

## Route Mounts

src/routes/index.ts mounts:

| Mount     | Middleware | Purpose              |
| --------- | ---------- | -------------------- |
| /v1/auth  | x-api-key  | Auth endpoints       |
| /v1/users | x-api-key  | User/admin endpoints |

The BFF maps frontend /api/auth/_ to /v1/auth/_ and /api/users/_ to /v1/users/_.

## Auth Routes

| Method | Path                           | Auth                | Body                                         |
| ------ | ------------------------------ | ------------------- | -------------------------------------------- |
| GET    | /v1/auth/me                    | Bearer access token | none                                         |
| POST   | /v1/auth/check-email           | service API key     | { email }                                    |
| POST   | /v1/auth/signup                | service API key     | firstName, lastName, email, phone?, password |
| POST   | /v1/auth/login                 | service API key     | { email, password }                          |
| POST   | /v1/auth/logout                | service API key     | { refreshToken }                             |
| POST   | /v1/auth/refresh               | service API key     | { refreshToken }                             |
| POST   | /v1/auth/forgot-password       | service API key     | { email }                                    |
| POST   | /v1/auth/reset-password/verify | service API key     | { token }                                    |
| POST   | /v1/auth/reset-password/update | service API key     | { token, password }                          |
| POST   | /v1/auth/change-password       | Bearer access token | currentPassword, newPassword                 |

## Token Contract

Login returns access and refresh tokens in the response body:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

Protected routes expect:

```http
Authorization: Bearer <accessToken>
```

There is no cookie-setting logic in the auth controller currently. If the frontend is moving to HttpOnly cookies, implement that in the BFF or auth service and document it. Do not mix localStorage token auth and cookie auth without a clear migration plan.

## User Routes

Mounted under /v1/users. These routes use Bearer auth and role checks:

- GET /v1/users: platform_admin only
- GET /v1/users/:id: owner or platform_admin
- POST /v1/users: platform_admin
- POST /v1/users/restaurant-owner-invitations: platform_admin only; atomically reserves unique
  restaurant ownership and creates a short-lived owner invitation
- PATCH /v1/users/:id: owner or platform_admin
- DELETE /v1/users/:id: platform_admin

## Error Shape

Errors should return:

```json
{
  "success": false,
  "message": "...",
  "code": "..."
}
```

Stack traces are included outside production.

## Integration Rules

- Only this service validates passwords.
- Only this service issues access/refresh tokens.
- BFF should verify access tokens or call /v1/auth/me, then inject trusted actor headers to other services.
- Order/payment/restaurant services should not trust user identity from browser-provided headers.
- Restaurant team invitations store only a hash of the single-use token. The auth service rechecks the inviter's live membership and grantable roles for every team mutation.
- The current actor contract supports one active restaurant membership per user. `super_admin` can grant `admin`, `finance`, and `employee`; `admin` can grant or remove only `employee`.
- Initial restaurant ownership has a dedicated record with unique restaurant and provisioning ids.
  Creation is serialized per restaurant and stores only a hash of the short-lived invitation token.
  The owner chooses or confirms their password during invitation acceptance; only that transaction
  creates the `super_admin` membership and marks ownership accepted.

## Smoke Test

```bash
curl -X POST http://localhost:4001/v1/auth/check-email \
  -H 'content-type: application/json' \
  -H 'x-api-key: shared-key-used-by-bff' \
  -d '{"email":"user@example.com"}'
```

Login:

```bash
curl -X POST http://localhost:4001/v1/auth/login \
  -H 'content-type: application/json' \
  -H 'x-api-key: shared-key-used-by-bff' \
  -d '{"email":"user@example.com","password":"password"}'
```

Get current user:

```bash
curl http://localhost:4001/v1/auth/me \
  -H 'x-api-key: shared-key-used-by-bff' \
  -H 'authorization: Bearer <accessToken>'
```

## Known Decisions To Make

- Decide whether auth is token-in-response or HttpOnly cookie based.
- If cookie based, add cookie issuing and refresh handling before removing frontend token storage.
- Align frontend types with CommonResponseDTO wrappers. Several frontend types currently expect unwrapped responses in places.
