import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '@/components/context/auth-state'
import { Link, useLocation } from 'react-router'
import { MagnifyingGlassIcon, HeartIcon, ShoppingBagIcon, UserIcon, ListIcon, XIcon } from '@phosphor-icons/react'
import logo from '@/assets/shenban-logo.png'
import type { ShopCategory } from '@/data/storefront-catalog'
import { shopCategories } from './store-categories'

export function ShopBrand() {
  return <Link to="/" className="shop-brand" aria-label="Shenban home"><img src={logo} width="34" height="38" alt="" /><span>Shenban</span></Link>
}

export default function StoreHeader({ query, onQuery, onSearch, category, onCategory, savedCount, bagCount, onSaved }: {
  query: string; onQuery: (query: string) => void; category: ShopCategory; onCategory: (category: ShopCategory) => void
  savedCount: number; bagCount: number; onSaved: () => void
  onSearch: () => void
}) {
  const [menu, setMenu] = useState(false)
  const menuToggle = useRef<HTMLButtonElement>(null)
  const navigation = useRef<HTMLElement>(null)
  useEffect(() => {
    if (menu) navigation.current?.querySelector<HTMLAnchorElement>('a')?.focus()
  }, [menu])
  const account=useContext(AuthContext)?.user
  const { pathname } = useLocation()
  return <>
    <header className="shop-header" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false)
    }} onKeyDown={event => {
      if (menu && event.key === 'Escape') {
        event.preventDefault()
        setMenu(false)
        menuToggle.current?.focus()
      }
    }}>
      <div className="shop-container shop-header-inner">
        <ShopBrand />
        <form className="shop-search" role="search" onSubmit={event => { event.preventDefault(); onSearch() }}>
          <MagnifyingGlassIcon size={21} aria-hidden="true" />
          <label htmlFor="shop-search" className="sr-only">Search iPhones, graphics cards, and PS5 consoles</label>
          <input id="shop-search" type="search" placeholder="Search products" value={query} onChange={event => onQuery(event.target.value)} />
          {query && <button type="button" onClick={() => onQuery('')} aria-label="Clear product search"><XIcon size={18} /></button>}
        </form>
        <nav ref={navigation} className={`shop-main-nav ${menu ? 'is-open' : ''}`} id="shop-main-nav" aria-label="Main navigation">
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => setMenu(false)}>Home</Link>
          <Link to="/products" aria-current={pathname.startsWith('/products') ? 'page' : undefined} onClick={() => setMenu(false)}>Catalog</Link>
          <a href="#about-shenban" onClick={() => setMenu(false)}>About</a>
        </nav>
        <div className="shop-header-actions">
          <button className="shop-icon" onClick={onSaved} aria-label={`Saved products, ${savedCount}`}><HeartIcon size={25} />{savedCount > 0 && <span>{savedCount}</span>}</button>
          <Link className="shop-icon" to="/cart" aria-current={pathname === '/cart' ? 'page' : undefined} aria-label={`Shopping cart, ${bagCount} items`}><ShoppingBagIcon size={25} />{bagCount > 0 && <span>{bagCount}</span>}</Link>
          <Link className="shop-icon shop-account" to={account?.role==='ADMIN'?'/dashboard':account?'/account/orders':'/login'} aria-label={account?.role==='ADMIN'?'Open admin dashboard':account?'My orders':'Sign in to your account'}><UserIcon size={25} /></Link>
          <button ref={menuToggle} className="shop-icon shop-menu-toggle" aria-label={menu ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="shop-main-nav" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <XIcon size={25} /> : <ListIcon size={25} />}</button>
        </div>
      </div>
    </header>
    <nav className="shop-category-bar" aria-label="Product categories"><div className="shop-container">
      {shopCategories.map(({ id, name, detail, icon: Icon }) => <button key={id} aria-pressed={category === id} onClick={() => onCategory(id)}><Icon size={24} /><span>{name}<small>{detail}</small></span></button>)}
    </div></nav>
  </>
}
