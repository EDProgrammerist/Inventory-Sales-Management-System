import { useEffect, useRef } from 'react'
import DashboardSidebar, { type DashboardAction } from '@/components/features/dashboard/dashboard-sidebar'

export default function MobileMenu({ open, onClose, onAction }: {
  open: boolean
  onClose: () => void
  onAction: (action: DashboardAction) => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return

    dialog.showModal()
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.close()
    }
    desktop.addEventListener('change', closeOnDesktop)
    closeOnDesktop()

    return () => {
      desktop.removeEventListener('change', closeOnDesktop)
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      id="workspace-mobile-menu"
      aria-label="Workspace menu"
      className="mobile-menu"
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          onClose()
        }
      }}
    >
      <DashboardSidebar onAction={onAction} onClose={onClose} />
    </dialog>
  )
}
