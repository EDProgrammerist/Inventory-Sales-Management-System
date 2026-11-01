# Storefront catalog migration

## Confirmed scope and design

The user approved clearing old business records and using the existing eight storefront products. Preserve all accounts, passwords, roles, sessions, and migration history. No payment processing, stock quantity, expiry date, supplier, order, or store is invented.

Use a dedicated typed `catalog_product` table because the existing grocery inventory contract requires an expiry and does not represent these electronics. The public catalog is read-only through `GET /api/catalog/v1/products`; the existing workspace endpoints and account ownership remain unchanged. The eight products become database-backed public display records, not grocery inventory records. Reuse existing product images through validated asset keys, existing cart math, filters, context, and PHP formatting. No dependencies or redesign.

## Implementation plan

- [x] Add a failing HTTP test for public catalog reads, safe output fields, and absent write endpoints; add a failing client test for validated responses and dynamic prices, then transport/error checks.
- [x] Add schema/model validation, repository, service, controller/view and read-only route; generate and inspect an additive Drizzle migration.
- [x] Move the approved product dataset into `backend/data/storefront-products.json`. Keep it an explicit import/test fixture, never a client fallback.
- [x] Add a manual import command guarded by an explicit destructive flag. Back up old business/catalog rows to an ignored local file, lock affected tables, validate the admin exists, clear only business rows, import eight catalog products, verify account/token rows unchanged, and commit atomically. Abort/rollback on error.
- [x] Load the catalog in storefront context through `services/`, with abortable loading and retryable error states using existing primitives. Derive cards, filters, variants, cart and checkout totals from the fetched catalog. Keep cart/address/shipping temporary and payment disabled.
- [x] Run backend/frontend lint, tests and builds, then apply reviewed migration and approved import. Verify database counts and unchanged account fingerprints without logging secrets.
- [x] Test real API and live browser reload, catalog navigation, dynamic cart totals and checkout. Production-browser origin setup was blocked as detailed below; production builds passed.

## Recovery and operational boundary

Backup files contain only business/catalog records and must stay local and ignored. The import is a deliberate maintenance action, never server startup behavior. Normal migrations create schema without deleting data. Do not rerun a reset to test an import; test failure paths in isolated rollback transactions. No database URL, password, token, or hash is printed. No authentication tables are truncated or dropped.

