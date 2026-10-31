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

The workspace routes require a verified frontend session. Business lists remain in-memory frontend state, not database-connected APIs. Item CRUD remains a documented example and is not implemented. No product, supplier, order, store or recipe records are seeded. Supplier/order reference datasets are absent from initial state and test fixtures.

`scripts/verify-admin.ts` verifies the requested admin against the configured database without creating business records or extra accounts. Credentials arrive through stdin, and verification removes only its own token IDs. Services follow the documented one-service-per-file convention and reuse the shared repository, schemas and response view.

Password handling follows [OWASP bcrypt guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html); CSRF configuration follows the installed [csrf-csrf v4 API](https://github.com/Psifi-Solutions/csrf-csrf). Google login, password recovery and email delivery remain unavailable.

Google OAuth, password recovery, email delivery, and trial activation/billing are not implemented. The unused Nodemailer packages were removed during the October 31 audit. Logout still clears browser cookies when the supplied refresh cookie has expired or is malformed; valid sessions are revoked normally and database errors are not swallowed.

## Dashboard preview

The protected frontend `/dashboard` route follows `frontend/design/Dashboard-ref-design.png`. Business lists start empty, charts and transaction metrics remain zero, and values are not queried from Neon. Currency is PHP. Manual supplier/order/store entries survive client-side navigation through the shared workspace provider. All business state resets on reload, logout, or account changes.

Product search filters the available stock lists. Chart grouping switches between monthly values and quarterly totals, including the partial final quarter. Legends toggle purchase/sales visibility. Stock details, notifications, report CSV export, and in-session display preferences are implemented. Supplier, order, inventory, report, and store screens exist; sales/purchase metrics are not wired to transactions. No sample thumbnails or stock allocations are injected into entered inventory records.

Run `npm test` in `frontend/` for data filtering and aggregation checks.

Production requires separate private `JWT_SECRET` and `CSRF_SECRET` values of at least 32 characters. Empty development secrets are generated in memory and change when the process restarts. `.env` is ignored by Git.

## Dependency audit

The installed stable Drizzle Kit dependency tree currently reports four moderate audit findings through its legacy esbuild loader. These are development tooling dependencies; `npm audit --omit=dev` checks the runtime dependency set separately. No forced version downgrade or unverified transitive override is applied.

Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99
