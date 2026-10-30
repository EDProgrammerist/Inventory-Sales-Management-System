import { useState } from 'react'
import WorkspaceLayout, { type WorkspaceAction } from '@/components/common/workspace-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import ReportOverview from '@/components/features/reports/report-overview'
import ProfitRevenueChart from '@/components/features/reports/profit-revenue-chart'
import {
  ReportCategoryTable,
  ReportProductsTable,
  ReportEmpty,
} from '@/components/features/reports/report-tables'
import { useInventory } from '@/components/context/inventory-context'
import InventoryPanelContent from '@/components/features/inventory/inventory-panels'
import { inventoryPanelTitles } from '@/components/features/inventory/inventory-presentation'
import {
  reportCategories,
  reportProducts,
  filterReportCategories,
  filterReportProducts,
  reportCategoriesCsv,
  reportProductsCsv,
  reportMoney,
  type ReportPeriod,
  type ReportProduct,
} from '@/data/reports-demo'
import { downloadCsv } from '@/lib/download'

type ReportPanel = WorkspaceAction | 'all-categories' | 'all-products' | 'report-product'

export default function ReportsPage() {
  const { products: inventory, addProduct } = useInventory()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [compact, setCompact] = useState(false)
  const [panel, setPanel] = useState<ReportPanel | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ReportProduct | null>(null)
  const categories = filterReportCategories(query)
  const products = filterReportProducts(query, category)
  const categoryName = reportCategories.find((row) => row.id === category)?.name

  function selectCategory(id: string) {
    setCategory((current) => (current === id ? 'all' : id))
    if (panel === 'all-categories') setPanel(null)
  }
  function selectProduct(product: ReportProduct) {
    setSelectedProduct(product)
    setPanel('report-product')
  }
  function clearFilters() {
    setQuery('')
    setCategory('all')
  }
  function dialogTitle(value: ReportPanel): string {
    if (value === 'all-categories') return 'All best-selling categories'
    if (value === 'all-products') return 'All best-selling products'
    if (value === 'report-product') return selectedProduct?.name ?? 'Product report'
    return inventoryPanelTitles[value]
  }

  return (
    <WorkspaceLayout
      title="Reports"
      query={query}
      onQueryChange={setQuery}
      onAction={setPanel}
      notificationCount={inventory.filter((row) => row.availability !== 'in-stock').length}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.07fr)_minmax(0,1fr)]">
        <ReportOverview />
        <section
          className="min-w-0 overflow-hidden rounded-[10px] bg-white"
          aria-labelledby="report-category-heading"
        >
          <header className="flex items-center justify-between gap-3 px-5 py-5">
            <h2 id="report-category-heading" className="dashboard-heading">
              Best selling category
            </h2>
            <button onClick={() => setPanel('all-categories')} className="dashboard-link">
              See All<span className="sr-only"> categories</span>
            </button>
          </header>
          {categories.length ? (
            <ReportCategoryTable rows={categories} selected={category} onSelect={selectCategory} />
          ) : (
            <ReportEmpty description="Try a different product ID, product name, or category." />
          )}
        </section>
        <div className="min-w-0 xl:col-span-2">
          <ProfitRevenueChart period={period} onPeriodChange={setPeriod} />
        </div>
        <section
          className="min-w-0 overflow-hidden rounded-[10px] bg-white xl:col-span-2"
          aria-labelledby="report-product-heading"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
            <h2 id="report-product-heading" className="dashboard-heading">
              Best selling product
            </h2>
            <button onClick={() => setPanel('all-products')} className="dashboard-link">
              See All<span className="sr-only"> products</span>
            </button>
          </header>
          {(query.trim() || category !== 'all') && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 text-xs text-slate-500">
              <p role="status">
                {products.length} matching {products.length === 1 ? 'product' : 'products'}
                {categoryName ? ` · ${categoryName}` : ''}
              </p>
              <button onClick={clearFilters} className="dashboard-link">
                Clear filters
              </button>
            </div>
          )}
          {products.length ? (
            <ReportProductsTable rows={products} compact={compact} onSelect={selectProduct} />
          ) : (
            <ReportEmpty description="No sample products match these filters. Clear the category selection or try another search." />
          )}
        </section>
      </div>

      {panel && (
        <DashboardDialog key={panel} title={dialogTitle(panel)} onClose={() => setPanel(null)}>
          {panel === 'all-categories' && (
            <>
              <p className="mb-5 text-sm leading-6 text-slate-500">
                All three categories in the sample report. Select one to filter the products table.
              </p>
              <ReportCategoryTable
                rows={reportCategories}
                selected={category}
                onSelect={selectCategory}
              />
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() =>
                    downloadCsv(
                      reportCategoriesCsv(reportCategories),
                      'shenban-sample-categories.csv',
                    )
                  }
                  className="inventory-button"
                >
                  Download category CSV
                </button>
              </div>
            </>
          )}
          {panel === 'all-products' && (
            <>
              <p className="mb-5 text-sm leading-6 text-slate-500">
                All four products included in the report reference.
              </p>
              <ReportProductsTable
                rows={reportProducts}
                compact={compact}
                onSelect={selectProduct}
              />
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() =>
                    downloadCsv(reportProductsCsv(reportProducts), 'shenban-sample-best-sellers.csv')
                  }
                  className="inventory-button"
                >
                  Download products CSV
                </button>
              </div>
            </>
          )}
          {panel === 'report-product' && selectedProduct && (
            <>
              <p className="mb-5 text-xs leading-5 text-slate-500">
                Report snapshot · separate from the current sample inventory.
              </p>
              <dl className="grid gap-4 text-sm">
                {[
                  ['Product ID', selectedProduct.productId],
                  ['Category', selectedProduct.category],
                  ['Remaining Quantity', `${selectedProduct.remaining} ${selectedProduct.unit}`],
                  ['Turn Over', reportMoney(selectedProduct.turnover)],
                  ['Increase By', `${selectedProduct.increase}%`],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-2 gap-4">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-600">{value}</dd>
                  </div>
                ))}
              </dl>
              <button
                className="inventory-button mt-6"
                onClick={() =>
                  downloadCsv(
                    reportProductsCsv([selectedProduct]),
                    `shenban-sample-${selectedProduct.id}-report.csv`,
                  )
                }
              >
                Download product report
              </button>
            </>
          )}
          {panel !== 'all-categories' && panel !== 'all-products' && panel !== 'report-product' && (
            <InventoryPanelContent
              panel={panel}
              products={inventory}
              availability="all"
              compact={compact}
              onCompactChange={setCompact}
              onAdd={(product) => {
                addProduct(product)
                setPanel(null)
              }}
              onClose={() => setPanel(null)}
              onFilter={() => setPanel(null)}
              onDownload={() =>
                downloadCsv(reportProductsCsv(products), 'shenban-sample-report-products.csv')
              }
            />
          )}
        </DashboardDialog>
      )}
    </WorkspaceLayout>
  )
}
