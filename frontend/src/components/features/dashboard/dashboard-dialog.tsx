import { useEffect, useRef, type ReactNode } from 'react'
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
      aria-labelledby="dashboard-dialog-heading"
      className={`m-auto w-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 text-[#485163] shadow-xl backdrop:bg-slate-950/25 ${variant === 'product' ? 'max-h-[92dvh] max-w-[510px]' : 'max-h-[85dvh] max-w-2xl'}`}
    >
      <header
        className={`flex items-center justify-between gap-4 px-6 py-5 ${variant === 'product' ? 'pb-2' : 'border-b border-slate-100'}`}
      >
        <h2 id="dashboard-dialog-heading" className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <XIcon size={20} />
        </button>
      </header>
      <div className="p-6">{children}</div>
    </dialog>
  )
}
