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

Use `npm run db:plan` after schema changes and `npm run db:studio` to inspect a configured development database. The user table is a starter model and has no password hash column yet.

## Authentication boundary

Authentication packages are installed, but authentication, CSRF, session, role, and item routes are not implemented by this starter. Unknown endpoints return JSON 404. The frontend login and signup forms are prepared for the documented `/api/auth/v1/` endpoints; submitting them cannot create a user or authenticate until those backend features are implemented.

Google OAuth and password recovery are also not implemented. The signup page's 30-day trial copy matches the supplied design; trial activation/billing logic is not implemented.

## Dashboard preview

The frontend `/dashboard` route recreates `frontend/design/Dashboard-ref-design.png`. Overview figures, charts, and stock lists are explicitly labeled sample data and are kept in `frontend/src/data/dashboard-demo.ts`. They are not queried from Neon. The page is a public preview, not an authenticated workspace.

Product search filters both stock lists. Chart grouping switches between monthly values and quarterly totals, including the partial final quarter. Legends toggle purchase/sales visibility. Stock details, notifications, report CSV export, and in-session display preferences are implemented. Supplier/store-management screens remain unavailable. Product/profile thumbnails are extracted from the user-provided reference image.

Run `npm test` in `frontend/` for data filtering and aggregation checks.

Production requires separate private `JWT_SECRET` and `CSRF_SECRET` values of at least 32 characters. Empty development secrets are generated in memory and change when the process restarts. `.env` is ignored by Git.

## Dependency audit

The installed stable Drizzle Kit dependency tree currently reports four moderate audit findings through its legacy esbuild loader. These are development tooling dependencies; `npm audit --omit=dev` checks the runtime dependency set separately. No forced version downgrade or unverified transitive override is applied.

Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99
