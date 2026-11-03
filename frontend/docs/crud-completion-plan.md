# Local final-project completion

Scope authorized November 3, 2026: finish the remaining dashboard HCI and CRUD gaps; do not deploy.

Keep the existing React/Express MVC structure, authentication, palette, icons and PHP amounts. Reuse supplier forms and the native dashboard dialog. This is a scoped interaction change, so Taste's component exception applies; no style draw or redesign.

1. Add failing rollback tests for owned workspace deletion, supplier update, version-checked catalog deletion, referenced-product protection, and cancelled-order logical deletion/retry protection.
2. Implement repository/service/controller/routes and an additive nullable order deletion timestamp. Preserve order snapshots and retry identity. Only cancelled orders can be deleted; active and delivered history is protected. Physical catalog deletion is allowed only for products never referenced by saved orders. Suppliers/stores use owned physical deletion.
3. Connect services/providers to supplier editing and shared confirmation UI. Cancel defaults safely; pending/error feedback retains the dialog; success updates lists. Refresh keeps existing data visible and exposes pending/success/error feedback on all commerce refresh buttons.
4. Run frontend lint/build/tests, backend typecheck/tests including rollback DB tests; inspect changed interactions and responsive layouts locally. Production preview is optional for the student's local acceptance criteria, and its prior account-service blocker remains historical evidence. Screen-reader and participant testing remain explicitly unverified unless performed.
5. Update both audit reports with current results and exact limitations. Do not deploy, seed, reset, change secrets, or remove existing business records during verification.

Deletion policy is an implementation choice: unrestricted order removal would break retry identity and historical/stock guarantees; cancellation alone does not implement Delete. A separate logical Delete provides list removal while retaining the internal tombstone. Tests must demonstrate this distinction.

References: [PostgreSQL row locks](https://www.postgresql.org/docs/current/explicit-locking.html), [W3C status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages).
