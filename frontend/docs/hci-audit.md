# HCI audit — November 2, 2026

Latest storefront results: [Storefront HCI audit — November 3, 2026](storefront-hci-audit.md). Tested local shopping tasks passed; two minor HCI refinements and full assistive-technology coverage remain outstanding. Homepage PS5 promotions now use the existing Disc, Digital and packaging photos, as requested. Frontend lint/build and 58 tests passed. The report retains unresolved visual-gate findings and does not claim full HCI certification or deployment verification.

Latest button-specific results: [Dashboard button HCI audit — November 3, 2026](dashboard-button-audit.md). **The three requested fixes passed targeted local retesting:** accurate information/preferences labels, restored order-confirmation keyboard flow and 44px shared buttons. Frontend lint/build and 57 tests passed. Full assistive-technology/participant testing and complete three-width screenshot certification remain unverified; the optional order-label improvement is still recorded separately.

Latest dashboard-specific results: [Dashboard HCI, MVC and CRUD verification — November 3, 2026](dashboard-mvc-crud-audit.md). Its completion follow-up records passing targeted local checks, implemented JSON-API MVC, Supplier editing and Delete actions with explicit order-history safeguards. Production/deployment verification is excluded from this student project's local acceptance criteria by the user. Full assistive-technology/user-testing certification remains unverified. The original and follow-up evidence below remain dated records.

## Verdict and scope

The application supports the main HCI principles in source and automated tests. **Targeted live browser checks now pass after the follow-up fixes below; a full usability/accessibility pass is still not verified.** Browser access was unavailable during the original audit, but became available for customer checkout and the follow-up review. Targeted keyboard checks and responsive screenshots are now recorded. Actual screen-reader output, comprehensive keyboard-only task completion, runtime performance profiling and real-user task testing remain outstanding. The full production visual gate is also blocked by catalog API access from the preview origin. No browser or authentication guards were bypassed.

