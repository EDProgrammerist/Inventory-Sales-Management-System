import type { catalogProducts } from '@/db/schema'

export type CatalogRow = typeof catalogProducts.$inferSelect
export function catalogView(rows: CatalogRow[]) {
  return { products: rows.map(row => ({
    id:row.id, name:row.name, variant:row.variant, category:row.category,
    price:Number(row.price), imageKey:row.imageKey, ...(row.image?{image:row.image}:{}), description:row.description, featured:row.featured,
  })) }
}

export function adminCatalogView(rows:CatalogRow[]) {
  const publicRows=catalogView(rows).products
  return {products:publicRows.map((row,index)=>({...row,published:rows[index].published,stockQuantity:rows[index].stockQuantity,threshold:rows[index].threshold,version:rows[index].version}))}
}
