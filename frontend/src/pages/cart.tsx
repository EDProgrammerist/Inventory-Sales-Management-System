import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import StoreHeader from '@/components/features/landing/store-header'
import StoreFooter from '@/components/features/landing/store-footer'
import CartItems from '@/components/features/landing/cart-items'
import CartSummary from '@/components/features/landing/cart-summary'
import { useStorefront } from '@/components/context/storefront-context'
import { useLandingMotion } from '@/components/features/landing/use-landing-motion'
import { cartSummary } from '@/data/storefront-cart'
import type { ShopCategory } from '@/data/storefront-catalog'
import '@/styles/cart.css'

export default function CartPage() {
  const store = useStorefront()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const motionRef = useLandingMotion()
  const { items, quantity, subtotal } = cartSummary(store.bag, store.products)
  const browse = (category: ShopCategory) => navigate(category === 'all' ? '/products' : `/products?category=${category}`)
  return <div className="cart-page" ref={motionRef}>
    <title>Shopping Cart | Shenban</title>
    <meta name="description" content="Review your Shenban cart, edit quantities, and place a demo order. Prices are in PHP; no real payment is collected." />
    <a className="shop-skip" href="#shop-main">Skip to shopping cart</a>
    <StoreHeader query={query} onQuery={setQuery} onSearch={() => navigate(`/products?q=${encodeURIComponent(query)}`)} category="all" onCategory={browse} savedCount={store.saved.length} bagCount={quantity} onSaved={() => navigate('/products?view=saved')} />
    <main id="shop-main" className="shop-container cart-main" tabIndex={-1}>
      <div className="cart-layout"><section aria-labelledby="cart-title" className="cart-selection"><h1 id="cart-title" tabIndex={-1}>Shopping Cart</h1><p className="cart-disclosure">Display catalog · Illustrative PHP prices.</p><p className="sr-only" role="status" aria-live="polite">{quantity} {quantity === 1 ? 'item' : 'items'} in your cart. Subtotal {subtotal.toLocaleString('en-PH')} pesos.</p><CartItems items={items} onQuantity={store.setQuantity} /><Link className="cart-continue" to="/products"><ArrowLeftIcon size={18} />Continue browsing</Link><p className="cart-session-note">Your cart is temporary and resets when this page is reloaded.</p></section><CartSummary subtotal={subtotal} hasItems={quantity > 0} /></div>
    </main>
    <StoreFooter onBrowse={browse} />
  </div>
}
