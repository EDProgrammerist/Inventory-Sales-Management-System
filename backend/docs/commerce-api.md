# Shenban administration and demo checkout

The user chose a dummy card purchase flow instead of PayMongo. There is no gateway, real charge, delivery booking, tax calculation, or real revenue. Only the displayed 4242 test number, future expiry and demo CVV 123 pass browser validation. Card fields remain local component state; the checkout API accepts none of them.

## Access

Signup creates USER customers. Customers can shop and use `/account/orders`, but cannot open dashboard routes or workspace/catalog-management/fulfillment APIs. ADMIN users retain those capabilities. Authorization uses the current database session user, not a submitted role. Writes retain existing cookie authentication, CSRF checks and restricted CORS configuration.

## Catalog

- Public `GET /api/catalog/v1/products` returns published products with safe image fields.
- ADMIN `GET/POST /api/catalog/v1/admin/products` lists or creates catalog products.
- ADMIN `PUT /api/catalog/v1/admin/products/:id` edits the same catalog the storefront reads. ID cannot change. `expectedVersion` is required on edits; a stale version returns 409. Refresh the list and reopen the editor before saving again.
- Supported families: phones, computers, consoles. Prices use PHP. Stock null means unknown; zero means out of stock. Stock thresholds and publication are explicit. Electronics have no fabricated expiry date.
- Images use bundled fallback keys or validated inline PNG/JPEG/WebP uploads. No remote image URL or SVG upload is accepted. Catalog writes have a scoped 8 MB JSON limit; normal requests retain smaller limits.

## Orders

Authenticated endpoints under `/api/orders/v1`:

| Method/path | Behavior |
| --- | --- |
| POST `/` | Strict demo-card order: UUID idempotency key, product ID/quantity/expected price lines, delivery address and shipping preference. |
| GET `/mine` | Only the signed-in account's saved orders. |
| POST `/:id/cancel` | Owner cancellation, or ADMIN management; unavailable once shipped/delivered. |
| GET `/admin` | ADMIN customer-order list, including customer contact fields. |
| PUT `/admin/:id` | ADMIN next fulfillment step only. |

Orders snapshot names, variants, product families, quantities, server prices, address and shipping preference. The server rejects unpublished products, stale prices, insufficient known stock, duplicate lines, forged ownership/status/payment fields and card fields. Known stock is decremented transactionally; unknown stock remains unknown for demo testing and does not imply real availability.

Same user/key retries return the original order; a reused key with another payload returns 409. Stable row locks and a unique index protect reservations. Cancellation restores a reservation once. Reservations, cancellations and catalog edits advance the product version to prevent stale editors overwriting stock.

The browser retains only an opaque checkout digest and attempt UUID in session storage, with a memory fallback. This permits same-tab navigation retries without storing delivery/card input. When storage is disabled, the fallback survives SPA navigation but not a full document reload; check My orders after an uncertain response. Successful checkout clears the attempt and purchased cart quantities. Saved order history survives reload; unsubmitted cart/address/shipping remain session UI state and reset on reload/logout.

Fulfillment: pending → confirmed → processing → shipped → delivered. Cancellation is terminal. Demo-paid active orders contribute to simulated sales; cancelled orders do not. Dashboard/report charts and exports use these saved orders, never fabricated profit or real payment totals. Category snapshots keep historical family totals stable when products are edited later.

## Database and checks

Additive migrations 0004–0006 add catalog metadata/version and customer-order enums/table. They do not reset accounts, tokens, existing catalog products or workspace lists. No gateway credentials are required. Run `npm run db:migrate` from backend for a new deployment.

`COMMERCE_DATABASE_TEST=1 npx tsx --test tests/commerce-database.test.ts` runs isolated catalog/order checks inside a rolled-back transaction against the configured database, reusing the existing admin without creating accounts. It verifies server pricing, ownership, known/unknown stock, stale edits, retry identity, fulfillment and one-time cancellation restoration. Standard tests skip live database tests unless opted in.
