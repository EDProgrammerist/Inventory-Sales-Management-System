import { useId, useState } from 'react'
import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useStorefront } from '@/components/context/storefront-context'
import { productBrand, productMemory, productEdition, numericPrice } from '@/data/storefront-filters'
import { shopCategories } from './store-categories'

export type UpdateProductFilter = (key: string, value: string | string[]) => void

function FilterGroup({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return <details className="products-filter-group" open={open}><summary>{title}<CaretDownIcon size={18} /></summary><div>{children}</div></details>
}

export default function ProductFilters({ params, onChange, onClear }: { params: URLSearchParams; onChange: UpdateProductFilter; onClear: () => void }) {
  const id = useId()
  const { products } = useStorefront()
  const brands = [...new Set([...products.map(productBrand), ...params.getAll('brand')])].sort()
  const editions = [...new Set([...products.filter(product => product.category !== 'phones').map(productEdition), ...params.getAll('edition')])].sort()
  const memories = [...new Set(products.map(productMemory).filter((value): value is string => Boolean(value)))].sort((a,b)=>parseInt(a)-parseInt(b))
  const catalogPriceLimit = Math.max(1000, Math.ceil(Math.max(0,...products.map(product=>product.price))/1000)*1000)
  const [brandQuery, setBrandQuery] = useState('')
  const [memoryQuery, setMemoryQuery] = useState('')
  const minimum = numericPrice(params.get('min')) ?? 0
  const maximum = numericPrice(params.get('max')) ?? catalogPriceLimit
  function toggle(key: string, value: string) {
    const selected = params.getAll(key)
    onChange(key, selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value])
  }
  return <div className="products-filters">
    <FilterGroup title="Price">
      <div className="products-price-inputs">
        <label htmlFor={`${id}-min`}>From (PHP)<input id={`${id}-min`} aria-label="Minimum price in PHP" type="number" min="0" step="1" placeholder="0" value={params.get('min') ?? ''} onChange={event => onChange('min', event.target.value)} /></label>
        <span aria-hidden="true">—</span>
        <label htmlFor={`${id}-max`}>To (PHP)<input id={`${id}-max`} aria-label="Maximum price in PHP" type="number" min="0" step="1" placeholder={String(catalogPriceLimit)} value={params.get('max') ?? ''} onChange={event => onChange('max', event.target.value)} /></label>
      </div>
      <div className="products-range" style={{ '--range-start': `${Math.min(100, minimum / catalogPriceLimit * 100)}%`, '--range-end': `${Math.min(100, maximum / catalogPriceLimit * 100)}%` } as React.CSSProperties}>
        <span aria-hidden="true" />
        <input type="range" aria-label="Minimum price slider" min="0" max={catalogPriceLimit} step="1000" value={Math.min(catalogPriceLimit, minimum)} onChange={event => onChange('min', String(Math.min(Number(event.target.value), maximum)))} />
        <input type="range" aria-label="Maximum price slider" min="0" max={catalogPriceLimit} step="1000" value={Math.min(catalogPriceLimit, maximum)} onChange={event => onChange('max', String(Math.max(Number(event.target.value), minimum)))} />
      </div>
      {minimum > maximum && <p role="alert" className="products-filter-error">Minimum price must not exceed maximum price.</p>}
    </FilterGroup>
    <FilterGroup title="Brand">
      <label className="products-filter-search"><MagnifyingGlassIcon size={19} /><span className="sr-only">Search brands</span><input type="search" placeholder="Search brands" value={brandQuery} onChange={event => setBrandQuery(event.target.value)} /></label>
      <div className="products-filter-options">{brands.filter(brand => brand.toLowerCase().includes(brandQuery.toLowerCase())).map(brand => <label key={brand}><input type="checkbox" checked={params.getAll('brand').includes(brand)} onChange={() => toggle('brand', brand)} /><span>{brand}</span><small>{products.filter(product => productBrand(product) === brand).length}</small></label>)}</div>
      {brands.every(brand => !brand.toLowerCase().includes(brandQuery.toLowerCase())) && <p className="products-filter-hint">No matching brands.</p>}
    </FilterGroup>
    <FilterGroup title="Built-in memory">
      <label className="products-filter-search"><MagnifyingGlassIcon size={19} /><span className="sr-only">Search memory sizes</span><input type="search" placeholder="Search memory" value={memoryQuery} onChange={event => setMemoryQuery(event.target.value)} /></label>
      <div className="products-filter-options">{memories.filter(memory => memory.toLowerCase().includes(memoryQuery.toLowerCase())).map(memory => <label key={memory}><input type="checkbox" checked={params.getAll('memory').includes(memory)} onChange={() => toggle('memory', memory)} /><span>{memory}</span><small>{products.filter(product => productMemory(product) === memory).length}</small></label>)}</div>
      <p className="products-filter-hint">Phone storage or GPU video memory, as listed.</p>
    </FilterGroup>
    <FilterGroup title="Category" open={false}>
      <div className="products-filter-options">{shopCategories.map(category => <label key={category.id}><input type="radio" name={`${id}-category`} checked={params.get('category') === category.id} onChange={() => onChange('category', category.id)} /><span>{category.name}</span><small>{products.filter(product => product.category === category.id).length}</small></label>)}<label><input type="radio" name={`${id}-category`} checked={!params.get('category') || params.get('category') === 'all'} onChange={() => onChange('category', '')} /><span>All categories</span><small>{products.length}</small></label></div>
    </FilterGroup>
    <FilterGroup title="Edition" open={false}>
      <div className="products-filter-options">{editions.map(edition => <label key={edition}><input type="checkbox" checked={params.getAll('edition').includes(edition)} onChange={() => toggle('edition', edition)} /><span>{edition}</span></label>)}</div>
    </FilterGroup>
    <button type="button" className="products-clear-filters" onClick={onClear}>Clear all filters</button>
  </div>
}
