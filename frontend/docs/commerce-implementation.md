# Commerce implementation

This extension connects the electronics storefront to ADMIN catalog management and saved customer orders. It preserves the existing public reference sequence, PHP currency, cookie authentication, eight catalog products and manual empty supplier/branch starting state. No dependency, raster asset, sample account or business record was added.

## Behavior

Only ADMIN can open workspace routes or management APIs. Signup creates USER customers; customers return to the store and can use `/account/orders` for their own history. Existing login/session/refresh/logout and CSRF/CORS guards remain.

ADMIN products edit the same catalog the public store reads: electronics families, prices, publication, images, stock and thresholds. Null stock is unknown (Not set), zero is out of stock. No expiry date is invented. Expected-version comparison rejects stale saves, including editors opened before an order reservation/cancellation. Refresh and reopen before retrying an edit. Successful saves refresh the shared public catalog so SPA navigation back to the store reflects the edit.

Orders are customer purchases, replacing the old supplier purchase-order meaning. The user chose dummy-card checkout instead of PayMongo: browser validation accepts only `4242 4242 4242 4242`, CVV `123`, a cardholder name and a current/future month in MM/YY. Card fields stay in local component state. The API never receives/stores them, and rejects card or forged ownership/status/payment fields. No gateway, real charge, real revenue, delivery booking or tax service exists.

The server prices/snapshots each order, validates publication/current prices/known stock and reserves known stock transactionally. Unknown stock remains unknown. UUID idempotency returns the original same-account/same-payload order; conflicting reuse fails. The browser retains only an opaque SHA-256 payload digest and attempt UUID in session storage, with a memory fallback. No address or card input goes into that storage. Memory fallback survives SPA navigation, not document reload; check My orders after uncertain responses.

Saved history survives reload. Unsubmitted cart, address, favorites and shipping preferences remain temporary and reset on reload/logout. Fulfillment progresses pending → confirmed → processing → shipped → delivered. Eligible cancellation is terminal and restores reserved stock once. Dashboard/Reports charts and exports count actual non-cancelled demo-paid orders as **simulated** sales, never profit or real revenue. Category snapshots preserve historical family totals.

See [backend API and transaction details](../../backend/docs/commerce-api.md).

## Implementation files

| Responsibility | Files |
| --- | --- |
| Routing and access | `src/app-routes.tsx`; `src/components/context/protected-route.tsx`, `customer-route.tsx`, auth and inventory provider/guards; backend `src/middlewares/admin.middleware.ts` and management routes |
| Shared commerce loading/state | `src/components/context/commerce-context.ts`, `commerce-provider.tsx`; `src/components/common/commerce-layout.tsx`; storefront provider/context |
| ADMIN screens | `src/pages/admin-dashboard.tsx`, `admin-products.tsx`, `admin-orders.tsx`, `admin-reports.tsx`; existing `suppliers.tsx`, `manage-store.tsx` |
| Product editor and sales/order UI | `src/components/features/inventory/catalog-product-form.tsx`; `src/components/features/orders/customer-order-details.tsx`, `demo-sales-chart.tsx`; `src/styles/commerce.css` |
| Customer checkout/history | `src/pages/payment.tsx`, `customer-orders.tsx`; `src/components/features/landing/payment-options.tsx`, summary/storefront controls; `src/lib/checkout-attempt.ts` |
| Typed frontend boundary | `src/data/admin-catalog.ts`, `customer-orders.ts`, `storefront-catalog.ts`; `src/services/admin-catalog.ts`, `customer-orders.ts`, `catalog.ts` |
| Backend catalog | `backend/src/routes/catalog.routes.ts`, controller, catalog schemas/view, catalog repository and catalog services |
| Backend customer orders | `backend/src/routes/customer-order.routes.ts`, controller, schema/model/view, repository and `services/customer-orders/create-order-service.ts` |
| Database | Additive `backend/drizzle/0004_premium_celestials.sql`, `0005_rainy_lockheed.sql`, `0006_jittery_next_avengers.sql` and generated metadata |
| Verification | `frontend/tests/demo-orders.test.mjs`, checkout/catalog/auth tests; backend customer-order/admin-catalog/auth tests and `backend/tests/commerce-database.test.ts` |
| Durable records | `PRODUCT.md`, factual commerce additions in `DESIGN.md` and `.impeccable/design.json`; updated cart/address/shipping/payment/detail briefs and new ADMIN commerce brief |

