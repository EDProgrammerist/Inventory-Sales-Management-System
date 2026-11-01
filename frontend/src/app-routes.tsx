import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import HomePage from '@/pages/home'
import LandingPage from '@/pages/landing'
import ProductsPage from '@/pages/products'
import StoreProductPage from '@/pages/store-product'
import CartPage from '@/pages/cart'
import LoadingSpinner from '@/components/ui/loading-spinner'
import CustomerRoute from '@/components/context/customer-route'
import StorefrontLayout from '@/components/common/storefront-layout'
import SignupPage from '@/pages/signup'
import ProtectedRoute from '@/components/context/protected-route'
import WorkspaceLoading from '@/components/common/workspace-loading'
import CommerceProvider from '@/components/context/commerce-provider'

const DashboardPage = lazy(() => import('@/pages/admin-dashboard'))
const InventoryPage = lazy(() => import('@/pages/admin-products'))
const ProductInfoPage = InventoryPage
const ReportsPage = lazy(() => import('@/pages/admin-reports'))
const SuppliersPage = lazy(() => import('@/pages/suppliers'))
const OrdersPage = lazy(() => import('@/pages/admin-orders'))
const ManageStorePage = lazy(() => import('@/pages/manage-store'))
const AddressPage = lazy(() => import('@/pages/address'))
const ShippingPage = lazy(() => import('@/pages/shipping'))
const PaymentPage = lazy(() => import('@/pages/payment'))
const CustomerOrdersPage=lazy(()=>import('@/pages/customer-orders'))

function workspacePage(page: ReactNode) {
  return <Suspense fallback={<WorkspaceLoading />}><CommerceProvider>{page}</CommerceProvider></Suspense>
}

function checkoutPage(page: ReactNode) {
  return <Suspense fallback={<div className="flex min-h-[60dvh] items-center justify-center gap-3" role="status"><LoadingSpinner />Loading checkout…</div>}>{page}</Suspense>
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<StoreProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/address" element={checkoutPage(<AddressPage />)} />
        <Route path="/checkout/shipping" element={checkoutPage(<ShippingPage />)} />
        <Route path="/checkout/payment" element={checkoutPage(<PaymentPage />)} />
        <Route element={<CustomerRoute/>}><Route path="/account/orders" element={checkoutPage(<CustomerOrdersPage/>)} /></Route>
      </Route>
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
