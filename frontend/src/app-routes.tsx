import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from '@/pages/home'
import LandingPage from '@/pages/landing'
import SignupPage from '@/pages/signup'
import ProtectedRoute from '@/components/context/protected-route'
import WorkspaceLoading from '@/components/common/workspace-loading'

const DashboardPage = lazy(() => import('@/pages/dashboard'))
const InventoryPage = lazy(() => import('@/pages/inventory'))
const ProductInfoPage = lazy(() => import('@/pages/product-info'))
const ReportsPage = lazy(() => import('@/pages/reports'))
const SuppliersPage = lazy(() => import('@/pages/suppliers'))
const OrdersPage = lazy(() => import('@/pages/orders'))
const ManageStorePage = lazy(() => import('@/pages/manage-store'))

function workspacePage(page: ReactNode) {
  return <Suspense fallback={<WorkspaceLoading />}>{page}</Suspense>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={workspacePage(<DashboardPage />)} />
        <Route path="/inventory" element={workspacePage(<InventoryPage />)} />
        <Route path="/inventory/:productId" element={workspacePage(<ProductInfoPage />)} />
        <Route path="/reports" element={workspacePage(<ReportsPage />)} />
        <Route path="/suppliers" element={workspacePage(<SuppliersPage />)} />
        <Route path="/orders" element={workspacePage(<OrdersPage />)} />
        <Route path="/manage-store" element={workspacePage(<ManageStorePage />)} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
