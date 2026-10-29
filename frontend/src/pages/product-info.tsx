import { useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PencilSimpleIcon, PackageIcon, ArrowLeftIcon } from '@phosphor-icons/react'
import WorkspaceLayout from '@/components/common/workspace-layout'
import DashboardDialog from '@/components/features/dashboard/dashboard-dialog'
import { useInventory } from '@/components/features/inventory/inventory-context'
import ProductOverview from '@/components/features/inventory/product-overview'
import ProductTabs, { type ProductTab } from '@/components/features/inventory/product-tabs'
import ProductForm from '@/components/features/inventory/product-form'
import InventoryPanelContent from '@/components/features/inventory/inventory-panels'
import {
  inventoryPanelTitles,
  type InventoryPanel,
} from '@/components/features/inventory/inventory-presentation'
import { inventoryCsv, selectProducts, type InventoryProduct } from '@/data/inventory-demo'
import { productForOverview } from '@/data/inventory-state'
import { downloadCsv } from '@/lib/download'

function EmptyRecords({ title, children }: { title: string; children: string }) {
  return (
    <div className="grid min-h-80 place-content-center justify-items-center gap-3 px-6 text-center">
      <PackageIcon size={34} className="text-slate-300" />
      <h3 className="font-medium text-slate-600">{title}</h3>
      <p className="max-w-sm text-sm leading-6 text-slate-500">{children}</p>
    </div>
  )
}

