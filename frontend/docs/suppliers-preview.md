# Suppliers reference implementation

Open `/suppliers`. The Suppliers sidebar link opens the list; **Add Supplier** opens the **New Supplier** dialog.

## Reference and behavior

- Preserves the 14 reference rows, including repeated contacts with unique internal IDs. The blank return type is displayed as **Not specified**.
- Corrects the reference toolbar label from Add Product to Add Supplier.
- Searches supplier names, products, email, contact numbers, and recorded categories. Return-type and incoming-product filters compose with search.
- Uses real pagination with 14 rows per page. Download all exports all supplier rows as CSV, including new additions.
- Clicking a supplier name opens its recorded details and a single-row CSV export.
- The form includes the reference fields and an Email field to populate the list column. It validates required values, prices, contact numbers, email, and duplicate email/product pairs.
- Optional photos accept PNG, JPEG, or WebP files up to 5 MB, with browse, drag/drop, preview, and removal controls.

## Files

- `src/pages/suppliers.tsx`: list, local state, pagination, dialogs, and export actions.
- `src/components/features/suppliers/supplier-form.tsx`: New Supplier form.
- `src/components/features/suppliers/supplier-panels.tsx`: filters and supplier details.
- `src/data/suppliers-demo.ts`: reference fixtures, validation, search, and CSV conversion.
- `src/components/common/image-upload.tsx`: shared product/supplier image picker.
- `src/data/pagination.ts`, `field-validation.ts`, and `image-validation.ts`: shared rules reused by inventory and suppliers.
- `src/main.tsx` and the shared sidebar: route and navigation integration.

## Data and verification limits

This page uses sample data. Added suppliers and photos remain in memory while the Suppliers page is open; leaving or reloading resets them. No supplier data is written to Neon.

Automated checks cover the production build, ESLint, fixture integrity, filtering, validation, pagination, CSV escaping, and server-rendered routes/forms. Browser access was unavailable in this environment, so these checks do not establish screenshot fidelity or verify interactive browser behavior.
