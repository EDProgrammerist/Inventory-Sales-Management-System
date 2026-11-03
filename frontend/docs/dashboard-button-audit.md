# Dashboard button HCI audit — November 3, 2026

**Current verdict: the three requested fixes pass their targeted local checks.** Settings labeling, order-confirmation keyboard focus and shared 44px button sizing are resolved. The optional P3 Review order naming improvement remains outside this three-fix scope. This is not full accessibility or participant-testing certification. Nothing was deployed.

Scope: Dashboard and the shared administration controls on Inventory, Reports, Suppliers, Customer Orders and Manage Store. Buttons, navigation styled as buttons, native chart disclosures and their dialogs were examined. Production inspection is outside the user's local final-project acceptance scope.

## Fix verification — November 3, 2026

The user authorized fixing the three P2 findings after the initial check-only audit. The original evidence below is retained as the before record.

| Requested fix | Implementation | Fresh result |
|---|---|---|
| Accurate menu label | The commerce layout supplies Store information on Dashboard, Inventory, Reports and Orders; View preferences on Suppliers and Manage Store. The label is passed through the shared workspace layout, sidebar and mobile menu. The dialog title matches. Internal actions/routes and icons remain unchanged. | New rendered-output regression test covers both desktop/mobile controls on all six routes. It failed before the change and passed afterward. Live desktop Store information and desktop/mobile View preferences opened the expected dialogs. Compact rows remained usable and was returned to its starting value after testing. |
| Keyboard flow | Order details requests focus only when the user enters/leaves cancellation confirmation. Keep order receives focus when confirmation opens; Cancel demo order receives focus when Keep order is activated. Opening the main order dialog retains its existing initial focus behavior. | Desktop: Cancel → Keep order; Tab → Confirm cancellation; Keep → Cancel demo order. Phone at verified 390px: Keep order receives visible focus and Keep restores Cancel demo order. No order was cancelled or advanced. |
| 44px shared buttons | `.inventory-button` now uses min-h-11 and min-w-11 through the existing shared stylesheet. | All measured shared buttons on six routes at 1440/768/390px were at least 44px high and wide. Confirmation buttons on the phone also measured 44px high. All 18 page-level overflow measurements were zero. |

Validation: `npm --prefix frontend run lint`, `npm --prefix frontend run build` and `npm --prefix frontend test` passed. The full frontend suite now has **57 passed, 0 failed**. No backend change was needed. `git diff --check` passed.

Changed application files: `src/components/common/commerce-layout.tsx`, `workspace-layout.tsx` and `mobile-menu.tsx` in that common folder; `src/components/features/dashboard/dashboard-sidebar.tsx`; `src/components/features/orders/customer-order-details.tsx`; `src/styles/global.css`. Added `tests/dashboard-buttons.test.mjs`. This report and its `hci-audit.md` index were updated. Existing business data, authentication, API contracts, dashboard icons and unrelated working-tree changes were preserved.

Evidence is under `.taste-skill/dashboard-button-fixes-2026-11-03/`: `measurements.json`, `focus-checks.json`, `source-lint.json`, `detector.json`, `store-information-desktop.jpg`, `keep-order-focus-desktop.jpg`, `store-phone-full.png` and `dashboard-1440-confirmed.png`. The DOM measurements record both requested and actual viewport widths, which matched in all 18 final samples. The browser-wide viewport setter initially affected another open tab; tab-scoped emulation was used and verified before the final measurements. Both overrides were reset afterward.

Screenshots were opened and reviewed. Some JPEG captures were scaled/clipped by the browser capture surface and are not full-layout pass evidence; a subsequent explicit full-viewport capture produced complete phone evidence. The confirmation capture batch then encountered a screenshot timeout, so a complete three-width screenshot pass is **not** claimed. Valid desktop screenshots show the accurate label and focused Keep order control; the complete phone screenshot shows the 44px Add Store button. The keyboard/DOM evidence directly verifies all three requested fixes without relying on distorted captures. No extra visual-polish loop was performed.

Taste app lint on six changed UI targets reported zero FAIL and one existing shadow advisory on the focused skip-link overlay. Impeccable's one detector run reported eight existing type/color/radius advisories; no affected token values were changed except the button minimum dimensions. The incumbent Operate/component direction was retained using the documented scoped-component draw exception. Prior context fallback remains recorded in `hci-audit.md`; skills/hooks were not changed. The user excluded production inspection/deployment from local final-project acceptance, so no production visual pass is claimed.

