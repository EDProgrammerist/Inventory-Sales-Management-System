import { useState } from 'react'
import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@phosphor-icons/react'
import type { CatalogProduct } from '@/data/storefront-catalog'

export default function ProductGallery({ product }: { product: CatalogProduct }) {
  const [zoom, setZoom] = useState(false)
  const [selected,setSelected]=useState(0)
  const views=product.gallery??[{image:product.image,label:'Overview'},{image:product.image,label:'Detail'}]
  const current=views[selected]??views[0]
  return <div className={`product-gallery ${product.category === 'computers' ? 'product-gallery-gpu' : ''}`} data-reveal>
    <div className="product-thumbnails" role="group" aria-label="Product image views">
      {views.map((view,index)=><button key={view.label} aria-pressed={selected===index} aria-label={`Show ${view.label.toLowerCase()} image`} onClick={()=>{setSelected(index);setZoom(!product.gallery&&index===1)}}><img className={!product.gallery&&index===1?'is-close':''} src={view.image} alt="" width="72" height="88"/><span>{view.label}</span></button>)}
    </div>
    <button className={`product-main-image ${zoom ? 'is-zoomed' : ''}`} onClick={() => setZoom(!zoom)} aria-label={zoom ? 'Zoom out product image' : 'Zoom in product image'} aria-pressed={zoom}>
      <img src={current.image} alt={`${product.name}, ${product.variant} — ${current.label.toLowerCase()}`} width="480" height="550" fetchPriority="high" />
      <span className="product-zoom-icon">{zoom ? <MagnifyingGlassMinusIcon size={22} /> : <MagnifyingGlassPlusIcon size={22} />}</span>
    </button>
  </div>
}
