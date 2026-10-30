// Isolated component regression fixture; never imported by the application entry point.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { AuthContext, type AuthState } from '../../src/components/context/auth-state'
import WorkspaceProvider from '../../src/components/context/workspace-provider'
import AppRoutes from '../../src/app-routes'
import '../../src/styles/global.css'

export default function Fixture() {
  const [account, setAccount] = useState('first')
  const state: AuthState = {
    user: { id: account, name: 'Regression account', email: `${account}@example.test`, role: 'USER' },
    loading: false, error: '', retry: () => {}, login: async () => {}, signup: async () => {},
    logout: async () => { setAccount('second') },
  }
  return (
    <MemoryRouter initialEntries={['/suppliers']}>
      <AuthContext value={state}>
        <button id="switch-account" onClick={() => setAccount('second')}>Switch test account</button>
        <WorkspaceProvider><AppRoutes /></WorkspaceProvider>
      </AuthContext>
    </MemoryRouter>
  )
}

createRoot(document.getElementById('root')!).render(<Fixture />)
