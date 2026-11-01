import CheckoutFrame from '@/components/common/checkout-frame'
import ShippingSelection from '@/components/features/landing/shipping-selection'

export default function ShippingPage() {
  return <CheckoutFrame step="shipping" title="Shipping"><ShippingSelection /></CheckoutFrame>
}
