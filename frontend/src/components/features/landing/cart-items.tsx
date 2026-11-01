import { Link } from 'react-router'
import { MinusIcon, PlusIcon, XIcon, ShoppingBagIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { formatMoney } from '@/data/currency'
import type { CartItem } from '@/data/storefront-cart'

export default function CartItems({ items, onQuantity }: { items: CartItem[]; onQuantity: (id: string, quantity: number) => void }) {
  function remove(id: string) {
    onQuantity(id, 0)
    requestAnimationFrame(() => document.getElementById('cart-title')?.focus({ preventScroll:true }))
  }
  if (!items.length) return <div className="cart-empty"><ShoppingBagIcon size={44} weight="light" /><h2>Your cart is empty</h2><p>Find your next iPhone, graphics card, or PlayStation 5 in the collection.</p><Link to="/products" className="shop-button shop-button-solid">Explore products <ArrowRightIcon size={18} /></Link></div>
  return <ul className="cart-items" aria-label="Cart products">{items.map(({ product, quantity, total }) => {
    const name = `${product.name}, ${product.variant}`
    return <li className="cart-item" key={product.id} data-reveal>
      <Link className={`cart-item-image ${product.category === 'computers' ? 'is-gpu' : ''}`} to={`/products/${product.id}`} aria-label={`View ${name}`}><img src={product.image} alt="" width="90" height="112" /></Link>
      <div className="cart-item-description"><h2><Link to={`/products/${product.id}`}>{product.name}<span>{product.variant}</span></Link></h2><p>{product.id}</p><small>{formatMoney(product.price)} each</small></div>
      <div className="cart-item-quantity" role="group" aria-label={`Quantity for ${name}`}>
        <button aria-label={`Decrease ${name} quantity`} disabled={quantity <= 1} onClick={() => onQuantity(product.id, quantity - 1)}><MinusIcon size={17} /></button>
        <input type="number" min="1" max="9" step="1" inputMode="numeric" aria-label={`${name} quantity`} value={quantity} onChange={event => { const value = event.currentTarget.valueAsNumber; if (Number.isSafeInteger(value) && value >= 1) onQuantity(product.id, value) }} />
        <button aria-label={`Increase ${name} quantity`} disabled={quantity >= 9} onClick={() => onQuantity(product.id, quantity + 1)}><PlusIcon size={17} /></button>
      </div>
      <p className="cart-item-total" aria-label={`${name} line total`}>{formatMoney(total)}</p>
      <button className="shop-icon cart-item-remove" aria-label={`Remove ${name}`} onClick={() => remove(product.id)}><XIcon size={21} /></button>
    </li>
  })}</ul>
}
