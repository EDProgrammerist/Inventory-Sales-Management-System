import {useState} from 'react'
import {Link,useNavigate,useParams} from 'react-router'
import CommerceLayout from '@/components/common/commerce-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import CatalogProductForm from '@/components/features/inventory/catalog-product-form'
import {useCommerce} from '@/components/context/commerce-context'
import {electronicsCategories,type AdminCatalogProduct} from '@/data/admin-catalog'
import {formatMoney} from '@/data/currency'

export default function AdminProductsPage() {
  const {products,saveProduct,refresh}=useCommerce(),{productId}=useParams(),navigate=useNavigate()
  const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),[notice,setNotice]=useState('')
  const [editing,setEditing]=useState<AdminCatalogProduct|null|undefined>(()=>productId?products.find(product=>product.id===productId):undefined)
  const rows=products.filter(product=>(category==='all'||category===product.category)&&`${product.name} ${product.variant} ${product.id}`.toLowerCase().includes(query.trim().toLowerCase()))
  function close(){setEditing(undefined);if(productId)navigate('/inventory',{replace:true})}
  return <CommerceLayout title="Products" query={query} onQueryChange={setQuery}>
    <div className="commerce-toolbar"><p>{rows.length} of {products.length} catalog products · Changes are shared with the store.</p><div className="flex flex-wrap gap-3"><button className="inventory-button" onClick={refresh}>Refresh products</button><button className="inventory-button commerce-primary" onClick={()=>setEditing(null)}>Add product</button></div></div>
    {notice&&<p role="status" className="commerce-note mb-4">{notice}</p>}
    {productId&&!products.some(product=>product.id===productId)&&<p role="alert" className="commerce-error mb-4">Product not found. <Link className="dashboard-link" to="/inventory">Open products</Link></p>}
    <section className="commerce-sheet" aria-label="Store catalog">
      <div className="commerce-toolbar"><h2 className="dashboard-heading">Store catalog</h2><label className="text-sm text-muted">Category <select className="ml-2 min-h-11 rounded border border-control bg-surface px-3 text-ink" value={category} onChange={event=>setCategory(event.target.value)}><option value="all">All categories</option>{electronicsCategories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
      <table className="commerce-table"><thead><tr><th>Product</th><th className="num">Price (PHP)</th><th className="num">Stock</th><th>Visibility</th><th>Action</th></tr></thead><tbody>{rows.map(product=><tr key={product.id}><td><div className="commerce-object"><img src={product.image} alt="" width="44" height="48"/><div><strong>{product.name}</strong><small>{product.variant} · {product.id}</small></div></div></td><td className="num" data-label="Price">{formatMoney(product.price)}</td><td className="num" data-label="Stock">{product.stockQuantity===null?'Not set':product.stockQuantity.toLocaleString('en-PH')}</td><td data-label="Store">{product.published?'Published':'Hidden'}</td><td><button className="dashboard-link" aria-label={`Edit ${product.name}, ${product.variant}`} onClick={()=>setEditing(product)}>Edit product</button></td></tr>)}</tbody></table>
      {rows.length===0&&<p className="commerce-note py-6">{products.length?'No products match. Change the search or category.':'Add your first iPhone, graphics card or PS5 product to publish it in the store.'}</p>}
    </section>
    {editing!==undefined&&<DashboardDialog title={editing?'Edit product':'Add product'} onClose={close}><CatalogProductForm product={editing??undefined} onCancel={close} onSave={async input=>{await saveProduct(input,Boolean(editing));setNotice(`${input.name} was saved to the store catalog.`);close()}}/></DashboardDialog>}
  </CommerceLayout>
}
