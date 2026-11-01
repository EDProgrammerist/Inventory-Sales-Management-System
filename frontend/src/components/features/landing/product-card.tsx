import { HeartIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'
import type { CatalogProduct } from '@/data/storefront-catalog'
import { formatMoney } from '@/data/currency'

export default function ProductCard({ product, saved, onSave }: {
  product: CatalogProduct; saved: boolean; onSave: () => void
}) {
  return <article className="shop-product" data-reveal>
    <button className={`shop-icon shop-heart ${saved ? 'is-saved' : ''}`} onClick={onSave} aria-pressed={saved} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name} ${product.variant}`}><HeartIcon size={25} weight={saved ? 'fill' : 'regular'} /></button>
    <Link className={`shop-product-image ${product.category === 'computers' ? 'is-gpu' : ''} ${product.id === 'iphone-black' ? 'is-photo' : ''}`} to={`/products/${product.id}`} aria-label={`View ${product.name} ${product.variant}`}><img src={product.image} alt={`${product.name}, ${product.variant}`} loading="lazy" width="240" height="200" /></Link>
    <h3>{product.name}<span>{product.variant}</span></h3>
    <p className="shop-price">{formatMoney(product.price)}</p>
    <Link className="shop-button shop-button-solid" to={`/products/${product.id}`}>View product <ArrowUpRightIcon size={16} /></Link>
  </article>
}
