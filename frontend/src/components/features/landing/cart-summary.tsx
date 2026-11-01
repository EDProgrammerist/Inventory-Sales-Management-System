import { formatMoney } from '@/data/currency'
import { Link } from 'react-router'

export default function CartSummary({ subtotal, hasItems }: { subtotal: number; hasItems: boolean }) {
  return <section className="cart-summary" aria-labelledby="cart-summary-title" data-reveal>
    <h2 id="cart-summary-title">Order Summary</h2>
    <fieldset disabled aria-describedby="cart-benefits-note"><legend className="sr-only">Discount and bonus options, unavailable</legend>
      <label htmlFor="cart-discount">Discount code / Promo code</label><input id="cart-discount" placeholder="Code" autoComplete="off" />
      <label htmlFor="cart-bonus">Your bonus card number</label><div className="cart-bonus-field"><input id="cart-bonus" placeholder="Enter card number" autoComplete="off" /><button type="button">Apply</button></div>
    </fieldset>
    <p className="cart-summary-note" id="cart-benefits-note">Promo codes and bonus cards are not available in this display catalog.</p>
    <dl className="cart-totals"><div><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div><div className="cart-unavailable-total"><dt>Estimated tax</dt><dd>Not calculated</dd></div><div className="cart-unavailable-total"><dt>Estimated shipping &amp; handling</dt><dd>Not calculated</dd></div><div className="cart-grand-total"><dt>Demo total</dt><dd>{formatMoney(subtotal)}</dd></div></dl>
    {hasItems ? <Link className="shop-button shop-button-solid cart-checkout" to="/checkout/address" aria-describedby="cart-checkout-note">Continue to address</Link> : <button className="shop-button shop-button-solid cart-checkout" disabled aria-describedby="cart-checkout-note">Continue to address</button>}
    <p className="cart-summary-note" id="cart-checkout-note">Continue to demo checkout. Your order will be saved when you place it; no real payment or delivery is created.</p>
  </section>
}
