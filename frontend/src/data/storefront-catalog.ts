import purple from '@/assets/storefront/iphone-purple.png'
import gold from '@/assets/storefront/iphone-gold.png'
import silver from '@/assets/storefront/iphone-silver.png'
import black from '@/assets/storefront/iphone-black.jpg'
import ps5 from '@/assets/storefront/ps5-disc-console.jpg'
import ps5DiscBox from '@/assets/storefront/ps5-disc-box.jpg'
import ps5Digital from '@/assets/storefront/ps5-digital-console.jpg'
import ps5DigitalBox from '@/assets/storefront/ps5-digital-box.jpg'
import gpu5090 from '@/assets/storefront/rtx-5090.jpg'
import gpu5080 from '@/assets/storefront/rtx-5080.png'

export type ShopCategory = 'all' | 'phones' | 'computers' | 'consoles'
export interface CatalogProduct {
  id: string
  name: string
  variant: string
  category: Exclude<ShopCategory, 'all'>
  price: number
  image: string
  gallery?: {image:string;label:string}[]
  description: string
  featured: boolean
}
const catalogImages: Record<string,string> = {
  'iphone-purple':purple, 'iphone-gold':gold, 'iphone-silver':silver, 'iphone-black':black,
  'rtx-5090':gpu5090, 'rtx-5080':gpu5080, ps5,
}

// Database responses resolve only bundled product assets, never arbitrary URLs.
export function decodeCatalog(data: unknown): CatalogProduct[] {
  const invalid = () => new Error('The catalog service returned invalid product data. Please try again.')
  if (!data || typeof data !== 'object' || !('products' in data) || !Array.isArray(data.products) || data.products.length > 10000) throw invalid()
  const ids = new Set<string>()
  return data.products.map((value: unknown) => {
    if (!value || typeof value !== 'object') throw invalid()
    const row=value as Record<string,unknown>
    if (typeof row.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(row.id) || ids.has(row.id)) throw invalid()
    if (typeof row.name !== 'string' || !row.name.trim() || row.name.length>150 || typeof row.variant !== 'string' || !row.variant.trim() || row.variant.length>150 || typeof row.description !== 'string' || !row.description.trim() || row.description.length>2000) throw invalid()
    if (row.category !== 'phones' && row.category !== 'computers' && row.category !== 'consoles') throw invalid()
    if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price<=0 || row.price>9999999999.99 || Math.abs(row.price*100-Math.round(row.price*100))>0.0001) throw invalid()
    if (typeof row.featured !== 'boolean' || typeof row.imageKey !== 'string' || !Object.hasOwn(catalogImages,row.imageKey)) throw invalid()
    if (row.image!==undefined&&row.image!==null&&(typeof row.image!=='string'||row.image.length>7000000||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(row.image))) throw invalid()
    ids.add(row.id)
    const gallery=typeof row.image!=='string'&&row.imageKey==='ps5'&&(row.id==='ps5-disc'||row.id==='ps5-digital')?[{image:row.id==='ps5-disc'?ps5:ps5Digital,label:'Console'},{image:row.id==='ps5-disc'?ps5DiscBox:ps5DigitalBox,label:'Packaging'}]:undefined
    return {id:row.id,name:row.name,variant:row.variant,category:row.category,price:row.price,image:typeof row.image==='string'?row.image:gallery?.[0].image??catalogImages[row.imageKey],...(gallery?{gallery}:{}),description:row.description,featured:row.featured}
  })
}

export function selectCatalog(products: CatalogProduct[], category: ShopCategory, query: string, view: string, favorites: string[]) {
  const term = query.trim().toLocaleLowerCase()
  return products.filter(product =>
    (category === 'all' || product.category === category) &&
    `${product.name} ${product.variant}`.toLocaleLowerCase().includes(term) &&
    (view !== 'featured' || product.featured) &&
    (view !== 'saved' || favorites.includes(product.id)),
  )
}