Broader screen-reader speech, exhaustive hover/error/high-contrast variants, full keyboard-only tasks and participant testing remain unverified. This follow-up closes the three requested defects; the original audit's broader limitations still apply.

## Original findings (before fixes)

### P2 — Settings does not offer settings on four routes — resolved

On Dashboard, pressing Enter on Settings opened **Store administration**, containing only a database-information sentence and Open storefront. Inventory, Reports and Customer Orders pass no compact-preference callback, so the same shared implementation has no settings control there either. Suppliers and Manage Store do offer Use compact rows.

- Location: `src/components/features/dashboard/dashboard-sidebar.tsx:97`; `src/components/common/commerce-layout.tsx:37` and `:46`.
- HCI impact: the action's label promises a task that the resulting dialog cannot perform. This affects match with users' expectations and consistency. It is not a dead click: the information dialog does open.
- Suggested fix: name the existing information-only action **Store information**, and label the existing compact option appropriately on routes that expose it. Adding an actual settings feature would be a separate scope decision.
- Refinement playbook: `$impeccable clarify`.

### P2 — Inline order-cancellation controls lose keyboard focus — resolved

Keyboard activation of Cancel demo order replaces that button with Keep order and Confirm cancellation. Live DOM inspection then reported the focused element as **BODY**. Pressing Tab reached Keep order, so the keyboard could recover. Activating Keep order also returned focus to BODY rather than the restored Cancel demo order button.

- Location: `src/components/features/orders/customer-order-details.tsx:14`.
- HCI impact: the new confirmation state has no focused control. Users must find their place after an action meant to prevent errors. The main order dialog still contains focus, and the task was recoverable; this is not reported as a keyboard trap or an independently established WCAG violation.
- Suggested fix: move focus to Keep order when the inline confirmation appears; return focus to Cancel demo order when Keep order is activated. Keep explicit confirmation before the mutation.
- Refinement playbook: `$impeccable harden`.

### P2 — Shared buttons are shorter than the comfortable touch target — resolved

Refresh data/products/orders, Manage products, Add product/Supplier/Store, Filters, Download all and Export demo sales measured **40 CSS px high**. The shared `.inventory-button` specifies `min-h-10`. The same class is reused by form and confirmation controls. Icon controls measured 44px; several short text links were approximately 43px wide and 44px high.

- Location: `src/styles/global.css:33`.
- HCI impact: 40px buttons remain usable, but offer less tolerance for touch input than a 44px target. Increasing the shared minimum to 44px would address the repeated pattern without introducing a new component family.
- **Standards distinction:** none of the measured enabled controls was below 24×24px. WCAG 2.2 AA's minimum is 24px with exceptions; 44px is a stricter comfort/enhanced target. These measurements alone do **not** establish an AA target-size failure. The clipped, normally offscreen Skip to content link is not treated as a failed touch button.
- Refinement playbook: `$impeccable adapt`, then `$impeccable polish` after agreed fixes.

### P3 — Repeated Review order labels need their surrounding rows

Both orders expose a button whose accessible name is simply Review order. The table row contains an order code and customer details, so context exists. A list of buttons alone does not distinguish them. Product Edit/Delete controls already include the product and variant in their accessible names.

- Location: `src/pages/admin-orders.tsx:24`.
- Suggested improvement: retain the visible label and include the short order code in its accessible name, for example Review order 68517d43. This is an efficiency/recognition improvement, not a reported unnamed-control failure.

## Checks that passed

| Button group | Fresh browser evidence |
|---|---|
| Refresh data | Space activated it; button became disabled with Refreshing text, aria-busy and a status message; completion announced Store data is up to date. A visible focus outline was measured before activation. |
| Settings, stock alerts and profile | Keyboard activation opened the relevant dialog. Escape closed it. Settings' content mismatch remains the finding above. |
| Mobile menu | Enter opened the workspace menu; Settings opened its dialog; Escape returned focus to Open menu. |
| Chart disclosures | Enter expanded monthly values/units; Space collapsed them. Native details/summary open state matched the visible state. |
| Clear search | Enter cleared the entered no-match query and recovered the lists. |
| Product Add/Edit | Both opened the expected forms; Cancel closed them without saving. Save product was present and enabled in the existing-product form. |
| Product Delete confirmation | Explained consequences and protected-order restriction; Keep record received initial focus. Keep record closed it and restored the specific invoking Delete button. Permanent deletion was not submitted. |
| Supplier Add | Empty submission marked six invalid fields and focused supplier-name. Discard closed the form without creating a record. |
| Supplier Filters | Apply filters produced a matching-row status with the selected return type. Reset restored the draft to all; applying closed the dialog. |
| Supplier Download all | Keyboard activation emitted a CSV download and Downloaded all 0 supplier rows status. |
| Supplier pagination | Previous and Next were disabled on the sole empty page, matching the state. Populated/multiple-page navigation was not available to exercise. |
| Store Add/Discard | Add Store opened the form; Discard returned focus to Add Store. No record was saved. |
| Order Review/Keep | Review opened the selected order. Keep order retained it; the inline focus issue is recorded above. Neither cancellation nor fulfillment was submitted. |
| Reports Export demo sales | Space emitted the expected CSV download. Its copied artifact contains the category totals; no invented sales were introduced. |
| Log Out | Enter showed disabled Logging out feedback and returned to the public storefront. The supplied admin was signed back in afterward for continued local review. |

