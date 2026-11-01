import {renderToString} from 'react-dom/server'
import {MemoryRouter,Route,Routes} from 'react-router'
import {CommerceContext} from '../src/components/context/commerce-context'
import {WorkspaceContext} from '../src/components/context/workspace-context'
import StorefrontFixture from './storefront-fixture'
import {decodeAdminCatalog} from '../src/data/admin-catalog'
import rows from '../../backend/data/storefront-products.json'
import AdminProductInfoPage from '../src/pages/admin-product-info'
import AdminDashboardPage from '../src/pages/admin-dashboard'
import AdminProductsPage from '../src/pages/admin-products'
import AdminOrdersPage from '../src/pages/admin-orders'
import AdminReportsPage from '../src/pages/admin-reports'
import SuppliersPage from '../src/pages/suppliers'
import ManageStorePage from '../src/pages/manage-store'

const products=decodeAdminCatalog({products:rows.map(row=>({...row,published:true,stockQuantity:null,threshold:0,version:0}))})
const reject=async()=>{throw new Error('Static rendering cannot save or change records')}
export function renderCommerceRoute(path:string,empty=false,lowStock=false){
 return renderToString(<MemoryRouter initialEntries={[path]}><StorefrontFixture><WorkspaceContext value={{orders:[],suppliers:[],stores:[],loading:false,error:'',retry:()=>{},saveOrder:reject,saveSupplier:reject,saveStore:reject}}><CommerceContext value={{products:empty?[]:lowStock?products.map((product,index)=>index===0?{...product,stockQuantity:0,threshold:1}:product):products,orders:[],saveProduct:reject,advanceOrder:reject,cancelOrder:reject,refresh:()=>{}}}><Routes><Route path="/dashboard" element={<AdminDashboardPage/>}/><Route path="/inventory" element={<AdminProductsPage/>}/><Route path="/inventory/:productId" element={<AdminProductInfoPage/>}/><Route path="/orders" element={<AdminOrdersPage/>}/><Route path="/reports" element={<AdminReportsPage/>}/><Route path="/suppliers" element={<SuppliersPage/>}/><Route path="/manage-store" element={<ManageStorePage/>}/></Routes></CommerceContext></WorkspaceContext></StorefrontFixture></MemoryRouter>)
}
