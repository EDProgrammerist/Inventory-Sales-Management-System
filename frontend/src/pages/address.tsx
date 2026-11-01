import CheckoutFrame from '@/components/common/checkout-frame'
import AddressSelection from '@/components/features/landing/address-selection'

export default function AddressPage() {
  return <CheckoutFrame step="address" title="Address"><AddressSelection /></CheckoutFrame>
}