## Measurements and HCI coverage

Six routes were measured at **1440, 768 and 390px**, producing 18 loaded-state scans and 294 repeated control observations (not 294 unique buttons). All measured controls had nonempty DOM-derived names. No measured enabled control was below 24px in either dimension; all 18 page-level horizontal-overflow measurements were zero. Internal table/chart scrolling is separate from page overflow and does not by itself fail the check.

Computed default-state text colors and opaque ancestor backgrounds were used for 288 enabled-control contrast calculations. None was below its applicable text threshold; the minimum sampled ratio was **4.764:1**. Disabled controls were excluded, as inactive UI text is exempt from that text-contrast criterion. These are default-state calculations, not exhaustive hover, focus, high-contrast, opacity, border/icon or screenshot-pixel contrast certification.

| HCI principle | Button assessment |
|---|---|
| Visibility of system status | Supported by refresh, saving/validation and logout feedback; tested download has browser feedback. |
| Match with the real world | Mostly clear action names; Settings content mismatch needs correction. |
| User control and freedom | Dialog Close/Escape/Discard/Keep controls worked; order inline focus needs refinement. |
| Consistency and standards | Shared button styles and native buttons/links/disclosures; 40px sizing is a repeated comfort gap. |
| Error prevention | Invalid supplier submission stopped; destructive actions disclose consequences and require confirmation. Final mutations were intentionally not exercised in this read-only audit. |
| Recognition rather than recall | No unnamed measured controls; Review order can be more specific when read outside its row. |
| Flexibility and efficiency | Enter/Space supported the sampled controls; full keyboard-only completion of every route is unverified. |
| Aesthetic/minimalist design | Shared palette and styling remained coherent; enabled default text contrast calculations passed. |
| Error recognition and recovery | Inline validation points to the field; Cancel/Keep provide recovery. Offline refresh recovery was verified in the earlier CRUD follow-up, not rerun here. |
| Help and documentation | Deletion and order-cancellation consequences are explained near the decision. Settings' information should have an accurate action name. |

This narrow button audit does not produce an overall application score out of 20. Performance profiling, theming variants, full screen-reader output and participant comprehension were not evaluated; assigning full dimension scores would overstate coverage. Source integrity is coherent: existing shared controls, providers, dialogs, route guards and real persisted data remain in use. No redesign, style draw, UI detector rerun or skill modification was needed for this check-only review; prior session setup and scanner results remain in the linked audit records.

## Evidence and limits

Artifacts: `.taste-skill/dashboard-buttons-2026-11-03/button-scans.json`, `contrast.json`, `interaction-results.json`, `settings-evidence.jpg`, `dashboard-settings.jpg`, `delete-confirmation-phone.jpg`, and `export-demo-sales.csv`. Report-only changes do not require an application rebuild; no new lint/build/test result is claimed for this audit.

Untested here: final Save/Delete/fulfillment/cancellation mutations; Supplier/Store Edit/Delete rows because those lists were empty; image-file selection/upload; every hover/pressed/error state; full keyboard-only tasks; screen-reader speech; high-contrast mode; participant testing; production/deployment. Empty starting lists were preserved rather than seeded to make controls appear. Prior CRUD integration checks are separate evidence in `dashboard-mvc-crud-audit.md`.

During the initial check-only audit, only this report and its link in `hci-audit.md` were edited. The authorized implementation follow-up is documented at the top. Local development servers were used for testing; no deployment was performed.

Standards/references: [WAI button pattern and focus behavior](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [WCAG 2.2 minimum target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [WCAG text contrast and inactive-control exception](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). The findings and severity are project-specific review judgments, not a WCAG certification.