This audit uses [Nielsen's ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/). It preserves the reference design, dashboard icons, authentication, accounts and business records. The only approved business-data update changes the two GPU model labels to ASUS ROG Astral OC; prices, stock, other catalog fields and historical orders are preserved. Edit versions advance normally.

## Findings and implemented fixes

| Severity | Finding | Implemented correction |
|---|---|---|
| P1 | Unknown public URLs redirected visitors to login without explaining the problem. | A public Page not found screen offers home/catalog recovery using the existing shared checkout frame. Admin/customer guards remain unchanged. |
| P1 | HTML or malformed API responses exposed JSON parsing errors; malformed account responses could do the same. | Shared business/account services provide actionable messages, preserve server validation errors and session-refresh behavior, and reject malformed envelopes. Already-aborted requests do not start new business requests. |
| P2 | Cart additions silently capped at nine while reporting success; feedback was not displayed in the cart. | Atomic cart state keeps quantities and feedback consistent, explains the limit visibly through a status message, and clears notices on checkout/account reset. |
| P2 | Refresh orders had no pending feedback or protection against repeated refresh clicks. | Refresh disables while loading, displays its pending state and clears the previous error before retrying. |
| P1 | Store contact text and unspecified supplier status were too faint. | Reused the muted token: contrast against white improves from 2.80:1 and 2.63:1 to 5.90:1. Return-status labels use darker semantic shades and retain explicit text. These are source-color calculations, not a full rendered contrast audit. |
| P1 | Founders Edition labels/specifications contradicted the user-supplied ASUS GPU photography. | With user confirmation, updated both existing records and the maintenance dataset to ASUS ROG Astral OC. Brand/edition filters derive options from the catalog. ASUS-specific boost clocks, clearance dimensions, slot size and recommended PSU now use the manufacturer's specifications. |

GPU references: [ASUS RTX 5080 OC specifications](https://rog.asus.com/us/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5080-o16g-gaming/spec/) and [ASUS RTX 5090 OC specifications](https://rog.asus.com/us/graphics-cards/graphics-cards/rog-astral/rog-astral-rtx5090-o32g-gaming/spec/). No ASUS board-power figure is invented; recommended PSU is labeled separately. Legacy Founders Edition configurations retain their own specification branch.

## HCI principle coverage

| Principle | Source/test evidence | Remaining verification |
|---|---|---|
| Visibility of system status | Shared loading/error states, form busy states, cart feedback and order-refresh feedback. | Live announcements and perceived wait times. |
| Match with the real world | PHP, electronics families, accurate approved GPU models, explicit simulated payments. | Real-user understanding of demo checkout. |
| User control and freedom | Cart removal, back links, dialog cancellation, eligible order cancellation and public missing-page recovery. | Keyboard focus restoration and navigation tasks. |
| Consistency and standards | Shared layouts, fields, currency helper, outline icons and context/services architecture. | Cross-device visual consistency. |
| Error prevention | Form validation, quantity cap, CSRF, server pricing, role checks, stock reservations, edit versions and checkout idempotency. | Live user error scenarios. |
| Recognition rather than recall | Labeled fields, product images/variants, order detail summaries and checkout progress. | Comprehension testing. |
| Flexibility and efficiency | Catalog search, URL filters, sorting, pagination, configuration links and CSV exports. | Keyboard-only completion and interaction timing. |
| Aesthetic/minimal design | Existing storefront/admin direction retained; no replacement theme or unnecessary panels. | Fresh 1440/768/390px production review. |
| Error recognition and recovery | Field errors, retry actions, human-readable service failures and missing-page recovery. | Offline/assistive-technology browser trials. |
| Help and documentation | Demo-card guidance, stock explanations, source-linked specifications and honest unavailable-feature messages. | Password recovery and Google sign-in remain unavailable; no new services were added. |

## Original conservative technical audit score

The original provisional **source-only** technical assessment was accessibility 2/4, performance 3/4, responsiveness 2/4, theming 2/4, implementation integrity 3/4 — **12/20**. This is historical assessment evidence, not an HCI course grade, WCAG certification or a new score for the follow-up. The targeted browser results below do not justify a complete rescore while production, assistive-technology and user-testing coverage remain incomplete. The implementation retains a coherent domain-specific system rather than replacing it with a generic design.

## Original verification and limitations

- Regression tests reproduced malformed-response and missing-route failures before fixes. Cart limit/reset/completion and GPU-model/filter/specification regressions are also covered.
- Final frontend ESLint and TypeScript/Vite production build passed. All 56 frontend tests passed, including the approved GPU-model regression. Backend ESLint and the TypeScript/production build passed as well.
- Backend lint/build and 26 tests passed, including both opt-in Neon rollback checks. Isolated business test records were rolled back; no sample accounts were created.
- Original ADMIN API verification passed login, safe role/account output, CSRF binding, refresh rotation/replay and logout. Only the verifier's own test sessions were removed. That audit covered USER boundaries automatically. Subsequent customer browser checkout is recorded below; it does not establish every customer authorization boundary.
- Runtime import graphs had no unreachable modules or unresolved local imports. Source encoding scan found no mojibake.
- Taste scans of the initial changed public/admin targets found no issues. Impeccable reported one existing 10px Suppliers filter-count advisory. This is not a production visual-gate pass. No design draw was needed for scoped recovery/feedback/contrast repairs using incumbent components.
- npm audit reports 12 moderate frontend and 15 moderate backend development-tool-chain findings, zero high/critical. No forced dependency changes were applied. The PostgreSQL connection-string SSL-mode deprecation warning remains; private environment settings were not edited.

## Files changed in this audit

- Routing/recovery: `src/app-routes.tsx`, `src/pages/not-found.tsx`.
- API recovery/types: `src/services/api.ts`, `src/services/auth.ts`, `src/services/workspace.ts`.
- Cart state/feedback: `src/data/storefront-cart.ts`, `src/components/context/storefront-provider.tsx`, `src/pages/cart.tsx`.
- Loading/contrast: `src/pages/customer-orders.tsx`, `src/pages/manage-store.tsx`, `src/pages/suppliers.tsx`.
- Approved GPU labels/specifications/filtering: `../backend/data/storefront-products.json`, `src/data/storefront-details.ts`, `src/data/storefront-filters.ts`, `src/components/features/landing/product-filters.tsx`, `PRODUCT.md`.
- Regression support: `scripts/hci-render-check.tsx`, `scripts/storefront-fixture.tsx`, `tests/hci-recovery.test.mjs`, `tests/products-listing.test.mjs`.

Existing `.gitignore`, GPU image, landing layout and other uncommitted changes were preserved. No README, instruction/skill file, schema or migration was changed. Local logs and the one-time version-checked GPU-update evidence are under `.taste-skill/hci-audit/`; the temporary maintenance script was removed after use.

## Live follow-up — November 2, 2026

### Result and implemented corrections

**Partial pass: the targeted checks below passed, and two confirmed issues were fixed. This is not a full HCI or WCAG pass.** The review kept the existing storefront and workspace directions, routes, authentication and data behavior. No additional orders, products, suppliers, stores or accounts were created during this follow-up. The earlier authorized checkout test order remains saved.

| Severity | Reproduced issue | Correction and confirmation |
|---|---|---|
| P2 | At the collapsed storefront navigation, opening the menu then pressing Tab skipped its links. Escape left the menu open. | `store-header.tsx` now focuses the first navigation link on opening, closes when focus leaves the header, and handles Escape with focus restoration to the toggle. Browser confirmation observed Home focused after opening and the collapsed toggle focused after Escape. |
| P1 | Authentication placeholders used `#8b919e` (3.16:1 against white), secondary copy used `#737b8b` (4.26:1), and input boundaries used `#d3d7de` (1.44:1). | Shared authentication fields, helper/description copy and account-switch copy now reuse the existing `muted` token, `#596579` (5.90:1). Browser-computed placeholder, border and description colors matched that token at all three widths. The production sign-in inspector reported no sampled text-contrast failures. |

Contrast ratios use the WCAG relative-luminance calculation on the specified solid colors. They do not prove every rendered state meets contrast requirements. References: [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), and [WAI disclosure navigation keyboard guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).

### Verified coverage

| Check | Evidence and scope | Result |
|---|---|---|
| Customer checkout | Earlier live test: signed in with the supplied customer account; cart/address/shipping survived sign-in; empty and expired/invalid demo payment values were rejected; order `68517d43-31e7-4298-a7dc-36a37860651f` saved for PHP 45,990.00; cart cleared; order persisted after reload. No real charge. | Pass for the tested journey |
| Storefront keyboard recovery | Skip link reached the main region. Corrected menu opening/Escape focus behavior was observed. Catalog filter dialog accepted keyboard activation, kept the tested backward-tab focus inside the dialog, and Escape returned focus to Filters. | Targeted pass |
| Authentication and store-form errors | Empty sign-in submission focused Email with associated errors. Empty Add Store submission focused the first invalid field; Escape closed the dialog and restored Add Store focus. No store was saved. | Targeted pass |
| Workspace menu | Keyboard activation opened the native dialog. Escape closed it and restored Open menu focus. | Targeted pass |
| Responsive working screens | Loaded Dashboard, Products, Reports, Suppliers, Customer orders and Manage Store were captured at 1440, 768 and 390px. All 18 measurements showed no page-level horizontal overflow. Screenshots were opened and reviewed. Narrow charts/tables retain their own scroll areas; this does not prove every populated/long-content state. | Pass for recorded states |
| Authentication rendering | Sign-in reviewed at 1440/768/390px in the development app and production build. Production inspector: zero FAIL findings, no horizontal overflow, no sampled low-contrast text; one existing 29px mobile-title advisory retained for the incumbent authentication hierarchy. | Targeted pass |
| Reduced motion | Temporary browser media emulation made the storefront hero image animation `none`; the heading remained visible and the page did not overflow at 390px. Emulation was reset afterward. | Targeted pass |
| Frontend regression checks | Fresh `npm --prefix frontend run lint`, `npm --prefix frontend run build`, and `npm --prefix frontend test` all passed; 56 tests, zero failures. | Pass |
| Full production rendering | `vite preview` on `localhost:4173` showed Products are unavailable. The inspector captured that error state at all three widths; its exit code 0 is **not** a storefront pass. Backend/origin settings were not changed or bypassed. | Blocked |
| Screen reader, comprehensive keyboard journey, performance and real users | Accessibility-tree names and selected keyboard actions were inspected; no spoken screen-reader session, complete keyboard-only checkout, runtime performance profile or participant usability study was performed. | Not verified |

### Design review, evidence and remaining limits

Implementation integrity remains coherent: the same shared header/authentication controls, Geist, existing muted token, reference composition and honest empty states are retained. Scope was component-level repair, so the documented existing-direction exception was used instead of a new Taste draw. Working screens used Operate/app criteria; no marketing imagery or motion quotas were applied to them. Original dashboard icon colors and empty/manual-entry data were preserved.

The Impeccable context launcher did not run because the attempted path omitted `skills/impeccable/`; the failure was announced and the documented direct-context fallback used `frontend/PRODUCT.md`, `frontend/DESIGN.md` and current code. No hook or skill installation was changed. One manual detector pass on the five changed UI files returned ten existing type-ramp advisories and no blocking findings. Those incumbent auth sizes were retained rather than changing the reference hierarchy. Taste source lint exited 0 with three existing small-shadow warnings on auth controls, retained as reference styling. These tool results are not accessibility certification.

App screenshot critique: each recorded workspace keeps its page question and action visible, aligns content within the shared canvas, and reflows navigation/records on phones. Dashboard and Reports agree on two active demo orders and PHP 91,980.00; unknown stock remains Not set, and suppliers/stores remain empty. The chart scroll regions still require deliberate horizontal inspection on narrow screens. Empty Store/Suppliers sheets remain spacious, and the existing 10px Suppliers filter-count advisory is unresolved. These observations do not establish a full production visual-gate pass.

Evidence is under `.taste-skill/hci-live/` at the project root: `admin-checks.json`, `admin-<surface>-<width>.jpg`, `auth-after.json`, `after-login-<width>.jpg`, `before-menu-keyboard.jpg`, `after-menu-keyboard.jpg`, `production-before/report.json` and `production-auth-after/report.json`. Early loading-only captures and unscrolled lazy-image gaps must not be treated as completed-screen or broken-image evidence. `browser-before.json` is marked invalid because its first diagnostic batch sampled loading states.

Follow-up source changes are limited to `src/components/features/landing/store-header.tsx`, `src/components/features/auth/auth-controls.tsx`, `auth-layout.tsx`, `login-form.tsx`, `signup-form.tsx`, and this report. Backend checks/dependency-audit totals above are original audit evidence and were not rerun in this frontend follow-up.
