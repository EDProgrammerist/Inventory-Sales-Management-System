import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CaretRightIcon, CaretLeftIcon, SlidersHorizontalIcon, XIcon } from '@phosphor-icons/react'
import StoreHeader from '@/components/features/landing/store-header'
import StoreFooter from '@/components/features/landing/store-footer'
import ProductCard from '@/components/features/landing/product-card'
import ProductFilters, { type UpdateProductFilter } from '@/components/features/landing/product-filters'
import { useLandingMotion } from '@/components/features/landing/use-landing-motion'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import { useStorefront } from '@/components/context/storefront-context'
import { type ShopCategory } from '@/data/storefront-catalog'
import { filterProducts, numericPrice, paginateCatalog } from '@/data/storefront-filters'
import '@/styles/products.css'

const categoryLabels: Record<ShopCategory, string> = { all: 'Products', phones: 'iPhones', computers: 'Graphics cards', consoles: 'PlayStation 5' }

export default function ProductsPage() {
  const motionRef = useLandingMotion()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const store = useStorefront()
  const rawCategory = params.get('category')
  const category: ShopCategory = rawCategory === 'phones' || rawCategory === 'computers' || rawCategory === 'consoles' ? rawCategory : 'all'
  const query = params.get('q') ?? ''
  const savedOnly = params.get('view') === 'saved'
  const sort = params.get('sort') ?? 'recommended'
  const rows = filterProducts(store.products, { category, query, brands: params.getAll('brand'), memory: params.getAll('memory'), editions: params.getAll('edition'), min: numericPrice(params.get('min')), max: numericPrice(params.get('max')), savedOnly, saved: store.saved }).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : 0)
  const result = paginateCatalog(rows, Number(params.get('page') ?? '1'))
  const filterCount = params.getAll('brand').length + params.getAll('memory').length + params.getAll('edition').length + Number(params.has('min')) + Number(params.has('max')) + Number(category !== 'all') + Number(savedOnly)
  const update: UpdateProductFilter = (key, value) => {
    setParams(current => {
      const next = new URLSearchParams(current)
      next.delete(key); next.delete('page')
      for (const item of Array.isArray(value) ? value : [value]) if (item) next.append(key, item)
      return next
    }, { replace: true, preventScrollReset: true })
  }
  function browse(next: ShopCategory) {
    setParams(next === 'all' ? {} : { category: next })
  }
  function changePage(page: number) {
    setParams(current => { const next = new URLSearchParams(current); next.set('page', String(page)); return next })
    document.getElementById('products-results')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }
  const clear = () => setParams({})
  const filters = <ProductFilters params={params} onChange={update} onClear={clear} />
  return <div className="products-page" ref={motionRef}>
    <title>{`${categoryLabels[category]} | Shenban`}</title>
    <meta name="description" content="Browse the Shenban display catalog. Filter iPhones, graphics cards, and PlayStation 5 by price, brand, and listed memory." />
    <a className="shop-skip" href="#shop-main">Skip to products</a>
    <StoreHeader query={query} onQuery={value => update('q', value)} onSearch={() => document.getElementById('products-results')?.focus()} category={category} onCategory={browse} savedCount={store.saved.length} bagCount={Object.values(store.bag).reduce((sum, quantity) => sum + quantity, 0)} onSaved={() => update('view', savedOnly ? '' : 'saved')} />
    <main className="shop-container products-main" id="shop-main" tabIndex={-1}>
      <nav className="products-breadcrumbs" aria-label="Breadcrumb" data-reveal><Link to="/">Home</Link><CaretRightIcon size={16} /><Link to="/products">Catalog</Link><CaretRightIcon size={16} /><span aria-current="page">{savedOnly ? 'Saved products' : categoryLabels[category]}</span></nav>
      <div className="products-layout">
        <aside className="products-sidebar" aria-label="Filter products" data-reveal>{filters}</aside>
        <section className="products-results" id="products-results" aria-labelledby="products-title" tabIndex={-1}>
          <header className="products-toolbar" data-reveal><div><h1 id="products-title">{savedOnly ? 'Saved products' : categoryLabels[category]}</h1><p role="status" aria-live="polite">Selected products: <strong>{rows.length}</strong></p></div><label><span className="sr-only">Sort products</span><select value={sort} onChange={event => update('sort', event.target.value)}><option value="recommended">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Product name</option></select></label></header>
          <div className="products-mobile-controls"><button className="shop-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontalIcon size={18} />Filters{filterCount > 0 ? ` (${filterCount})` : ''}</button>{filterCount > 0 && <button className="products-clear-filters" onClick={clear}>Reset filters</button>}</div>
          <p className="products-disclosure">Demo store · Prices in PHP. Checkout saves simulated orders; no real payment is collected.</p>
          {(query || filterCount > 0) && <div className="products-active-filters">{query && <button onClick={() => update('q', '')}>Search: {query}<XIcon size={14} /></button>}{category !== 'all' && <button onClick={() => update('category', '')}>{categoryLabels[category]}<XIcon size={14} /></button>}{params.getAll('brand').map(brand => <button key={brand} onClick={() => update('brand', params.getAll('brand').filter(value => value !== brand))}>{brand}<XIcon size={14} /></button>)}{savedOnly && <button onClick={() => update('view', '')}>Saved only<XIcon size={14} /></button>}</div>}
          <div className="shop-product-grid products-grid">{result.rows.map(product => <ProductCard key={product.id} product={product} saved={store.saved.includes(product.id)} onSave={() => store.toggleSaved(product.id)} />)}</div>
          {!rows.length && <div className="shop-empty"><h2>No matching products</h2><p>Try a different price, brand, or search.</p><button className="shop-button shop-button-solid" onClick={clear}>Clear filters</button></div>}
          <footer className="products-pagination"><p>Showing {result.start}–{result.end} of {rows.length}</p><nav aria-label="Product pages"><button className="shop-icon" aria-label="Previous product page" disabled={result.page <= 1} onClick={() => changePage(result.page - 1)}><CaretLeftIcon size={20} /></button>{Array.from({ length: result.pages }, (_, index) => index + 1).map(page => <button key={page} aria-label={`Product page ${page}`} aria-current={page === result.page ? 'page' : undefined} onClick={() => changePage(page)}>{page}</button>)}<button className="shop-icon" aria-label="Next product page" disabled={result.page >= result.pages} onClick={() => changePage(result.page + 1)}><CaretRightIcon size={20} /></button></nav></footer>
        </section>
      </div>
    </main>
    <StoreFooter onBrowse={browse} />
    {filtersOpen && <DashboardDialog title="Filters" onClose={() => setFiltersOpen(false)}><div className="products-mobile-filters">{filters}<button className="shop-button shop-button-solid" onClick={() => setFiltersOpen(false)}>Show {rows.length} products</button></div></DashboardDialog>}
  </div>
}
