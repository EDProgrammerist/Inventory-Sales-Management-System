# Dashboard and Product Info restoration

The original references in `frontend/design/dashboard design/` govern this
restoration: `Dashboard-ref-design.png` and `Product Info-ref-design.jpg`. The
connected electronics catalog, customer demo orders, public storefront and
existing authentication remain in place. This is an Operate restoration of the
incumbent Geist/blue/white/cool-neutral workspace.

The dashboard restores paired Sales Overview/Inventory Summary and Order
Overview/Product Summary rows, sales/order charts and top-selling/low-stock
panels. Desktop columns are 1.8:1; below 1280px they stack. Recent customer orders
remain below. Original colored Phosphor overview icons are explicitly preferred
by the user. Customer fulfillment replaces unsupported supplier purchases;
costs, profit and inbound stock are not fabricated. Known stock alone contributes
to totals and alerts.

Product Info now has a dedicated ADMIN `/inventory/:productId` route linked by
inventory names and View details. It restores the title/actions, four underline
tabs, primary details and photo/stock summary. Edit reuses the catalog form and
version-checked save. Download exports actual details as CSV. Purchases uses
saved customer-order lines; History uses placement dates and current status.
Separate adjustment logs, edit timestamps, opening stock and per-store stock
allocations are unavailable and labeled honestly. Supplier matches use exact
recorded product names.

Implementation: `src/pages/admin-dashboard.tsx`, `src/pages/admin-product-info.tsx`,
`src/pages/admin-products.tsx`, `src/app-routes.tsx`, `src/data/admin-dashboard.ts`,
`src/components/features/dashboard/customer-order-chart.tsx` and
`src/styles/commerce.css`. Existing overview, catalog form, tabs and sales chart
are reused. Pure analytics and isolated server-rendered fixture tests verify
semantics without writing business records. No backend, authentication, public
store, dependency or database changes are part of this restoration. Existing
product photographs are reused; no rasters were generated or added.

Other modified source/test files: `src/data/customer-orders.ts` (shared active-demo
predicate), `src/components/features/dashboard/dashboard-overviews.tsx` (live
metric inputs), `src/components/features/inventory/product-tabs.tsx` (existing
contrast tokens), `src/components/features/orders/demo-sales-chart.tsx` (valid
SVG title text), `scripts/commerce-render-check.tsx` and
`tests/admin-dashboard.test.mjs`. Documentation updates are `PRODUCT.md`,
`DESIGN.md`, the dashboard surface brief and the new Product Info surface brief.

Direction is recorded in repository-root
`.taste-skill/dashboard-restoration/plan.md` and `direction.json` (seed 1001228512;
keep palette/type). Explicit references override generic dealt frame geometry.
The browser scan's `icon-chips` failure remains a documented user-preference
exception, not an unqualified scan pass. The initial 53px low-stock blank-band
advisory was reviewed as nonmaterial with its honest empty-state explanation.

Evidence is under repository-root `.taste-skill/dashboard-restoration/`.
Frontend ESLint, all 59 tests and the production build passed after implementation
fixes. `tests.log` reports 59 passed and zero failures; `build.log` records the
successful Vite/TypeScript build. Taste's source app scan reported five files,
zero failures and zero warnings. The one post-implementation Impeccable detector
has three font-ramp advisories in `detector.json`; hooks and skills were unchanged.

Initial review opened dashboard and Product Info captures at 1440, 768 and 390px,
all without document overflow (`browser/report.json`). These are development
captures with the normal ADMIN guard. Browser checks covered tab/keyboard
navigation, opening Edit and Escape cancellation without saving, CSV download,
inventory detail links and missing-product rendering. `finish-review.md` found
one material issue: missing-product search was inert. Shared query state and
matching catalog detail links now address it. `confirmation/report.json` verifies
the fix at 1440, 768 and 390px: typing `iphone` returns four matching links without
document overflow, selecting a result opens `/inventory/iphone-purple` with its
details visible and clears the query. This was the single confirmation round.
The [final scoped review](../../.taste-skill/dashboard-restoration/finish-verdict.md)
marks that sole material fix resolved with disposition `ship`; it explicitly does
not certify the whole surface or the unavailable production browser gate.

The production browser gate remains unverified because current API allowed
origins do not permit the production preview origin. No alternate API config,
origin bypass, guard bypass or seeded screenshot records were used. Successful
source/tests/build and local browser evidence do not establish a production
visual-gate pass. Measured contrast, reduced-motion rendering and all loading/
error variants are not established by screenshots alone. This record supersedes
the former stacked-dashboard description while preserving Reports/public-store
directions. See the [initial browser report](../../.taste-skill/dashboard-restoration/browser/report.json),
[confirmation report](../../.taste-skill/dashboard-restoration/confirmation/report.json),
[initial review](../../.taste-skill/dashboard-restoration/finish-review.md),
[test log](../../.taste-skill/dashboard-restoration/tests.log) and
[build log](../../.taste-skill/dashboard-restoration/build.log) for the respective
source, behavior and review evidence.
