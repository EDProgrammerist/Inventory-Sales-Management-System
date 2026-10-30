import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import LandingPage from '../src/pages/landing'
import { inventoryProducts } from '../src/data/inventory-demo'

export function renderLanding() {
  const before = JSON.stringify(inventoryProducts)
  const html = renderToStaticMarkup(<MemoryRouter><LandingPage /></MemoryRouter>)
  return { html, inventoryUnchanged: before === JSON.stringify(inventoryProducts) }
}
