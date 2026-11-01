import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router'
import LandingPage from '../src/pages/landing'
import { inventoryProducts } from '../src/data/inventory-demo'
import StorefrontProvider from './storefront-fixture'
import ProductsPage from '../src/pages/products'
import StoreProductPage from '../src/pages/store-product'
import CartPage from '../src/pages/cart'
import AddressPage from '../src/pages/address'
import ShippingPage from '../src/pages/shipping'
import PaymentPage from '../src/pages/payment'

export function renderLanding() {
  const before = JSON.stringify(inventoryProducts)
  const html = renderToStaticMarkup(<MemoryRouter><StorefrontProvider><LandingPage /></StorefrontProvider></MemoryRouter>)
  return { html, inventoryUnchanged: before === JSON.stringify(inventoryProducts) }
}

export function renderProducts(path = '/products') {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><StorefrontProvider><ProductsPage /></StorefrontProvider></MemoryRouter>)
}

export function renderStoreProduct(id: string) {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[`/products/${id}`]}><StorefrontProvider><Routes><Route path="/products/:productId" element={<StoreProductPage />} /></Routes></StorefrontProvider></MemoryRouter>)
}

// Isolated SSR fixture; never initializes the production provider with sample data.
export function renderCart(bag: Record<string, number> = {}) {
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/cart']}><StorefrontProvider bag={bag}><CartPage /></StorefrontProvider></MemoryRouter>)
}

export function renderAddress() {
  return renderToStaticMarkup(<MemoryRouter initialEntries={['/checkout/address']}><StorefrontProvider><AddressPage /></StorefrontProvider></MemoryRouter>)
}

export function renderCheckout(step:'shipping'|'payment') {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[`/checkout/${step}`]}><StorefrontProvider>{step==='shipping'?<ShippingPage/>:<PaymentPage/>}</StorefrontProvider></MemoryRouter>)
}
