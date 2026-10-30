import { useEffect, useId, useRef, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'

export default function DashboardDialog({
  title,
  onClose,
  children,
  variant = 'default',
}: {
  title: string
  onClose: () => void
  children: ReactNode
  variant?: 'default' | 'product'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={ref}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
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
        <h2 id={headingId} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
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
