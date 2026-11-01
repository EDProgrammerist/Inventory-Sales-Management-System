import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import AppRoutes from '@/app-routes'
import AuthProvider from '@/components/context/auth-context'
import WorkspaceProvider from '@/components/context/workspace-provider'
import StorefrontProvider from '@/components/context/storefront-provider'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StorefrontProvider><WorkspaceProvider>
          <AppRoutes />
        </WorkspaceProvider></StorefrontProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
