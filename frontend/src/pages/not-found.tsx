import {Link} from 'react-router'
import CheckoutFrame from '@/components/common/checkout-frame'

export default function NotFoundPage(){
  return <div className="storefront-page"><CheckoutFrame title="Page not found"><section className="cart-empty" aria-labelledby="not-found-title"><h1 id="not-found-title" className="text-2xl font-semibold">Page not found</h1><p>The link may be incorrect or the page may have moved. You can return to the storefront or browse the catalog.</p><div className="flex flex-wrap justify-center gap-4"><Link className="shop-button" to="/">Back to home</Link><Link className="shop-button shop-button-solid" to="/products">Browse products</Link></div></section></CheckoutFrame></div>
}
