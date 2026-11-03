# Dashboard HCI, MVC and CRUD verification — November 3, 2026

## Completion follow-up — November 3, 2026

The user authorized finishing the remaining work and explicitly excluded deployment and production verification from this student project's local acceptance criteria. The findings in the initial check-only review below are historical and are superseded by this follow-up.

| Area | Current result |
|---|---|
| Targeted local HCI checks | **Passed for the tested states.** Refresh now exposes pending, success and recoverable error feedback; confirmation dialogs support keyboard cancellation and restore focus; mobile inventory actions have their own row. This is not full accessibility or participant-testing certification. |
| MVC | **Implemented.** Existing model/controller/JSON-view separation is preserved, with new removal services/repository operations. |
| CRUD | **Implemented with documented deletion rules.** Suppliers now has an editing UI. Products, Suppliers, Stores and Customer Orders expose Delete through the admin interface and authenticated API. Order deletion is logical and restricted to cancelled orders; products referenced by any saved order cannot be physically deleted. |
| Deployment | **Not performed.** Vercel and Render remain future targets. |

### What changed and why

- `components/common/commerce-refresh.tsx` shares the feedback UI across Dashboard, Products and Orders. `components/context/commerce-provider.tsx` retains the last loaded data on refresh failure and announces how to retry. A ref prevents repeated refresh clicks; a successful mutation starts a new read and aborts an older in-flight read, avoiding stale responses reintroducing a removed record.
- `pages/suppliers.tsx` and `components/features/suppliers/supplier-form.tsx` reuse the existing form for Update, populate saved fields/image, exclude the edited row from duplicate validation, and preserve the on-way quantity. Existing product labels remain selectable if the catalog label changed. Placeholder and return-option text use the existing readable muted token.
- `components/ui/delete-record-dialog.tsx` shares explicit consequences, Keep record, Delete record, pending feedback and errors across the four modules. The existing `dashboard-dialog.tsx` focuses Keep record, restores its invoking control, and prevents dismissing the dialog while deletion is pending.
- `pages/admin-products.tsx`, `pages/admin-orders.tsx`, `pages/suppliers.tsx` and `pages/manage-store.tsx` connect the actions to services/providers and update their lists after server confirmation. `styles/commerce.css` gives action cells a full mobile row, preventing overlap with the publication status.
- Backend catalog/workspace/customer-order routes and controllers connect the new operations to the established layers. Authentication, ADMIN checks, CSRF, restricted CORS and ownership rules remain in place. No account seeding, resets, dependency additions, environment changes or README edits were performed.

### Deletion rules

| Entity | Delete behavior | Protection |
|---|---|---|
| Catalog Product | Physical removal from admin/public catalog | Requires owner and current expectedVersion. Locks the product and rejects any saved order reference, including logically deleted orders. Hide a referenced product using Edit instead. |
| Supplier | Physical removal from the current admin's workspace list | Ownership and kind are part of the database predicate; missing/foreign records return 404. Product/order records are unchanged. |
| Store | Physical removal from the current admin's workspace list | Same ownership protection; no changes to order address snapshots. |
| Customer Order | Separate logical Delete removes a cancelled order from customer/admin lists | Active and delivered orders are protected. Cancellation must already have released stock. The internal order and retry key remain, so repeating the old checkout returns 409 rather than reserving stock again. Deletion never restores stock a second time. |

Migration `backend/drizzle/0007_shallow_skin.sql` adds only nullable `customer_order.deleted_at`. It was generated, inspected and applied to the configured development database without changing existing order values. Logical deletion is intentionally distinct from cancellation and from physical erasure; the project's Delete capability must be described with this policy during a presentation.

### Verification evidence

