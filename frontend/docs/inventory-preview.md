# Inventory preview

Open `/inventory`. Dashboard and Inventory share `src/components/common/workspace-layout.tsx`, including the header, search, desktop sidebar, and mobile navigation. Sidebar links use the current route to mark the active page.

## Implementation

- Created `src/pages/inventory.tsx`: page state, search/filter composition, pagination, local additions, and CSV export.
- Created `src/components/features/inventory/`: overview metrics, product form, and supporting dialogs.
- Created `src/data/inventory-demo.ts`: reference fixtures, validation, pagination, filtering, and CSV serialization.
- Created `src/lib/download.ts`: shared CSV download used by Inventory and Dashboard.
- Modified `src/pages/dashboard.tsx`: composes the shared layout while preserving its charts and controls.
- Modified `src/main.tsx`: registers `/inventory` and `/inventory/:productId` within a shared in-memory inventory provider.

The reference's nine product rows, historical expiry dates, explicit availability labels, and overview figures are sample data. Overview totals reproduce the reference and are not calculated from the nine editable example rows. Availability labels on reference rows are preserved even where their quantities might suggest another status. Newly added products use zero/threshold rules for their status.

Name/product-ID search and availability filtering work together. Pagination uses nine rows per page and the actual number of local products; the initial list has one page. Adding a tenth product opens page two. Additions and edits persist across client-side page navigation until the app is reloaded and do not write to Neon. Download all exports the entire local list, including additions, independently of search/filters. CSV cells are quoted and formula-like product names are neutralized.

## New Product and Product Info

Open Add Product on `/inventory` for the New Product modal matching `Inventory Add-ref-design.jpg`. It includes an optional image, Product Name, Product ID, Category, Buying Price, Quantity, Unit, Expiry Date, and Threshold Value. Category options are local examples. Images are read in the browser using FileReader, checked for PNG/JPEG/WebP type and a 5 MB size limit, and kept only in memory. No image or product data is uploaded.

Click a product name to open `/inventory/:productId`. The Maggi example is `/inventory/maggi`. The overview matches `Product Info-ref-design.jpg`, including its product image, ID, category, supplier information, stock summary, and branch quantities. The two provided references differ: the inventory list shows Maggi quantity 43 and expiry 11/12/22; the detail reference shows remaining stock 34 and expiry 13/4/23. These initial snapshots are preserved separately. Saving an edit synchronizes the list and overview values. When quantity changes, old branch allocations are cleared rather than displaying an incorrect allocation total.

Edit reuses the product form and validates against other products. Download exports the current product. Overview, Purchases, Adjustments, and History tabs support arrow keys, Home, End, and keyboard focus. Purchases and Adjustments contain empty states because no transactions are supplied; History shows only changes made during the current session. Unknown product IDs show a not-found state with a route back to inventory.

Implementation files include `product-image-upload.tsx`, `product-overview.tsx`, `product-tabs.tsx`, `inventory-provider.tsx`, `inventory-context.ts`, `src/data/inventory-state.ts`, and `src/pages/product-info.tsx`.

Verification includes state/validation tests and a server-rendered route/form check. A live screenshot and interaction review of these two new views remains pending because both the Windows computer-use pipe and browser access host were unavailable during this implementation.

Run from `frontend/`:

```powershell
npm run build
npm run lint
npm test
```
