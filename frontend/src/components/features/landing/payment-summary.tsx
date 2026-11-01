import { Link } from 'react-router'
import { useStorefront } from '@/components/context/storefront-context'
import { cartSummary } from '@/data/storefront-cart'
import { formatMoney } from '@/data/currency'
import { shippingDescription } from '@/data/storefront-checkout'

export default function PaymentSummary() {
  const store=useStorefront()
  const {items,subtotal}=cartSummary(store.bag, store.products)
  const address=store.addressState.addresses.find(item=>item.id===store.addressState.selectedId)
  return <section className="payment-summary" aria-labelledby="payment-summary-title">
    <h2 id="payment-summary-title">Summary</h2>
    {items.length ? <ul className="payment-products">{items.map(({product,quantity,total})=><li key={product.id}><img src={product.image} alt="" width="40" height="55" /><div><Link to={`/products/${product.id}`}>{product.name}</Link><small>{product.variant} · Qty {quantity}</small></div><strong>{formatMoney(total)}</strong></li>)}</ul> : <p className="checkout-description">Your cart is empty. <Link to="/products">Explore products</Link></p>}
    <div className="payment-summary-address"><h3>Address</h3>{address ? <><p>{address.name}</p><p>{address.address}</p><p>{address.phone}</p></> : <p>No address selected.</p>}<h3>Shipment method</h3><p>{shippingDescription(store.shipping)}</p><small>Preference only · No delivery quote</small></div>
    <dl className="payment-totals"><div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div><div><dt>Estimated tax</dt><dd>Not calculated</dd></div><div><dt>Estimated shipping &amp; handling</dt><dd>Not calculated</dd></div><div className="payment-grand-total"><dt>Demo total</dt><dd>{formatMoney(subtotal)}</dd></div></dl>
  </section>
}
