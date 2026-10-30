import inventory from '@/assets/landing/inventory.png'
import overview from '@/assets/landing/overview.png'
import workflow from '@/assets/landing/workflow.png'
import reports from '@/assets/landing/reports.png'
import suppliers from '@/assets/landing/suppliers.png'
import orders from '@/assets/landing/orders.png'
import stores from '@/assets/landing/stores.png'
import together from '@/assets/landing/together.png'
import closing from '@/assets/landing/closing.png'

const illustrations = { inventory, overview, workflow, reports, suppliers, orders, stores, together, closing }

// These images reinforce adjacent headings; meaningful product text stays in HTML.
export default function LandingIllustration({ name, className = '' }: {
  name: keyof typeof illustrations
  className?: string
}) {
  return <img className={`landing-illustration ${className}`} data-landing-illustration={name}
    src={illustrations[name]} alt="" aria-hidden="true" width={1254} height={1254}
    loading={name === 'inventory' ? 'eager' : 'lazy'} decoding="async" />
}
