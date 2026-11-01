import {useState,type ReactNode} from 'react'
import {Link,useNavigate} from 'react-router'
import WorkspaceLayout,{type WorkspaceAction} from './workspace-layout'
import DashboardDialog from '@/components/ui/dashboard-dialog'
import WorkspaceProfile from './workspace-profile'
import {useCommerce} from '@/components/context/commerce-context'
import '@/styles/commerce.css'

export default function CommerceLayout({title,query,onQueryChange,children}:{title:string;query:string;onQueryChange:(query:string)=>void;children:ReactNode}) {
  const navigate=useNavigate(),{products}=useCommerce()
  const [panel,setPanel]=useState<WorkspaceAction|null>(null)
  const low=products.filter(product=>product.stockQuantity!==null&&product.stockQuantity<=product.threshold)
  function action(value:WorkspaceAction){const routes:Partial<Record<WorkspaceAction,string>>={inventory:'/inventory',reports:'/reports',suppliers:'/suppliers',orders:'/orders',store:'/manage-store'};const route=routes[value];if(route)navigate(route);else setPanel(value)}
  return <WorkspaceLayout title={title} query={query} onQueryChange={onQueryChange} onAction={action} notificationCount={low.length}>
    <div className="commerce-workspace">{children}</div>
    {panel&&<DashboardDialog title={panel==='profile'?'Administrator account':panel==='notifications'?'Stock alerts':'Store administration'} onClose={()=>setPanel(null)}>{panel==='profile'?<WorkspaceProfile/>:panel==='notifications'?<><p className="mb-4 text-sm text-muted">{low.length} products are at or below their stock threshold. Unknown stock is excluded.</p>{low.map(product=><p className="mb-3 text-sm" key={product.id}><Link className="dashboard-link" to={`/inventory/${product.id}`}>{product.name} · {product.variant}</Link> — {product.stockQuantity} units</p>)}</>:<p className="text-sm leading-7">Changes are saved to the store database. <Link className="dashboard-link" to="/">Open storefront</Link> to review published products.</p>}</DashboardDialog>}
  </WorkspaceLayout>
}