Paths beginning `src/` are relative to frontend; `backend/` paths are relative to the repository root. This is an implementation map, not a claim that every listed existing file was created by this extension.

## Verification evidence and limits

The implementation owner's reported checks are frontend lint/build plus 56 passing tests; backend lint/typecheck/build plus 23 passing tests and two opt-in database skips. The opt-in live commerce database test passed once with rollback. Final frontend ESLint and all 56 tests passed after the bounded review fixes; the production build passed in 878ms. Final backend lint/build and the live rollback test also passed. See the retained logs and final task report for command evidence.

A normal-session browser flow exercised ADMIN login, demo purchase, saved history after reload, cancellation and reload. The isolated order was removed afterward. The database check then showed two users, eight catalog products, zero customer orders, zero workspace records and seven migrations. These are check-time counts, not guarantees about later data.

Development-server browser evidence is under `.taste-skill/commerce/browser/` at 1440, 768 and 390px. The bounded confirmation under `.taste-skill/commerce/confirmation/` contains twelve captures, all opened by the finish reviewer. It reports zero document overflow, readable 14px chart labels, successful keyboard horizontal chart scrolling, and supplier headings at 5.90:1 against white. Four material review fixes received a scoped ship disposition in `.taste-skill/commerce/finish-verdict.md`: chart readability, supplier contrast, true-empty Add guidance, stacked sheets/content-height store empty state.

That disposition covers those fixes only. Production-build browser validation **did not pass**: the allowed API-origin/CORS configuration prevented the permitted production browser path. Automatic approval review rejected a second temporary API origin/port; no guards or origin restrictions were bypassed. Development captures cannot satisfy Taste's required production gate, so the whole UI is not certified visually complete. The confirmation scanner retains 125px Store and 42px Recent customer orders blank-band advisories. No further polish loop was run beyond the shared ceiling.

Source app lint finished with nine files and zero failures/warnings. The installed Impeccable detector ran once after UI implementation and reported five type-ramp advisories; it is not an accessibility certification. Initial source/test evidence, browser functional evidence and independent review evidence have distinct scope.

Preexisting drift was reported, not repaired: an older `.impeccable/surfaces/frontend-src-pages-landing-tsx.md` still describes the superseded notebook landing; stale skill/config/hook artifacts remain outside this extension. Normative incumbent palette/type tokens were preserved. No marketing imagery/motion quotas were applied to Operate screens.

## Reproduction

Use the existing private environment configuration without printing secrets. From the repository root:

```powershell
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix backend run lint
npm --prefix backend run typecheck
npm --prefix backend test
npm --prefix backend run build
```

For a new deployment, run the additive migration command from backend; do not reset or seed:

```powershell
npm --prefix backend run db:migrate
```

The opt-in live commerce test uses the configured database and rolls back its isolated transaction:

```powershell
Push-Location backend
$env:COMMERCE_DATABASE_TEST = '1'
npx tsx --test tests/commerce-database.test.ts
Remove-Item Env:COMMERCE_DATABASE_TEST
Pop-Location
```

Run existing backend/frontend development commands on already permitted origins. Use an existing authorized ADMIN session to inspect products, suppliers, orders, reports and branches. Use a legitimate customer or existing authorized session to enter an isolated cart/address/shipping preference and the displayed dummy card, place a demo order, reload history, cancel and reload. Inspect only that account's orders; customers must remain blocked from workspace APIs. Check the payload excludes card fields. Never seed accounts/records or disable guards merely to obtain screenshots.

For production visual validation, serve the production build only through a permitted configured origin. Run Taste's app source/inspection commands from the repository root at 1440/768/390 as project instructions require. Do not change origin security to force a gate; record unavailable checks. This handoff intentionally leaves that gate unresolved.
