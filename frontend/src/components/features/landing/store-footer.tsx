import { Link } from 'react-router'
import {useContext} from 'react'
import {AuthContext} from '@/components/context/auth-state'
import { ShopBrand } from './store-header'
import { shopCategories } from './store-categories'
import type { ShopCategory } from '@/data/storefront-catalog'

export default function StoreFooter({ onBrowse }: { onBrowse: (category: ShopCategory) => void }) {
  const account=useContext(AuthContext)?.user
  return <footer className="shop-footer" id="about-shenban"><div className="shop-container">
    <div className="shop-footer-main"><div><ShopBrand /><p>iPhone. Graphics cards. PlayStation 5.<br />A considered collection for your everyday, your next build, and your downtime.</p></div>
      <nav aria-label="Explore collections"><h2>Explore</h2>{shopCategories.map(item => <button key={item.id} onClick={() => onBrowse(item.id)}>{item.name} · {item.detail}</button>)}</nav>
      <nav aria-label="Account links"><h2>Your account</h2>{account?<Link to={account.role==='ADMIN'?'/dashboard':'/account/orders'}>{account.role==='ADMIN'?'Admin dashboard':'My orders'}</Link>:<><Link to="/login">Sign in</Link><Link to="/signup">Create an account</Link></>}</nav>
    </div><div className="shop-footer-bottom"><span>© {new Date().getFullYear()} Shenban</span><p>Demo store. No real payments are collected.</p><a href="#shop-main">Back to top ↑</a></div>
  </div></footer>
}
