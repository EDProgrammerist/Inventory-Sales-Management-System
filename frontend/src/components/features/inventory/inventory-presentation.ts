import type { WorkspaceAction } from '@/components/common/workspace-layout'

export type InventoryPanel = 'add' | 'filters' | WorkspaceAction
export const inventoryPanelTitles: Record<InventoryPanel, string> = {
  add: 'Add Product',
  filters: 'Filter products',
  inventory: 'Inventory',
  reports: 'Inventory report',
  suppliers: 'Suppliers',
  orders: 'Orders',
  store: 'Manage Store',
  settings: 'Inventory preferences',
  notifications: 'Stock alerts',
  profile: 'Your workspace',
}

export const availabilityStyles = {
  'in-stock': 'text-[#1aaf78]',
  'out-of-stock': 'text-[#e85050]',
  'low-stock': 'text-[#dc9b38]',
}
