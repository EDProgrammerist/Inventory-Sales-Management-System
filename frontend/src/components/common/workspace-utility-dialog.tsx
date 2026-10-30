import DashboardDialog from '@/components/ui/dashboard-dialog'
import InventoryPanelContent from '@/components/features/inventory/inventory-panels'
import { inventoryPanelTitles } from '@/components/features/inventory/inventory-presentation'
import { useInventory } from '@/components/context/inventory-context'
import type { WorkspaceAction } from './workspace-layout'

export default function WorkspaceUtilityDialog({
  panel,
  onClose,
  compact,
  onCompactChange,
}: {
  panel: WorkspaceAction
  onClose: () => void
  compact: boolean
  onCompactChange: (value: boolean) => void
}) {
  const { products, addProduct } = useInventory()
  return (
    <DashboardDialog title={inventoryPanelTitles[panel]} onClose={onClose}>
      <InventoryPanelContent
        panel={panel}
        products={products}
        availability="all"
        compact={compact}
        onCompactChange={onCompactChange}
        onAdd={(product) => {
          addProduct(product)
          onClose()
        }}
        onClose={onClose}
        onFilter={onClose}
        onDownload={onClose}
      />
    </DashboardDialog>
  )
}
