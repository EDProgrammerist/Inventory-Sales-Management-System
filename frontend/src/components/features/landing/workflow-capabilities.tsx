import { Link } from 'react-router'
import { TruckIcon, ClipboardTextIcon, StorefrontIcon } from '@phosphor-icons/react'

const capabilities = [
  { route: '/suppliers', title: 'Manage suppliers', icon: TruckIcon,
    description: 'Keep supplier contacts and the products they supply together.' },
  { route: '/orders', title: 'Track your orders', icon: ClipboardTextIcon,
    description: 'Record quantities, buying prices, and expected delivery dates.' },
  { route: '/manage-store', title: 'Organize your stores', icon: StorefrontIcon,
    description: 'Keep branch addresses and contact details in one place.' },
]

function CapabilityConnector({ index }: { index: number }) {
  const paths = [
    'M29 3c15 31 4 49-7 43-15-9 16-16 6 9-4 10-11 16-20 20m2-11L8 75l12-1',
    'M29 3C9 35 13 54 22 75m-9-8 9 8 6-11',
    'M14 3c-10 26-4 44 7 42 14-3-9-17-7 2 1 13 10 22 22 28m-12 0h12l-2-12',
  ]
  return <svg className="capability-connector" viewBox="0 0 44 80" fill="none" aria-hidden="true"><path d={paths[index]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export default function WorkflowCapabilities() {
  return (
    <section className="landing-container landing-capability" aria-labelledby="capability-heading">
      <h2 id="capability-heading" className="sr-only">Make it your own.</h2>
      <nav className="capability-grid" aria-label="Open inventory workflows">
        {capabilities.map(({ route, title, icon: Icon, description }, index) => (
          <Link className="capability-item" to={route} key={route}>
            <CapabilityConnector index={index} />
            <span className="capability-icon" aria-hidden="true"><Icon size={22} /></span>
            <h3>{title}</h3>
            <p>{description}</p>
          </Link>
        ))}
      </nav>
    </section>
  )
}
