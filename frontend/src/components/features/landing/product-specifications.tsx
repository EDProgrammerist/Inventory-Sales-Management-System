import { useState } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import type { CatalogProduct } from '@/data/storefront-catalog'
import type { ProductDetails } from '@/data/storefront-details'

export default function ProductSpecifications({ product, details }: { product: CatalogProduct; details: ProductDetails }) {
  const [expanded, setExpanded] = useState(false)
  return <section className="product-spec-section" aria-labelledby="detail-heading">
    <div className="shop-container"><div className="product-spec-panel" data-reveal>
      <h2 id="detail-heading">Details</h2><p className="product-detail-description">{product.description}</p>
      <div id="product-specifications">{details.groups.slice(0, 2).map(group => <SpecGroup key={group.title} group={group} />)}
        <div id="product-extra-specs" hidden={!expanded}>{details.groups.slice(2).map(group => <SpecGroup key={group.title} group={group} />)}{details.note && <p className="product-spec-note">{details.note}</p>}</div>
      </div>
      <button className="shop-button product-more" aria-expanded={expanded} aria-controls="product-extra-specs" onClick={() => setExpanded(!expanded)}>{expanded ? 'View less' : 'View more'}<CaretDownIcon size={18} className={expanded ? 'is-expanded' : ''} /></button>
      {details.source&&<a className="product-source" href={details.source} target="_blank" rel="noreferrer">{details.sourceName} <span className="sr-only">(opens in a new tab)</span></a>}
    </div></div>
  </section>
}

function SpecGroup({ group }: { group: ProductDetails['groups'][number] }) {
  return <section className="product-spec-group"><h3>{group.title}</h3><dl>{group.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
}
