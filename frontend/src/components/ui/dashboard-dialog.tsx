import { useEffect, useId, useRef, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'

export default function DashboardDialog({
  title,
  onClose,
  children,
  variant = 'default',
  busy = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  variant?: 'default' | 'product'
  busy?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(() => {
    const dialog = ref.current
    const trigger=document.activeElement instanceof HTMLElement?document.activeElement:null
    dialog?.showModal()
    dialog?.querySelector<HTMLElement>('[data-dialog-autofocus]')?.focus()
    return () => {dialog?.close();if(trigger?.isConnected)trigger.focus()}
  }, [])

  return (
    <dialog
      ref={ref}
      onCancel={(event)=>{if(busy)event.preventDefault()}}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose()
      }}
      onClick={(event) => {
        if (!busy && event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onClose()
        }
      }}
      aria-labelledby={headingId}
      className={`workspace-dialog m-auto w-[calc(100%-2rem)] overflow-y-auto overscroll-contain rounded-xl border-0 bg-surface p-0 text-ink shadow-xl backdrop:bg-slate-950/25 ${variant === 'product' ? 'max-h-[92dvh] max-w-[510px]' : 'max-h-[85dvh] max-w-2xl'}`}
    >
      <header
        className={`sticky top-0 z-10 flex items-center justify-between gap-4 bg-surface px-4 py-3 sm:px-6 ${variant === 'product' ? 'pb-2' : 'border-b border-divider'}`}
      >
        <h2 id={headingId} className="min-w-0 break-words text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          aria-label="Close dialog"
          className="workspace-icon-button"
        >
          <XIcon size={20} />
        </button>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </dialog>
  )
}
