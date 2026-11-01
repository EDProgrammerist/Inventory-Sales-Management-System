import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import StoreHeader from '@/components/features/landing/store-header'
import StoreFooter from '@/components/features/landing/store-footer'
import CheckoutProgress from '@/components/features/landing/checkout-progress'
import { useStorefront } from '@/components/context/storefront-context'
import { useLandingMotion } from '@/components/features/landing/use-landing-motion'
import { cartSummary } from '@/data/storefront-cart'
import type { ShopCategory } from '@/data/storefront-catalog'
import type { CheckoutStep } from '@/data/storefront-checkout'
import '@/styles/address.css'
import '@/styles/checkout.css'

export default function CheckoutFrame({ step, title, children }: { step?:CheckoutStep; title:string; children:ReactNode }) {
  const store = useStorefront()
  const [query,setQuery] = useState('')
  const navigate = useNavigate()
  const motionRef = useLandingMotion()
  const browse = (category:ShopCategory) => navigate(category === 'all' ? '/products' : `/products?category=${category}`)
  return <div className="address-page checkout-page" ref={motionRef}>
    <title>{`${title} | Shenban`}</title><meta name="description" content={`${title} for Shenban demo orders. Simulated payments only; no real charge.`} />
    <a className="shop-skip" href="#shop-main">Skip to checkout details</a>
    <StoreHeader query={query} onQuery={setQuery} onSearch={() => navigate(`/products?q=${encodeURIComponent(query)}`)} category="all" onCategory={browse} savedCount={store.saved.length} bagCount={cartSummary(store.bag, store.products).quantity} onSaved={() => navigate('/products?view=saved')} />
    <main className="shop-container address-main" id="shop-main" tabIndex={-1}>{step&&<CheckoutProgress step={step} />}{children}</main>
    <StoreFooter onBrowse={browse} />
  </div>
}
