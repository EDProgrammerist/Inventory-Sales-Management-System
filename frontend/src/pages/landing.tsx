import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRightIcon, ArrowUpRightIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import StoreHeader from '@/components/features/landing/store-header'
import StoreFooter from '@/components/features/landing/store-footer'
import { shopCategories } from '@/components/features/landing/store-categories'
import ProductCard from '@/components/features/landing/product-card'
import { useStorefront } from '@/components/context/storefront-context'
import { useLandingMotion } from '@/components/features/landing/use-landing-motion'
import { selectCatalog, type ShopCategory } from '@/data/storefront-catalog'
import hero from '@/assets/storefront/iphone-hero.png'
import ps5 from '@/assets/storefront/ps5.png'
import gold from '@/assets/storefront/iphone-gold.png'
import silver from '@/assets/storefront/iphone-silver.png'
import gpu from '@/assets/storefront/rtx-5090.jpg'
import '@/styles/landing.css'

export default function LandingPage() {
  const ref = useLandingMotion()
  const navigate = useNavigate()
  const { saved, bag, notice, toggleSaved, products:catalog } = useStorefront()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ShopCategory>('all')
  const [view, setView] = useState('all')
  const [sort, setSort] = useState('recommended')
  const products = selectCatalog(catalog, category, query, view, saved).slice().sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0)
  function browse(next: ShopCategory = 'all') {
    navigate(next === 'all' ? '/products' : `/products?category=${next}`)
  }
  return <div className="storefront-page" ref={ref}>
    <title>Shenban | iPhone, graphics cards & PlayStation 5</title>
    <meta name="description" content="Explore iPhones, desktop graphics cards, and PlayStation 5 in the Shenban display catalog." />
    <a className="shop-skip" href="#shop-main">Skip to content</a>
    <StoreHeader query={query} onQuery={value => { setQuery(value); setView('all') }} onSearch={() => navigate(`/products?q=${encodeURIComponent(query)}`)} category={category} onCategory={browse} savedCount={saved.length} bagCount={Object.values(bag).reduce((sum, quantity) => sum + quantity, 0)} onSaved={() => navigate('/products?view=saved')} />
    <main id="shop-main" tabIndex={-1}>
      <section className="shop-hero" aria-labelledby="shop-heading">
        <div className="shop-container shop-hero-inner">
          <div className="shop-hero-copy"><h1 id="shop-heading">iPhone 14 <strong>Pro.</strong></h1><p>Explore the Shenban electronics catalog. iPhones, graphics cards, and PlayStation 5, all in one place.</p><button className="shop-button shop-button-light" onClick={() => browse('phones')}>Explore iPhone <ArrowUpRightIcon size={18} /></button></div>
          <img className="shop-hero-image" src={hero} alt="Space black iPhone 14 Pro shown from the front and back" width="406" height="632" fetchPriority="high" />
        </div>
      </section>
      <section className="shop-mosaic" aria-label="Explore the collection">
        <article className="shop-ps5-feature" data-reveal><img src={ps5} alt="PlayStation 5 consoles and DualSense controller" width="273" height="328" /><div><h2>PlayStation <strong>5</strong></h2><p>A new home for your next adventure.</p><button className="shop-text-link" onClick={() => browse('consoles')}>Explore consoles <ArrowUpRightIcon size={17} /></button></div></article>
        <article className="shop-phone-feature shop-gold-feature" data-reveal><img src={gold} alt="Gold iPhone 14 Pro" width="160" height="180" /><div><h2>Find your<br /><strong>gold standard.</strong></h2><button className="shop-text-link" onClick={() => navigate('/products/iphone-gold')}>Explore gold <ArrowUpRightIcon size={16} /></button></div></article>
        <article className="shop-phone-feature shop-silver-feature" data-reveal><img src={silver} alt="Silver iPhone 14 Pro" width="160" height="180" /><div><h2>A little more<br /><strong>brilliant.</strong></h2><button className="shop-text-link" onClick={() => navigate('/products/iphone-silver')}>Explore silver <ArrowUpRightIcon size={16} /></button></div></article>
        <article className="shop-gpu-feature" data-reveal><img src={gpu} alt="NVIDIA GeForce RTX 5090 Founders Edition graphics card" width="1280" height="720" /><div><h2>Built for your<br /><strong>next level.</strong></h2><p>Graphics cards for the desktop you have in mind.</p><button className="shop-button shop-button-light" onClick={() => browse('computers')}>Explore GPUs <ArrowUpRightIcon size={18} /></button></div></article>
      </section>
      <section className="shop-category-section" id="categories" aria-labelledby="categories-heading"><div className="shop-container">
        <div className="shop-section-header"><h2 id="categories-heading">Browse by category</h2><div className="shop-category-arrows"><button className="shop-icon" aria-label="Previous category" onClick={() => browse(shopCategories[(Math.max(0, shopCategories.findIndex(item => item.id === category)) + 2) % 3].id)}><CaretLeftIcon size={25} /></button><button className="shop-icon" aria-label="Next category" onClick={() => browse(shopCategories[(shopCategories.findIndex(item => item.id === category) + 1) % 3].id)}><CaretRightIcon size={25} /></button></div></div>
        <div className="shop-category-grid">{shopCategories.map(({ id, name, detail, icon: Icon }) => <button key={id} className={category === id ? 'is-active' : ''} aria-pressed={category === id} onClick={() => browse(id)} data-reveal><Icon size={40} weight="light" /><span>{name}</span><small>{detail}</small></button>)}</div>
      </div></section>
      <section className="shop-container shop-catalog" id="catalog" aria-labelledby="catalog-heading">
        <div className="shop-section-header shop-catalog-heading"><h2 id="catalog-heading">The collection</h2><label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
        <div className="shop-catalog-controls"><div className="shop-view-controls" role="group" aria-label="Catalog view">{[['all', 'All products'], ['featured', 'Featured'], ['saved', 'Saved products']].map(([id, label]) => <button key={id} className={view === id ? 'is-active' : ''} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}</div><select aria-label="Filter product category" value={category} onChange={event => setCategory(event.target.value as ShopCategory)}><option value="all">All categories</option><option value="phones">Phones / iPhone</option><option value="computers">Computers / GPU</option><option value="consoles">Consoles / PS5</option></select></div>
        <p className="shop-catalog-note">Demo store · Prices in PHP. Checkout saves simulated orders; no real payment is collected.</p>
        <p className="sr-only" role="status" aria-live="polite">{products.length} products shown. {notice}</p>
        <div className="shop-product-grid">{products.map(product => <ProductCard key={product.id} product={product} saved={saved.includes(product.id)} onSave={() => toggleSaved(product.id)} />)}</div>
        {!products.length && <div className="shop-empty"><h3>No products found</h3><p>Try another search, category, or catalog view.</p><button className="shop-button shop-button-solid" onClick={() => { setQuery(''); setCategory('all'); setView('all') }}>Show all products</button></div>}
      </section>
      <section className="shop-editorial" aria-label="Find your next upgrade">
        <article className="shop-editorial-phone" data-reveal><img src={silver} alt="Silver iPhone 14 Pro front and back" width="240" height="270" loading="lazy" /><div><h2>Everyday.<br /><strong>Elevated.</strong></h2><p>A phone that fits into your world. Explore the iPhone collection.</p><button className="shop-button" onClick={() => browse('phones')}>Explore iPhone <ArrowRightIcon size={17} /></button></div></article>
        <article className="shop-editorial-gpu" data-reveal><img src={gpu} alt="GeForce RTX graphics card cooling system" width="1280" height="720" loading="lazy" /><div><h2>Make room<br /><strong>for more.</strong></h2><p>Your next desktop starts with the right graphics card.</p><button className="shop-button shop-button-light" onClick={() => browse('computers')}>Explore GPUs <ArrowRightIcon size={17} /></button></div></article>
        <article className="shop-editorial-console" data-reveal><img src={ps5} alt="PlayStation 5 console family" width="273" height="328" loading="lazy" /><div><h2>Your next<br /><strong>great escape.</strong></h2><p>Find a place for PlayStation 5 in your setup.</p><button className="shop-button" onClick={() => browse('consoles')}>Explore PS5 <ArrowRightIcon size={17} /></button></div></article>
      </section>
      <section className="shop-closing" aria-labelledby="closing-heading"><img className="shop-closing-phone" src={gold} alt="" width="160" height="180" loading="lazy" /><div data-reveal><h2 id="closing-heading">Your next <strong>upgrade.</strong></h2><p>Three collections. Find what feels right for you.</p><button className="shop-button shop-button-light" onClick={() => browse()}>Explore the collection <ArrowUpRightIcon size={18} /></button></div><img className="shop-closing-ps5" src={ps5} alt="" width="273" height="328" loading="lazy" /></section>
    </main>
    <StoreFooter onBrowse={browse} />
  </div>
}
