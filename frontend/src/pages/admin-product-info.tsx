import {useId,useState,type ReactNode} from 'react'
import {Link,useParams} from 'react-router'
import {ArrowLeftIcon,PackageIcon,PencilSimpleIcon,DownloadSimpleIcon} from '@phosphor-icons/react'
import CommerceLayout from '@/components/common/commerce-layout'
import {useCommerce} from '@/components/context/commerce-context'
import {useWorkspace} from '@/components/context/workspace-context'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import ProductTabs,{type ProductTab} from '@/components/features/inventory/product-tabs'
import CatalogProductForm from '@/components/features/inventory/catalog-product-form'
import {electronicsCategories,type AdminCatalogProduct} from '@/data/admin-catalog'
import {statusLabels} from '@/data/customer-orders'
import {formatMoney} from '@/data/currency'
import {toCsv} from '@/data/csv'
import {downloadCsv} from '@/lib/download'

function Fields({rows}:{rows:[string,string][]}){
 return <dl className="catalog-info-fields">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
}
function EmptyRecords({title,children}:{title:string;children:ReactNode}){
 return <div className="grid min-h-64 place-content-center justify-items-center gap-3 px-5 py-8 text-center"><PackageIcon size={32} aria-hidden="true" className="text-muted"/><h3 className="font-medium">{title}</h3><div className="max-w-lg text-sm leading-7 text-muted">{children}</div></div>
}
function ProductSearchResults({query,onSelect}:{query:string;onSelect:()=>void}){
 const {products}=useCommerce()
 if(!query.trim())return null
 const matches=products.filter(item=>`${item.name} ${item.variant} ${item.id}`.toLowerCase().includes(query.trim().toLowerCase()))
 return <section className="commerce-sheet mb-5" aria-label="Product search results"><p role="status" className="commerce-note mb-3">{matches.length} matching products</p>{matches.length?<ul className="grid gap-3">{matches.map(item=><li key={item.id}><Link className="dashboard-link" to={`/inventory/${item.id}`} onClick={onSelect}>{item.name} · {item.variant}</Link></li>)}</ul>:<p className="commerce-note">No products match. Try another name, configuration or product ID.</p>}</section>
}

export default function AdminProductInfoPage(){
 const {productId}=useParams(),{products}=useCommerce()
 const [query,setQuery]=useState('')
 const product=products.find(item=>item.id===productId)
 if(!product)return <CommerceLayout title="Product Info" query={query} onQueryChange={setQuery}><ProductSearchResults query={query} onSelect={()=>setQuery('')}/><section className="commerce-sheet"><EmptyRecords title="Product not found"><p>This product is not in your catalog.</p><Link className="dashboard-link" to="/inventory">Back to inventory</Link></EmptyRecords></section></CommerceLayout>
 return <ProductDetail key={product.id} product={product} query={query} onQueryChange={setQuery}/>
}

