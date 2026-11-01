import type { CatalogProduct, ShopCategory } from './storefront-catalog'

export interface ProductFilters {
  category?: ShopCategory
  query?: string
  brands?: string[]
  memory?: string[]
  editions?: string[]
  min?: number
  max?: number
  savedOnly?: boolean
  saved?: string[]
}
export function productBrand(product: CatalogProduct): string {
  return product.category === 'phones' ? 'Apple' : product.category === 'computers' ? 'NVIDIA' : 'Sony'
}
export function productMemory(product: CatalogProduct): string | undefined {
  return /\b(\d+GB)\b/.exec(product.variant)?.[1]
}
export function productEdition(product: CatalogProduct): string {
  return product.variant.split(' · ')[0]
}
export function filterProducts(products: CatalogProduct[], filters: ProductFilters) {
  const query = filters.query?.trim().toLocaleLowerCase() ?? ''
  return products.filter(product =>
    (!filters.category || filters.category === 'all' || product.category === filters.category) &&
    (!filters.brands?.length || filters.brands.includes(productBrand(product))) &&
    (!filters.memory?.length || filters.memory.includes(productMemory(product) ?? '')) &&
    (!filters.editions?.length || filters.editions.includes(productEdition(product))) &&
    (filters.min === undefined || product.price >= filters.min) &&
    (filters.max === undefined || product.price <= filters.max) &&
    (!filters.savedOnly || filters.saved?.includes(product.id)) &&
    `${product.name} ${product.variant} ${productBrand(product)}`.toLocaleLowerCase().includes(query),
  )
}
export function paginateCatalog(products: CatalogProduct[], requested: number, size = 6) {
  const pages = Math.max(1, Math.ceil(products.length / size))
  const page = Math.min(pages, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 1))
  return { page, pages, rows: products.slice((page - 1) * size, page * size), start: products.length ? (page - 1) * size + 1 : 0, end: Math.min(page * size, products.length) }
}
export function numericPrice(value: string | null): number | undefined {
  if (!value || !/^\d+(?:\.\d{1,2})?$/.test(value)) return undefined
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}
