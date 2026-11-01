import {renderToString} from 'react-dom/server'
import {MemoryRouter,Route,Routes} from 'react-router'
import {AuthContext,type AuthState} from '../src/components/context/auth-state'
import ProtectedRoute from '../src/components/context/protected-route'
import {WorkspaceContext} from '../src/components/context/workspace-context'
import SupplierForm from '../src/components/features/suppliers/supplier-form'
import CatalogProductForm from '../src/components/features/inventory/catalog-product-form'

export function renderAuthGuard(state: Pick<AuthState, 'user' | 'loading' | 'error'>) {
  const value: AuthState = { ...state, retry: () => {}, login: async () => { throw new Error('SSR cannot sign in') }, signup: async () => { throw new Error('SSR cannot sign up') }, logout: async () => {} }
  return renderToString(
    <MemoryRouter initialEntries={['/inventory']}>
      <AuthContext value={value}>
        <WorkspaceContext value={{ orders: [], suppliers: [], stores: [], loading: false, error: '', retry: () => {}, saveOrder: async () => {}, saveSupplier: async () => {}, saveStore: async () => {} }}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/inventory" element={<p>Private workspace content</p>} />
          </Route>
        </Routes>
        </WorkspaceContext>
      </AuthContext>
    </MemoryRouter>,
  )
}


const reject=async()=>{throw new Error('Static rendering cannot save records')}
export function renderSupplierForm(){return renderToString(<SupplierForm catalog={[]} suppliers={[]} onAdd={reject} onDiscard={()=>{}}/>)}
export function renderProductForm(){return renderToString(<CatalogProductForm onSave={reject} onCancel={()=>{}}/>)}
