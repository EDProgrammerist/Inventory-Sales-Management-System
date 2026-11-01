# Installed backend starter

The MVC starter described in `expressjs-api-setup-mvc.md` is implemented in `backend/`.

## Run

```powershell
cd backend
npm run dev
```

- `GET http://localhost:7000/` returns instance status.
- `GET http://localhost:7000/api/health` returns API health independently of PostgreSQL.
- Frontend CORS origin defaults to `http://localhost:5173`; it must match the browser origin exactly.

## Checks

```powershell
npm run lint
npm test
npm run build
npm start
```

## Database preparation

`src/db/schema.ts` contains the guide's starter user/item tables. `src/models/item.model.ts` derives domain types, and `src/views/item.view.ts` excludes internal ownership fields from JSON. `src/db/index.ts` lazily creates one shared pool when a persisted feature requests it.

The initial migration under `drizzle/` was applied to the configured Neon database on October 29, 2026, after a read-only check confirmed there were no existing application tables. The database now has the starter `public.user` and `public.item` tables and Drizzle's migration journal. No sample business records were inserted.

Check connectivity and table/migration counts without printing the connection URL:

```powershell
npm run db:check
```

For future migrations, inspect the generated SQL before applying it:

```powershell
npm run db:migrate
```

Use `npm run db:plan` after schema changes and `npm run db:studio` to inspect a configured development database. The user table now includes password hashes, roles and authentication timestamps. Migration `0001_conscious_red_shift.sql` adds the authentication schema and token table; it does not add business tables or records.

## Authentication boundary

The documented `/api/auth/v1/` endpoints are implemented: GET csrf-token/session and POST login/signup/refresh/logout. Authentication uses bcrypt cost 12, HttpOnly cookies, signed double-submit CSRF tokens, 15-minute access tokens and 7-day refresh tokens. Refresh tokens are hashed in PostgreSQL, rotated atomically, and revoked by logout. Signup always creates USER accounts and rejects role injection. The supplied admin was created through `scripts/seed-admin.ts` using stdin credentials; no credentials are embedded in source.

The workspace routes require a verified frontend session and persist owner-scoped business records in `workspace_record` through `/api/workspace/v1`. Item CRUD remains a documented example and is not implemented. Supplier/order/store reference datasets are not automatically seeded. On November 1, the user explicitly authorized removal of the four old workspace records and import of the existing eight electronics display products into a separate catalog table. Account and token rows were preserved exactly. See [catalog migration](catalog-migration.md).

`scripts/verify-admin.ts` verifies the requested admin against the configured database without creating business records or extra accounts. Credentials arrive through stdin, and verification removes only its own token IDs. Services follow the documented one-service-per-file convention and reuse the shared repository, schemas and response view.

Password handling follows [OWASP bcrypt guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html); CSRF configuration follows the installed [csrf-csrf v4 API](https://github.com/Psifi-Solutions/csrf-csrf). Google login, password recovery and email delivery remain unavailable.

Google OAuth, password recovery, email delivery, and trial activation/billing are not implemented. The unused Nodemailer packages were removed during the October 31 audit. Logout still clears browser cookies when the supplied refresh cookie has expired or is malformed; valid sessions are revoked normally and database errors are not swallowed.

## Store administration and demo orders

Workspace access is ADMIN-only. Products manage the persisted electronics catalog, suppliers use the three electronics families and actual catalog names, and branches retain existing persistence. Checkout now saves customer demo orders, with customer-owned history and administrator fulfillment. Dashboard and reports use non-cancelled simulated payments, never real revenue. Additive migrations 0004 through 0006 are applied. See [commerce API and validation](commerce-api.md).

## Dependency audit

The installed stable Drizzle Kit dependency tree currently reports four moderate audit findings through its legacy esbuild loader. These are development tooling dependencies; `npm audit --omit=dev` checks the runtime dependency set separately. No forced version downgrade or unverified transitive override is applied.

Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99
