# Reports preview

Open `/reports` or select Reports in the shared sidebar. Reports is a real route with an active navigation state, replacing the previous sidebar shortcut dialog.

## Files and placement

- Created `src/pages/reports.tsx`: composes the overview, category table, chart, product table, filters, and detail dialogs.
- Created `src/components/features/reports/`: report overview, reusable report tables/empty states, and the interactive profit/revenue chart.
- Created `src/data/reports-demo.ts`: reference summary/category/product fixtures, approximate chart samples, filtering, period grouping, and report exports.
- Created `src/lib/chart-path.ts`: smooth SVG line geometry with bounded controls.
- Created `src/data/csv.ts`: shared CSV serialization and string-formula protection, reused by Inventory, Dashboard, and Reports. Negative numeric values remain numbers when opened in a spreadsheet.
- Modified `src/main.tsx` and `dashboard-sidebar.tsx`: register and link `/reports`.

## Data and controls

All figures are sample data, independent of Neon and the editable inventory list. The three categories and four product records come from `Reports-ref-design.png`. Repeated reference product IDs are retained as report values, while separate internal row IDs prevent collisions. The product name Surf Excel uses the spelling already present elsewhere in the application.

Search matches product names, product IDs, and category labels. Selecting a category filters the products table; selecting it again clears that category. Search and category selection work together. See All dialogs expose the complete sample lists and CSV exports. Product names open a report snapshot dialog rather than joining unrelated historical IDs to current inventory records.

The chart uses approximate values read from the supplied curve. Its tooltip, legend controls, accessible period labels, and CSV export use the same dataset. The reference's tooltip value exceeds its axis range, so that number is replaced by the selected plotted value. Monthly grouping matches the displayed month labels; quarterly grouping totals September separately, October–December, and January–March. The reference's Weekly label is not presented as a weekly dataset.

The page uses the existing workspace shell, profile/stock notifications, and native dialog behavior. Tables and the chart scroll within their panels on small screens; page sections stack in one column.

## Verification

```powershell
cd frontend
npm run build
npm run lint
npm test
```

The test suite covers filtering, repeated IDs, category aliases, period totals, CSV serialization, chart path endpoints, and server rendering of the Reports route and both chart groupings. Server rendering also checks the active sidebar link and default tooltip value.

Live screenshots and browser interaction verification remain pending: the Windows computer-use pipe and browser access host were unavailable during this task. Server rendering does not verify visual layout or native browser behavior.

Reference documentation: [SVG paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path) and [React Router NavLink](https://reactrouter.com/api/components/NavLink).
