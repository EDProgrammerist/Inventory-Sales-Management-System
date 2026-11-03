import {renderToString} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import AppRoutes from '../src/app-routes'
import StorefrontFixture from './storefront-fixture'
import CartPage from '../src/pages/cart'

export function renderUnknownRoute(){
  return renderToString(<MemoryRouter initialEntries={['/missing-public-page']}><StorefrontFixture><AppRoutes/></StorefrontFixture></MemoryRouter>)
}

export function renderCartFeedback(notice:string){
  return renderToString(<MemoryRouter initialEntries={['/cart']}><StorefrontFixture bag={{'iphone-purple':9}} notice={notice}><CartPage/></StorefrontFixture></MemoryRouter>)
}
