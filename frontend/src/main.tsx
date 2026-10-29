import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import HomePage from '@/pages/home'
import SignupPage from '@/pages/signup'
import DashboardPage from '@/pages/dashboard'
import InventoryPage from '@/pages/inventory'
import ProductInfoPage from '@/pages/product-info'
import ReportsPage from '@/pages/reports'
import SuppliersPage from '@/pages/suppliers'
import OrdersPage from '@/pages/orders'
import ManageStorePage from '@/pages/manage-store'
import InventoryProvider from '@/components/features/inventory/inventory-provider'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:productId" element={<ProductInfoPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/manage-store" element={<ManageStorePage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </InventoryProvider>
    </BrowserRouter>
  </StrictMode>,
)
