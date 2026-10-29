import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import InventoryProvider from '../src/components/features/inventory/inventory-provider'
import InventoryPage from '../src/pages/inventory'
import ProductInfoPage from '../src/pages/product-info'
import ProductForm from '../src/components/features/inventory/product-form'
import { inventoryProducts } from '../src/data/inventory-demo'
import { createInventoryState } from '../src/data/inventory-state'
import ReportsPage from '../src/pages/reports'
import ProfitRevenueChart from '../src/components/features/reports/profit-revenue-chart'
import type { ReportPeriod } from '../src/data/reports-demo'
import SuppliersPage from '../src/pages/suppliers'
import SupplierForm from '../src/components/features/suppliers/supplier-form'
import { supplierFixtures } from '../src/data/suppliers-demo'
import OrdersPage from '../src/pages/orders'
import ManageStorePage from '../src/pages/manage-store'
import OrderForm from '../src/components/features/orders/order-form'

export function renderOrderForm() {
  return renderToString(<OrderForm onAdd={() => { throw new Error('Static rendering must not submit an order') }} onDiscard={() => { throw new Error('Static rendering must not discard an order') }} />)
}

export function renderInventoryRoute(path: string) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <InventoryProvider>
        <Routes>
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:productId" element={<ProductInfoPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/manage-store" element={<ManageStorePage />} />
        </Routes>
      </InventoryProvider>
    </MemoryRouter>,
  )
}

export function renderSupplierForm() {
  return renderToString(
    <SupplierForm
      suppliers={supplierFixtures}
      onAdd={() => {
        throw new Error('Static rendering must not submit the supplier form')
      }}
      onDiscard={() => {
        throw new Error('Static rendering must not discard the supplier form')
      }}
    />,
  )
}

export function renderReportChart(period: ReportPeriod) {
  return renderToString(
    <ProfitRevenueChart
      period={period}
      onPeriodChange={() => {
        throw new Error('Static rendering must not change chart controls')
      }}
    />,
  )
}

export function renderProductForm() {
  return renderToString(
    <ProductForm
      products={createInventoryState(inventoryProducts).products}
      onAdd={() => {
        throw new Error('Static rendering must not submit the form')
      }}
      onCancel={() => {
        throw new Error('Static rendering must not cancel the form')
      }}
    />,
  )
}