function ProductDetail({ product }: { product: InventoryProduct }) {
  const { products, events, updateProduct, addProduct } = useInventory()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<ProductTab>('overview')
  const [compact, setCompact] = useState(false)
  const [panel, setPanel] = useState<InventoryPanel | 'edit' | 'location' | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string
    quantity: number
  } | null>(null)
  const [notice, setNotice] = useState('')
  const prefix = useId()
  const overview = productForOverview(product)
  const history = events
    .filter((event) => event.productId === product.id)
    .slice()
    .reverse()
  const matches = selectProducts(products, query, 'all')
  function saveProduct(updated: Omit<InventoryProduct, 'id'>) {
    updateProduct(product.id, updated)
    setPanel(null)
    setNotice('Product changes saved in this sample workspace until reload.')
  }
  function downloadProduct() {
    downloadCsv(inventoryCsv([overview]), `kanban-product-${product.sku ?? product.id}.csv`)
    setNotice('Product CSV download started.')
  }

  return (
    <WorkspaceLayout
      title={product.name}
      query={query}
      onQueryChange={setQuery}
      onAction={setPanel}
      notificationCount={products.filter((item) => item.availability !== 'in-stock').length}
    >
      {query.trim() && (
        <section
          aria-label="Product search results"
          className="mb-4 rounded-lg border border-slate-200 bg-white p-4"
        >
          <p role="status" className="mb-3 text-xs text-slate-500">
            {matches.length} matching products
          </p>
          {matches.length ? (
            <ul className="space-y-2">
              {matches.map((match) => (
                <li key={match.id}>
                  <Link
                    to={`/inventory/${match.id}`}
                    onClick={() => setQuery('')}
                    className="dashboard-link"
                  >
                    {match.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Try another product name.</p>
          )}
        </section>
      )}
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800"
        >
          {notice}
        </p>
      )}
      <article className="min-w-0 rounded-[10px] bg-white p-4 pb-7 sm:p-5 sm:pb-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="dashboard-heading">{product.name}</h2>
          <div className="flex gap-3">
            <button onClick={() => setPanel('edit')} className="inventory-button">
              <PencilSimpleIcon size={20} />
              Edit
            </button>
            <button onClick={downloadProduct} className="inventory-button">
              Download
            </button>
          </div>
        </header>
        <ProductTabs active={tab} onChange={setTab} prefix={prefix} />
        <section
          role="tabpanel"
          id={`${prefix}-overview-panel`}
          aria-labelledby={`${prefix}-overview-tab`}
          hidden={tab !== 'overview'}
          tabIndex={0}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
        >
          <ProductOverview
            product={product}
            compact={compact}
            onLocation={(location) => {
              setSelectedLocation(location)
              setPanel('location')
            }}
          />
        </section>
        <section
          role="tabpanel"
          id={`${prefix}-purchases-panel`}
          aria-labelledby={`${prefix}-purchases-tab`}
          hidden={tab !== 'purchases'}
          tabIndex={0}
        >
          <EmptyRecords title="No purchase records">
            No purchase transactions are included for this sample product.
          </EmptyRecords>
        </section>
        <section
          role="tabpanel"
          id={`${prefix}-adjustments-panel`}
          aria-labelledby={`${prefix}-adjustments-tab`}
          hidden={tab !== 'adjustments'}
          tabIndex={0}
        >
          <EmptyRecords title="No stock adjustments">
            No stock adjustment records are included for this sample product.
          </EmptyRecords>
        </section>
        <section
          role="tabpanel"
          id={`${prefix}-history-panel`}
          aria-labelledby={`${prefix}-history-tab`}
          hidden={tab !== 'history'}
          tabIndex={0}
        >
          {history.length ? (
            <ul className="divide-y divide-slate-100 px-2 py-5 sm:px-6">
              {history.map((event) => (
                <li key={event.id} className="flex flex-wrap justify-between gap-3 py-4 text-sm">
                  <span>
                    {event.kind === 'created'
                      ? 'Product added to sample inventory'
                      : 'Product details updated'}
                  </span>
                  <time dateTime={event.at} className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat('en-PH', {
                      timeZone: 'Asia/Manila',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(event.at))}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyRecords title="No activity yet">
              Changes you make to this sample product will appear here during this session.
            </EmptyRecords>
          )}
        </section>
      </article>
      {panel && (
        <DashboardDialog
          title={
            panel === 'edit'
              ? 'Edit Product'
              : panel === 'location'
                ? (selectedLocation?.name ?? 'Stock location')
                : inventoryPanelTitles[panel]
          }
          variant={panel === 'edit' || panel === 'add' ? 'product' : 'default'}
          onClose={() => setPanel(null)}
        >
          {panel === 'edit' ? (
            <ProductForm
              initial={overview}
              products={products}
              onAdd={saveProduct}
              onCancel={() => setPanel(null)}
            />
          ) : panel === 'location' ? (
            <p className="text-sm leading-6 text-slate-500">
              {selectedLocation?.quantity} {product.unit ?? 'Packets'} of {product.name} in hand at{' '}
              {selectedLocation?.name}. Sample stock information.
            </p>
          ) : (
            <InventoryPanelContent
              panel={panel}
              products={products}
              availability="all"
              compact={compact}
              onCompactChange={setCompact}
              onAdd={(newProduct) => {
                addProduct(newProduct)
                setPanel(null)
              }}
              onClose={() => setPanel(null)}
              onFilter={() => setPanel(null)}
              onDownload={() => downloadCsv(inventoryCsv(products), 'kanban-sample-inventory.csv')}
            />
          )}
        </DashboardDialog>
      )}
    </WorkspaceLayout>
  )
}

export default function ProductInfoPage() {
  const { productId } = useParams()
  const { products } = useInventory()
  const navigate = useNavigate()
  const product = products.find((item) => item.id === productId)
  if (!product)
    return (
      <WorkspaceLayout
        title="Product not found"
        query=""
        onQueryChange={() => navigate('/inventory')}
        onAction={() => navigate('/inventory')}
      >
        <section className="dashboard-card grid min-h-96 place-content-center justify-items-center gap-4 text-center">
          <PackageIcon size={40} className="text-slate-300" />
          <h2 className="dashboard-heading">Product not found</h2>
          <p className="text-sm text-slate-500">
            This product is not in the current sample inventory.
          </p>
          <Link to="/inventory" className="inventory-button">
            <ArrowLeftIcon size={17} />
            Back to inventory
          </Link>
        </section>
      </WorkspaceLayout>
    )
  return <ProductDetail key={product.id} product={product} />
}
