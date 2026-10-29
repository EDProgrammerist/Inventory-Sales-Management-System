# Orders and Manage Store previews

Routes: `/orders` and `/manage-store`, linked from the shared sidebar.

## Orders

The summary and nine table records preserve the supplied reference, including historical dates and status colors. The summary is a separate historical snapshot and does not aggregate the sample table or local additions. The source toolbar's Add Product label is corrected to Add Order.

Search matches products, order IDs, product IDs, categories, and statuses; it composes with the status filter. Pagination uses nine actual records per page. New Order follows `New Orders-ref-design.jpg`: Product Name, Product ID, Category, Order Value, Quantity, Unit, Buying Price, Date of Delivery, and a checked delivery-notification checkbox. Labels appear alongside fields on desktop and above them on small screens. The shared narrow dialog scrolls within the viewport.

Product ID and generated Order ID are separate. New records start Confirmed, retain the selected category and custom unit, and validate positive amounts, whole quantities, and real dates. Order Value and Buying Price remain separate user-entered USD amounts. Delivery notification is a saved sample preference only; no notification is scheduled. The submit label is corrected to Add Order. Order History lists records created during the current visit, displays their entered metadata, and offers a complete CSV export. No prior event timeline is fabricated.

## Manage Store

The three branch cards preserve reference labels and contact text, including Slur Branch. Search matches branches, store names, addresses, city/postal text, and phone numbers. Add Store and Edit use the shared validated form; edits retain their original internal ID. Branch names must be unique without regard to case or surrounding whitespace.

## Files and data lifetime

- Pages: `src/pages/orders.tsx` and `src/pages/manage-store.tsx`.
- Data and validation: `src/data/orders-demo.ts` and `src/data/stores-demo.ts`.
- Order summary: `src/components/features/orders/order-overview.tsx`.
- Reference New Order form: `src/components/features/orders/order-form.tsx`.
- Reused form and workspace tools: `src/components/common/record-form.tsx` and `workspace-utility-dialog.tsx`.
- Navigation and route registration: shared dashboard sidebar and `src/main.tsx`.

Both pages use local sample state. Leaving or reloading the page resets changes. No backend or Neon writes are made, and inventory quantities are not changed by adding an order.

Verification covers build, ESLint, pure data rules, and server-rendered route content/navigation. Browser access was unavailable, so screenshot fidelity and interactive browser behavior remain unverified.