Migration approach follows [Drizzle's generate/migrate workflow](https://orm.drizzle.team/docs/migrations); the business replacement uses a [PostgreSQL transaction](https://www.postgresql.org/docs/current/sql-begin.html).

## Completed November 1, 2026

Migration `drizzle/0003_brave_la_nuit.sql` creates only the catalog enum/table/constraint and owner foreign key. It was generated, inspected and applied using `db:migrate`; the migration journal now has four entries. It does not delete business data or alter authentication tables.

After an explicitly rolled-back dry run, `npm run db:import-catalog -- --replace-business-data` committed the user-approved maintenance operation. Exactly four `workspace_record` rows were removed (one product, supplier, order and store); `item` had zero rows. Eight catalog records were inserted: four phones, two graphics cards and two consoles. The transaction compared every user/token row before and after; both comparisons were equal. Read-only verification afterward found one ADMIN, zero workspace rows and eight catalog products. No account was created or reset.

The committed operation's backup is `.local-backups/catalog-replacement-2026-11-01T03-51-12-682Z.json` at the repository root. The earlier dry-run backup is separate. The folder is excluded locally in `.git/info/exclude`; no backup contents are included in the source diff. On another checkout, configure that local exclusion before invoking the maintenance command; the command refuses an unignored backup destination. Do not run the command on normal startup or use it as a repeatable catalog updater: it intentionally clears business data.

### Validation evidence

- Backend lint/build passed; tests: 19 passed, 1 existing opt-in database test skipped.
- Frontend lint/build passed; tests: 53 passed. Decoder tests reject invalid prices, duplicate IDs, unsupported category/image keys; a changed API price drives cart arithmetic. Transport tests cover no-credential/no-cache fetch, HTTP failure, network failure, malformed JSON and honest empty catalog.
- Real `GET /api/catalog/v1/products` returns eight public products from Neon. Public responses exclude owner IDs, timestamps, account data and tokens; catalog writes have no endpoint.
- Browser checks on the running permitted `http://localhost:5173` -> `http://localhost:7000` connection: 27 catalog checks passed across 1440/768/390px, including reload, actual API/card prices, pagination, product details, cart, checkout access and overflow/images. Loading/error/retry states were verified using isolated request interception, then retry returned to the real API. Three state checks passed again after improving error-heading hierarchy.
- Existing full checkout browser regression passed all 60 checks with the fetched catalog: manual addresses, shipping dates, keyboard controls, billing selection and back/forward state. Test inputs remained disposable browser memory, not database records.
- Scoped Taste source lint: 0 FAIL/0 WARN. Impeccable detector ran once and reports one advisory for the intentional existing 22px error-heading scale; the value is recorded in DESIGN.md. No new visual direction, assets, fonts, dependencies or production styling system was introduced.
- Fresh independent source review found no high/medium material issues; review evidence is under `.taste-skill/catalog/code-review.md`. UI state screenshots under `.taste-skill/catalog/screenshots/` were opened at all tested widths. `git diff --check` passes with existing Git line-ending notices.

Automatic approval review rejected starting a second API with temporary port/origin settings, stating `blocked by policy`. No guard or CORS bypass was used. The production artifacts built successfully, but browser validation used the existing live development origin rather than claiming a production-page inspector pass. The initial extra production API start also found port 7000 already owned by the user's running tsx server; that server was retained and serves the new route. The task-owned unused preview on 4173 was stopped.

One browser-harness retry was necessary for React development StrictMode's cancelled fetch interception; a second checkout-harness attempt waited for the newly asynchronous catalog instead of assuming immediate local data. Neither required changing application logic or suppressing an application failure. The final error heading was adjusted to reuse the established compact type scale; its three state checks were confirmed once.

### Files and responsibilities

Backend created: `data/storefront-products.json`; `drizzle/0003_brave_la_nuit.sql` and `drizzle/meta/0003_snapshot.json`; `scripts/import-storefront-catalog.ts`; `src/schema/catalog.schema.ts`; `src/repositories/catalog.repository.ts`; `src/services/catalog/get-catalog-service.ts`; `src/views/catalog.view.ts`; `src/controllers/catalog.controller.ts`; `src/routes/catalog.routes.ts`; `tests/catalog.test.ts`; this migration record. Modified: `src/db/schema.ts`, `src/app.ts`, `drizzle/meta/_journal.json`, `package.json`, and the relevant implementation-status passages. Existing migrations were preserved.

Frontend created: `src/services/catalog.ts`; isolated `scripts/storefront-fixture.tsx` / `storefront-fixture-data.ts`; `tests/catalog-service.test.mjs`. Modified: `src/data/storefront-catalog.ts`, `storefront-cart.ts`, `storefront-details.ts`; context `storefront-context.ts` / `storefront-provider.tsx`; common `storefront-layout.tsx` / `checkout-frame.tsx`; pages `landing.tsx`, `products.tsx`, `store-product.tsx`, `cart.tsx`; landing features `product-filters.tsx`, `payment-summary.tsx`, `shipping-selection.tsx`, `checkout-prerequisites.tsx`, `address-selection.tsx`; `scripts/landing-render-check.tsx`; existing cart/landing/listing/detail tests; `PRODUCT.md` and `DESIGN.md` descriptions. Styling/authentication/routes and all environment files remain otherwise unchanged. Existing shared checkout/cart utilities now receive products explicitly, avoiding hidden static defaults.

The database-backed catalog is still a display catalog. Stock, grocery-inventory editing of electronics, customer checkout persistence, payment processing, order creation, delivery and transaction charts are not introduced by this migration.
