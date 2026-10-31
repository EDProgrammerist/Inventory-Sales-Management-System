// Isolated component regression fixture; never imported by the application entry point.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { AuthContext, type AuthState } from '../../src/components/context/auth-state'
import WorkspaceProvider from '../../src/components/context/workspace-provider'
import AppRoutes from '../../src/app-routes'
import '../../src/styles/global.css'

// Browser-only fake API, scoped to this fixture. No real accounts or database
// records are created; localStorage lets a full fixture reload emulate a server.
const nativeFetch = window.fetch.bind(window)
window.fetch = async (input, init) => {
  const url = String(input)
  if (url.endsWith('/auth/v1/csrf-token')) return Response.json({ data: { csrfToken: 'fixture-csrf' } })
  if (!url.includes('/workspace/v1')) return nativeFetch(input, init)
  await new Promise((resolve) => setTimeout(resolve, 80))
  const owner = sessionStorage.getItem('fixture-account') ?? 'first'
  const key = `workspace-fixture-${owner}`
  const data = JSON.parse(localStorage.getItem(key) ?? '{"products":[],"events":[],"suppliers":[],"orders":[],"stores":[]}')
  if (!init?.method || init.method === 'GET') return Response.json({ data })
  if (sessionStorage.getItem('fixture-fail-next')) {
    sessionStorage.removeItem('fixture-fail-next')
    return Response.json({ message: 'Isolated save failure. Please retry.' }, { status: 503 })
  }
  const kind = url.split('/workspace/v1/')[1].split('/')[0]
  const record = JSON.parse(String(init.body))
  if (init.method === 'PUT') data[kind] = data[kind].map((row: { id: string }) => row.id === record.id ? record : row)
  else data[kind].push(record)
  if (kind === 'products') data.events.push({ id: crypto.randomUUID(), productId: record.id, kind: init.method === 'PUT' ? 'updated' : 'created', at: new Date().toISOString() })
  localStorage.setItem(key, JSON.stringify(data))
  return Response.json({ data: { record, events: data.events.filter((event: { productId: string }) => event.productId === record.id) } })
}

export default function Fixture() {
  const [account, setAccount] = useState(() => sessionStorage.getItem('fixture-account') ?? 'first')
  function switchAccount() { sessionStorage.setItem('fixture-account', 'second'); setAccount('second') }
  const state: AuthState = {
    user: { id: account, name: 'Regression account', email: `${account}@example.test`, role: 'USER' },
    loading: false, error: '', retry: () => {}, login: async () => {}, signup: async () => {},
    logout: async () => { switchAccount() },
  }
  return (
    <MemoryRouter initialEntries={['/suppliers']}>
      <AuthContext value={state}>
        <button id="switch-account" onClick={switchAccount}>Switch test account</button>
        <WorkspaceProvider><AppRoutes /></WorkspaceProvider>
      </AuthContext>
    </MemoryRouter>
  )
}

createRoot(document.getElementById('root')!).render(<Fixture />)