| Check | Result |
|---|---|
| Frontend ESLint, TypeScript/build and full test suite | Passed; **56 tests, 0 failures** |
| Backend ESLint and TypeScript | Passed |
| Backend suite with COMMERCE_DATABASE_TEST and WORKSPACE_DATABASE_TEST | **26 passed, 0 failed, 0 skipped** |
| New test-first rollback assertions | Failed first because Delete was missing; then passed for ownership, stale versions, references, supplier Update, cancelled-order Delete, filtered reads and retry protection. All isolated transactional writes rolled back. |
| Authenticated HTTP CRUD against localhost:7000 | Passed using the supplied existing admin through normal login: Supplier/Store create-read-update-delete; Product create-read-update-delete; order create/cancel/delete; stale version 409, active-order 409, referenced-product 409, missing-record 404 and deleted-checkout retry 409. |
| Existing business data | HTTP harness compared complete pre/post catalog, order and workspace responses. Existing records were unchanged. Only isolated QA records were cleaned; the earlier checkout test order remains. |
| Live browser Supplier/Store | Created isolated records, edited them, waited for successful completion and reloaded to verify persistence. Supplier first-invalid-field focus, Escape restoration and Store Keep record were checked. QA records were subsequently removed through authenticated HTTP Delete. |
| Live browser refresh | Disabled Refreshing button and aria-busy/status observed. Offline simulation displayed an alert while retaining Dashboard and its data; restoring the network and retrying reached Store data is up to date. Offline emulation was reset. |
| Live browser confirmation | Keep record receives initial focus; Tab reaches Delete; Escape retains the product and restores the specific Delete trigger. Permanent Delete submission was verified through HTTP and rollback tests, not a complete browser deletion journey. |
| Responsive DOM measurements | Five changed routes × 1440/768/390px: **15 measurements, zero page-level overflow**, loaded headings present. Final mobile inventory screenshot confirms separated action/status rows. |

`backend/scripts/verify-local-crud.ts` is an explicit local QA harness. It requires QA_PASSWORD in the process environment (and optional QA_EMAIL), uses normal authentication, creates isolated records, and cleans those exact records in finally. It also cleans the two specifically named browser QA records. It never seeds accounts or logs credentials. It deliberately removes only its own order tombstone during cleanup, after verifying logical deletion/retry protection; application users cannot physically erase order tombstones.

### Visual review and remaining limits

Evidence is under `.taste-skill/crud-completion-2026-11-03/`. `responsive-confirm.json` records the 15 DOM measurements; `verification.json` indexes checks and limits. `inventory-mobile-final.jpg` is the authoritative final mobile inventory screenshot, and `dashboard-final.jpg` shows successful refresh feedback. Both final screenshots were opened and reviewed. The initial screenshots exposed crowded mobile action cells, which were fixed in the single confirmation round. Some native/CDP confirmation PNGs were clipped or scaled by the browser capture surface; they are **not** proof of layout clipping or a full screenshot pass. `manage-store-390-confirm.png` from the initial fallback correctly shows the phone empty state. Screenshot failures were handled through the same permitted browser, without forging sessions or disabling access guards.

Taste app source lint scanned 10 UI targets: zero FAIL and one shadow advisory on the real dialog overlay. Impeccable's one manual detector run found four pre-existing type-ramp advisories (supplier 10px badge/image-reading text and commerce summary 24px rules). The established icons, palette and typography were retained. This is scoped Operate/component refinement: the documented component exception skips a new draw. Impeccable's earlier context fallback remains documented in the main HCI report. No skill files/hooks were modified.

Production visual inspection remains unverified after the earlier preview account-service error. It is **not a local final-project blocker under the user's clarified scope**, and no deployment was attempted. Full screen-reader speech, comprehensive keyboard-only checkout/CRUD, exhaustive contrast variants, high-contrast mode, runtime profiling and participant testing remain unverified. The final local results close the identified implementation gaps; they do not certify universal HCI/WCAG compliance.