function ProductDetail({product,query,onQueryChange}:{product:AdminCatalogProduct;query:string;onQueryChange:(value:string)=>void}){
 const {orders,saveProduct}=useCommerce(),{suppliers}=useWorkspace()
 const [tab,setTab]=useState<ProductTab>('overview'),[editing,setEditing]=useState(false),[notice,setNotice]=useState('')
 const prefix=useId()
 const purchases=orders.flatMap(order=>order.items.filter(item=>item.productId===product.id).map(item=>({order,item}))).sort((a,b)=>Date.parse(b.order.createdAt)-Date.parse(a.order.createdAt))
 const linkedSuppliers=suppliers.filter(supplier=>supplier.product===`${product.name} · ${product.variant}`||supplier.product===product.name)
 const category=electronicsCategories.find(item=>item.id===product.category)?.name??product.category
 const primary:[string,string][]=[['Product name',product.name],['Product ID',product.id],['Configuration',product.variant],['Product category',category],['Selling price',formatMoney(product.price)],['Threshold Value',String(product.threshold)],['Visibility',product.published?'Published':'Hidden'],['Featured',product.featured?'Yes':'No']]
 const activeUnits=purchases.filter(({order})=>!['cancelled','delivered'].includes(order.status)).reduce((sum,{item})=>sum+item.quantity,0)
 const summary:[string,string][]=[['Opening Stock','Not recorded'],['Remaining Stock',product.stockQuantity===null?'Not set':`${product.stockQuantity} units`],['Units on active orders',String(activeUnits)],['Threshold value',String(product.threshold)]]
 function download(){downloadCsv(toCsv([['Field','Value'],...primary,['Description',product.description],...summary]),`shenban-product-${product.id}.csv`);setNotice('Product details downloaded.')}
 function panel(value:ProductTab,children:ReactNode){return <section key={value} role="tabpanel" id={`${prefix}-${value}-panel`} aria-labelledby={`${prefix}-${value}-tab`} hidden={tab!==value} tabIndex={0} className="outline-none focus-visible:ring-2 focus-visible:ring-brand">{children}</section>}
 return <CommerceLayout title={product.name} query={query} onQueryChange={onQueryChange}>
  <Link className="dashboard-link mb-5 inline-flex min-h-10 items-center gap-2" to="/inventory"><ArrowLeftIcon size={18}/>Back to inventory</Link>
  <ProductSearchResults query={query} onSelect={()=>onQueryChange('')}/>
  {notice&&<p role="status" className="commerce-note mb-4">{notice}</p>}
  <article className="commerce-sheet" aria-label="Product information"><header className="flex flex-wrap items-center justify-between gap-4"><h2 className="dashboard-heading">{product.name}</h2><div className="flex flex-wrap gap-3"><button className="inventory-button" onClick={()=>setEditing(true)}><PencilSimpleIcon size={19}/>Edit</button><button className="inventory-button" onClick={download}><DownloadSimpleIcon size={19}/>Download</button></div></header>
   <ProductTabs active={tab} onChange={setTab} prefix={prefix}/>
   {panel('overview',<div className="catalog-info-grid"><div className="min-w-0"><h3 className="text-base font-semibold">Primary Details</h3><Fields rows={primary}/><p className="mt-7 whitespace-pre-line text-sm leading-7 text-muted">{product.description}</p><h3 className="mt-10 text-base font-semibold">Supplier Details</h3>{linkedSuppliers.length?linkedSuppliers.map(supplier=><Fields key={supplier.id} rows={[["Supplier name",supplier.name],["Contact Number",supplier.phone],["Email",supplier.email]]}/>):<p className="commerce-note mt-5">No supplier is recorded for this product. <Link className="dashboard-link" to="/suppliers">Manage suppliers</Link></p>}<h3 className="mt-10 text-base font-semibold">Stock Locations</h3><p className="commerce-note mt-5">No per-store stock allocation is recorded for this catalog item. <Link className="dashboard-link" to="/manage-store">Manage store branches</Link></p></div><aside aria-label="Product image and stock summary"><div className="mx-auto grid size-44 place-items-center border border-dashed border-control p-3"><img src={product.image} alt={`${product.name}, ${product.variant}`} className="max-h-[150px] w-full object-contain" width="150" height="150"/></div><div className="mt-10"><Fields rows={summary}/></div><p className="commerce-note mt-7">Stock not set means unknown availability. Electronics do not require an expiry date.</p></aside></div>)}
   {panel('purchases',<div className="pt-7"><h3 className="text-base font-semibold">Customer Purchases</h3><p className="commerce-note mt-3 mb-5">Saved storefront purchases of this product, including their current fulfillment status. Payments are simulated.</p>{purchases.length?<table className="commerce-table"><thead><tr><th>Order</th><th>Date placed</th><th>Quantity</th><th>Status</th><th className="num">Demo total</th></tr></thead><tbody>{purchases.map(({order,item})=><tr key={order.id}><td><Link className="dashboard-link" to={`/orders?order=${order.id}`}>{order.id.slice(0,8)}</Link></td><td data-label="Date">{new Date(order.createdAt).toLocaleDateString('en-PH')}</td><td data-label="Quantity">{item.quantity}</td><td data-label="Status">{statusLabels[order.status]}</td><td className="num" data-label="Total">{formatMoney(item.total)}</td></tr>)}</tbody></table>:<EmptyRecords title="No purchases yet">Saved customer orders containing this product will appear here.</EmptyRecords>}</div>)}
   {panel('adjustments',<EmptyRecords title="No separate adjustment log"><p>Current stock changes are saved through the product editor. Individual adjustment entries are not recorded by this catalog.</p><button className="dashboard-link mt-4" onClick={()=>setEditing(true)}>Edit current stock</button></EmptyRecords>)}
   {panel('history',<div className="pt-7"><h3 className="text-base font-semibold">Product History</h3><p className="commerce-note mt-3">Current catalog revision: {product.version}. Individual edit timestamps are not recorded.</p>{purchases.length?<ul className="mt-5 divide-y divide-divider">{purchases.map(({order,item})=><li key={order.id} className="py-5 text-sm leading-7"><p><Link className="dashboard-link" to={`/orders?order=${order.id}`}>Order {order.id.slice(0,8)}</Link> placed for {item.quantity} units</p><p className="text-muted"><time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString('en-PH')}</time> · Current status: {statusLabels[order.status]}</p></li>)}</ul>:<EmptyRecords title="No recorded order activity">Order placement records will appear here when customers purchase this product.</EmptyRecords>}</div>)}
  </article>
  {editing&&<DashboardDialog title="Edit product" onClose={()=>setEditing(false)}><CatalogProductForm product={product} onCancel={()=>setEditing(false)} onSave={async input=>{await saveProduct(input,true);setEditing(false);setNotice('Product changes saved.')}}/></DashboardDialog>}
 </CommerceLayout>
}
