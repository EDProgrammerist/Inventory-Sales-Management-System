import { useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CaretRightIcon, HeartIcon, TruckIcon, PackageIcon, ShieldCheckIcon, DeviceMobileIcon, CpuIcon, MemoryIcon, CameraIcon, LightningIcon, HardDriveIcon } from '@phosphor-icons/react'
import StoreHeader from '@/components/features/landing/store-header'
import StoreFooter from '@/components/features/landing/store-footer'
import ProductCard from '@/components/features/landing/product-card'
import ProductGallery from '@/components/features/landing/product-gallery'
import ProductSpecifications from '@/components/features/landing/product-specifications'
import ProductReviews from '@/components/features/landing/product-reviews'
import { useStorefront } from '@/components/context/storefront-context'
import { useLandingMotion } from '@/components/features/landing/use-landing-motion'
import { type CatalogProduct, type ShopCategory } from '@/data/storefront-catalog'
import { getProductDetails, relatedProducts, type SpecKind } from '@/data/storefront-details'
import { formatMoney } from '@/data/currency'
import '@/styles/product-detail.css'

const icons = { display: DeviceMobileIcon, chip: CpuIcon, memory: MemoryIcon, camera: CameraIcon, power: LightningIcon, storage: HardDriveIcon }
const categoryNames = { phones: 'iPhones', computers: 'Graphics cards', consoles: 'PlayStation 5' }
const finishes: Record<string, string> = { 'iphone-purple': '#604674', 'iphone-gold': '#e6d3b2', 'iphone-silver': '#e7e7e7', 'iphone-black': '#29272b' }

export default function StoreProductPage() {
  const { productId } = useParams()
  const product = useStorefront().products.find(item => item.id === productId)
  return <ProductSurface key={productId} product={product} />
}

function ProductSurface({ product }: { product?: CatalogProduct }) {
  const [query, setQuery] = useState('')
  const store = useStorefront()
  const navigate = useNavigate()
  const motionRef = useLandingMotion()
  const browse = (category: ShopCategory) => navigate(category === 'all' ? '/products' : `/products?category=${category}`)
  const details = product ? getProductDetails(product) : null
  return <div className="product-detail-page" ref={motionRef}>
    <title>{`${product ? `${product.name} — ${product.variant}` : 'Product not found'} | Shenban`}</title>
    <meta name="description" content={product ? `${product.name}, ${product.variant}. Explore specifications and related products in the Shenban display catalog.` : 'This product is not in the Shenban catalog.'} />
    <a className="shop-skip" href="#shop-main">Skip to product</a>
    <StoreHeader query={query} onQuery={setQuery} onSearch={() => navigate(`/products?q=${encodeURIComponent(query)}`)} category={product?.category ?? 'all'} onCategory={browse} savedCount={store.saved.length} bagCount={Object.values(store.bag).reduce((sum, quantity) => sum + quantity, 0)} onSaved={() => navigate('/products?view=saved')} />
    <main id="shop-main" tabIndex={-1}>
      {product && details ? <>
        <nav className="shop-container product-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><CaretRightIcon size={16} /><Link to="/products">Catalog</Link><CaretRightIcon size={16} /><Link to={`/products?category=${product.category}`}>{categoryNames[product.category]}</Link><CaretRightIcon size={16} /><span aria-current="page">{product.name}</span></nav>
        <section className="shop-container product-overview" aria-labelledby="product-title">
          <ProductGallery product={product} />
          <div className="product-purchase" data-reveal>
            <h1 id="product-title">{product.name}</h1><p className="product-selected-variant">{product.variant}</p>
            <p className="product-detail-price">{formatMoney(product.price)}<small>Illustrative display price</small></p>
            <ProductConfigurations product={product} />
            {details.highlights.length>0&&<dl className="product-highlights">{details.highlights.map(({ label, value, kind }) => <Highlight key={label} label={label} value={value} kind={kind} />)}</dl>}
            <p className="product-short-description">{product.description} <a href="#detail-heading">More details</a></p>
            <div className="product-actions"><button className="shop-button" aria-pressed={store.saved.includes(product.id)} onClick={() => store.toggleSaved(product.id)}><HeartIcon size={21} weight={store.saved.includes(product.id) ? 'fill' : 'regular'} />{store.saved.includes(product.id) ? 'Saved to wishlist' : 'Add to wishlist'}</button><button className="shop-button shop-button-solid" onClick={() => { store.addToBag(product.id); navigate('/cart') }}>Add to cart</button></div>
            <p className="product-purchase-note">Display catalog. Selecting a product does not place an order or reserve stock.</p>
            <div className="product-service-facts"><div><TruckIcon size={24} /><p>Delivery<span>Preference only</span></p></div><div><PackageIcon size={24} /><p>Stock<span>Checked at checkout</span></p></div><div><ShieldCheckIcon size={24} /><p>Purchases<span>Demo orders</span></p></div></div>
          </div>
        </section>
        <ProductSpecifications product={product} details={details} />
        <ProductReviews />
        <section className="shop-container product-related" aria-labelledby="related-heading"><h2 id="related-heading">Related products</h2><div className="shop-product-grid">{relatedProducts(product, store.products).map(item => <ProductCard key={item.id} product={item} saved={store.saved.includes(item.id)} onSave={() => store.toggleSaved(item.id)} />)}</div></section>
      </> : <section className="shop-container shop-empty product-missing"><h1>Product not found</h1><p>This product is not listed in the display catalog.</p><Link className="shop-button shop-button-solid" to="/products">Back to catalog</Link></section>}
    </main>
    <StoreFooter onBrowse={browse} />
  </div>
}

function Highlight({ label, value, kind }: { label: string; value: string; kind: SpecKind }) {
  const Icon = icons[kind]
  return <div><Icon size={24} weight="light" /><div><dt>{label}</dt><dd>{value}</dd></div></div>
}

function ProductConfigurations({ product }: { product: CatalogProduct }) {
  const variants = useStorefront().products.filter(item => item.category === product.category)
  const phones = product.category === 'phones'
  return <div className="product-configurations">
    {phones && <div className="product-finishes"><span>Finish</span><div>{variants.map(item => <Link key={item.id} to={`/products/${item.id}`} state={{productSelection:true}} aria-current={item.id === product.id ? 'true' : undefined} aria-label={`${item.variant.split(' · ')[1]}, ${item.name}, ${item.variant.split(' · ')[0]}`} style={{ '--finish': finishes[item.id] } as CSSProperties}><span /></Link>)}</div><strong>{product.variant.split(' · ')[1]}</strong></div>}
    <fieldset><legend>{phones ? 'Listed configurations' : 'Choose a model'}</legend><div className="product-config-options">{variants.map(item => <Link key={item.id} to={`/products/${item.id}`} state={{productSelection:true}} aria-current={item.id === product.id ? 'true' : undefined}>{phones ? <><strong>{item.variant.split(' · ')[0]}</strong><small>{item.id === 'iphone-purple' ? 'Pro Max' : 'Pro'} · {item.variant.split(' · ')[1]}</small></> : <><strong>{item.category === 'computers' ? item.id.replace('rtx-', 'RTX ') : item.variant.split(' · ')[0]}</strong><small>{item.category === 'computers' ? item.variant.split(' · ')[1] : 'White'}</small></>}</Link>)}</div></fieldset>
  </div>
}