References for the implementation decisions: [W3C status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages), [PostgreSQL row locking](https://www.postgresql.org/docs/current/explicit-locking.html).

### Scoped file manifest

Paths below are relative to the project root. Other existing working-tree changes belong to earlier work and were preserved.

- Backend: `src/db/schema.ts`; `src/repositories/{catalog,workspace,customer-order}.repository.ts`; `src/controllers/{catalog,workspace,customer-order}.controller.ts`; `src/routes/{catalog,workspace,customer-order}.routes.ts`; new `src/services/catalog/delete-catalog-service.ts` and `src/services/workspace/delete-record-service.ts` (all under `backend/`).
- Database artifacts: `backend/drizzle/0007_shallow_skin.sql`, `backend/drizzle/meta/0007_snapshot.json`, `backend/drizzle/meta/_journal.json`.
- Backend verification/docs: `backend/tests/admin-access.test.ts`, `commerce-database.test.ts`, `response-privacy.test.ts`, `workspace.test.ts` in the same tests folder; new `backend/scripts/verify-local-crud.ts`; `backend/docs/commerce-api.md`.
- Frontend integration: `frontend/src/services/{admin-catalog,customer-orders,workspace}.ts`; `frontend/src/components/context/{commerce-context,workspace-context}.ts` and `{commerce-provider,workspace-provider}.tsx`.
- Frontend UI: `frontend/src/pages/{admin-dashboard,admin-products,admin-orders,suppliers,manage-store}.tsx`; `frontend/src/components/features/suppliers/supplier-form.tsx`; `frontend/src/components/ui/dashboard-dialog.tsx`; new `frontend/src/components/ui/delete-record-dialog.tsx` and `frontend/src/components/common/commerce-refresh.tsx`; `frontend/src/styles/commerce.css`.
- Frontend verification/docs: `frontend/tests/workspace-persistence.test.mjs`, `frontend/scripts/{commerce-render-check,product-render-check}.tsx`, `frontend/docs/{crud-completion-plan,dashboard-mvc-crud-audit,hci-audit}.md`.

## Initial check-only review (historical)

### Original verdict

| Area | Result | Meaning |
|---|---|---|
| Dashboard HCI principles | **Partial pass** | Tested navigation, chart alternatives, search recovery, totals and responsive layouts work. Refresh feedback needs improvement, and the full production/assistive-technology/usability checks remain incomplete. |
| MVC architecture | **Implemented, adapted for a JSON API** | The Express backend separates data models, controllers and JSON views, with services/repositories supporting them. The React frontend uses components, providers and services; it is not itself a classical MVC implementation. |
| Complete CRUD | **Not complete** | Catalog and Stores expose Create/Read/Update. Suppliers lacks a UI Update flow. None of these business modules exposes Delete. Order cancellation changes status and retains the record. |

This is a verification report, not a course grade or WCAG certification. No application source, routes, authentication, schema, migrations, README or existing business records were changed. Only this report and the audit index were edited. Isolated database writes were rolled back by the existing tests.

## Dashboard HCI evidence

The review uses [Nielsen's ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/). “Supported” below means evidence exists for the tested states; it does not mean every user, browser and input method has passed.

| Principle | Evidence | Assessment |
|---|---|---|
| Visibility of system status | Initial workspace loading is explicit; current order states, demo-payment labels and unknown-stock explanations are visible. Refresh data remains enabled without a refreshing label, busy state or live status. | **Partial — refresh feedback gap** |
| Match with the real world | PHP prices, electronics categories and customer-fulfillment names are used. Demo sales are explicitly simulated; unknown stock reads Not set. | Supported |
| User control and freedom | Workspace menu opens by keyboard; Escape closes it and restores Open menu focus. Dashboard links lead to management screens. CRUD limitations below restrict correcting/removing some records. | Supported navigation; record-management gaps |
| Consistency and standards | Shared workspace shell, Geist, outline icons, currency helper and native dialog/disclosure controls are reused. Requested reference icon colors were preserved. | Supported |
| Error prevention | Schemas reject malformed inputs. Role/ownership checks, edit versions, stock checks and order retry identity are covered by tests. | Source/test evidence; not every form exercised live |
| Recognition rather than recall | Metrics have labels; stock qualifications and order statuses are visible; chart values have a text disclosure. Keyboard activation opened all monthly values. | Supported |
| Flexibility and efficiency | Search produced honest no-match messages for top-selling products, stock and recent orders. Clearing the query recovered the lists. Manage products and order links are available. | Targeted pass; full keyboard-only work not verified |
| Aesthetic/minimalist design | Dashboard and Reports were loaded, captured and reviewed at 1440, 768 and 390px. All six measurements showed zero page-level horizontal overflow. Cards/records stack on phones. | Pass for captured layouts; long/populated variants not exhaustive |
| Error recognition and recovery | No-match copy explains the result. The production account-service error offers Try again. Server validation, malformed-response recovery and stale edits are covered by tests. | Partial; live offline/error recovery not exhaustive |
| Help and documentation | Simulated payment, unknown stock, excluded alerts and chart-scroll instructions explain actual limitations. | Supported local explanations; no participant comprehension study |

### Confirmed findings

1. **[P2, HCI] Refresh feedback is missing.** `src/pages/admin-dashboard.tsx:22` binds Refresh data directly to `refresh`. `src/components/context/commerce-provider.tsx:16-24` increments a revision but does not expose a refresh-pending state after the initial load. Immediately after browser activation, Refresh data remained enabled and no status or busy region was present. This is a source-confirmed feedback gap; the browser observation alone does not establish network duration. A scoped follow-up can expose pending/complete/error feedback while retaining the current data.
2. **[Requirement gap, CRUD] Delete is absent.** Catalog, workspace and customer-order routes provide no record-removal endpoint, and their connected management interfaces have no Delete operation. Hiding a product or cancelling an order does not remove that record from its management list/history. Retaining order history can be intentional, but it must not be presented as complete CRUD.
3. **[Requirement gap, CRUD] Supplier Update is not exposed by the UI.** The Suppliers page offers Add, filters, details and CSV export. `WorkspaceProvider` calls `save('suppliers', record)` with the default create mode, and `saveSupplier` exposes no update argument. The generic backend PUT route exists, but the user cannot reach it through a supplier edit flow.

No fixes were applied during this check-only review. Defining Delete/archive rules or adding supplier editing is implementation work beyond a verification report. A full-CRUD requirement needs those gaps resolved and tested; it does not justify silently deleting historical orders.

### Data consistency

Both Dashboard and Reports showed PHP 91,980.00 for two active demo orders. The current orders were one pending and one delivered; two units of the same PHP 45,990.00 product reconcile with that total. Eight products had stock Not set, so unknown quantities did not become zero and were excluded from low-stock alerts. Suppliers remained zero. These are check-time values, not permanent project facts.

### Production and tool limits

- Fresh frontend production build passed. Production preview was started on `http://localhost:4173` without changing allowed origins or authentication guards.
- Taste `inspect.mjs --app http://localhost:4173/dashboard --widths 1440,768,390` reached **the account-service error state**, not the authenticated dashboard. Its report exited 1 with `no-title` at 1440px and a void warning on that error screen. This does not show that the loaded development dashboard lacks an h1; it blocks a full production dashboard visual pass.
- All three production error-state screenshots and all six development Dashboard/Reports screenshots were opened. No guards, sessions or data were forged to get past the error state.
- Taste app source lint scanned five requested files and reported no findings. Impeccable detector reported two existing 22px type-ramp advisories, on overview figures and sidebar branding. They are advisories, not confirmed accessibility failures; no typography or skill records were changed.
- This is an Operate/app-screen review of the incumbent direction. A review stops at the existing-screen evidence stage; no new style draw or redesign was performed. The prior session's Impeccable context-launcher failure/direct-context fallback remains recorded in `hci-audit.md`; no hooks, skills or design records were repaired.
- Actual screen-reader output, comprehensive keyboard-only tasks, full rendered contrast/state coverage, runtime performance profiling and real-user usability testing were not completed. The original source-only score is not recertified by this review.

App screenshot critique: the screen identifies Shenban and its current page; overview figures and task links lead; sections share the canvas and monetary figures reconcile. Unknown quantities, zeros and empty states remain honest. On phones, navigation folds and record tables reflow. Charts retain internal horizontal scrolling and text-value alternatives; showing only the left part of a chart at 390px is not a complete chart inspection. Spacious empty panels and initial-load-only feedback limit a blanket visual/usability verdict.

## MVC trace

[MVC separates model, view and controller responsibilities](https://developer.mozilla.org/en-US/docs/Glossary/MVC). The project explicitly documents a JSON-API adaptation in `backend/docs/expressjs-api-setup-mvc.md`; the following was verified in current source rather than inferred from folder names.

| Responsibility | Actual source | Verified role |
|---|---|---|
| Model/data definitions | `backend/src/db/schema.ts`, `backend/src/models/customer-order.model.ts`, `backend/src/models/auth.model.ts` | Drizzle tables, relationships and domain types define data. `schema/*.schema.ts` separately validates incoming input. |
| Controller | `backend/src/controllers/catalog.controller.ts`, `workspace.controller.ts`, `customer-order.controller.ts` | Receives HTTP input/session identity, invokes services or repository reads, chooses status and JSON response. |
| View/presenter | `backend/src/views/catalog.view.ts`, `workspace.view.ts`, `customer-order.view.ts` | Shapes response data; public/customer responses exclude administrative or internal fields. These are JSON presenters, not HTML templates. |
| Service | `backend/src/services/catalog/save-catalog-service.ts`, `workspace/save-record-service.ts`, `customer-orders/create-order-service.ts` | Validates requests, enforces immutable IDs and translates persistence conflicts. Some transactional order rules live in the order repository. |
| Repository | `backend/src/repositories/catalog.repository.ts`, `workspace.repository.ts`, `customer-order.repository.ts` | Runs database queries, ownership filters, row/version checks and transactions. |
| Routes/middleware | `backend/src/routes/`, `backend/src/middlewares/` | Maps methods/URLs and applies authentication, ADMIN checks and CSRF. |
| Frontend presentation/integration | `frontend/src/pages/`, `components/`, `services/` | React renders the interface; providers/services connect it to the API. Current Suppliers/Stores calls are connected to persisted workspace services, despite older local-state descriptions. |

Concrete write trace: catalog POST/PUT → `adminSave` controller → `saveCatalog` service → `adminCatalogInput` validation → `writeCatalog` repository → Drizzle catalog table → `adminCatalogView` presenter → JSON → frontend catalog service/provider → React interface.

The architecture is MVC with supporting layers, not a promise that every request passes through an identical three-function chain. Simple reads can go from a controller to a repository and presenter. No folder reorganization was needed for this verification.

## CRUD verification matrix

[CRUD means Create, Read, Update and Delete](https://developer.mozilla.org/en-US/docs/Glossary/CRUD). A dashboard/report is a derived read surface; it does not need to be an independent CRUD entity.

| Module | Create | Read | Update | Delete | Evidence/limit |
|---|---|---|---|---|---|
| Catalog Products | Implemented | Implemented | Implemented, version checked | **Absent** | `GET/POST /api/catalog/v1/admin/products`; `PUT .../:id`. Isolated DB create/edit/read and stale-version/ownership checks passed. Published/hidden is not deletion. |
| Suppliers | Implemented | Implemented | **Backend route available; UI absent** | **Absent** | Generic workspace POST/GET/PUT exists, but provider/page only expose create and read. Existing rollback test verifies supplier creation/read, not a browser supplier-edit journey. |
| Stores | Implemented | Implemented | Implemented | **Absent** | Workspace routes plus Add Store/Edit UI. Isolated DB create/read/update and frontend service update tests passed. Existing live store list was empty, so a saved UI edit was not performed. |
| Customer orders | Customer checkout | Owner/admin lists | Controlled fulfillment and cancellation | **Absent** | POST `/api/orders/v1`, GET `/mine` and `/admin`, PUT `/admin/:id`, POST `/:id/cancel`. Rollback checks exercised fulfillment and one-time cancellation stock restoration. Cancellation retains history. |
| Dashboard/Reports | Not applicable | Implemented, derived | Reflect underlying data | Not applicable | Current UI totals reconciled; dashboard calculations/empty stock behavior passed automated tests. |

Persisted supplier/store/product records were not created through the browser solely to obtain screenshots. Because Delete cleanup is unavailable, doing so would leave new records behind. Browser form wiring/source, frontend tests and database rollback tests are distinct forms of evidence; this report does not label them a complete browser CRUD pass.

## Fresh checks

| Check | Result |
|---|---|
| Standard backend suite | 24 passed, 2 opt-in database tests skipped |
| Backend suite with both DB flags enabled | **26 passed, 0 failed, 0 skipped** |
| Frontend suite | **56 passed, 0 failed** |
| Backend TypeScript checking | Passed |
| Frontend TypeScript/production build | Passed |
| Dashboard/Reports responsive measurements | Six loaded captures at 1440/768/390px, zero page overflow |
| Authenticated production dashboard visual gate | Blocked at account-service error; inspector exited 1 |

The opt-in tests use the existing configured database/accounts, create isolated records inside transactions, throw an intentional rollback and assert test records are absent afterward. They do not seed users or reset the database. Existing PostgreSQL SSL-mode deprecation warnings were observed; environment configuration was not edited.

From the project root, the opt-in command used was:

```powershell
$env:COMMERCE_DATABASE_TEST = '1'
$env:WORKSPACE_DATABASE_TEST = '1'
npm --prefix backend test
```

These environment values were scoped to the verification process. No credentials, connection strings or tokens are saved in this report.

Evidence files are under `.taste-skill/dashboard-mvc-crud-2026-11-03/`: `responsive.json`, `dashboard-<width>.jpg`, `reports-<width>.jpg`, `dashboard-final-fold.jpg`, `source-lint.json`, `detector.json`, and `production-dashboard/report.json` with its three-width screenshots. Local app servers were started for the review; no deployment was performed.
