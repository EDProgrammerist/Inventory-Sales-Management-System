import { useState, type ReactNode } from 'react'
import { BellIcon, MagnifyingGlassIcon, ListIcon, XIcon } from '@phosphor-icons/react'
import DashboardSidebar, {
  type DashboardAction,
} from '@/components/features/dashboard/dashboard-sidebar'
import DashboardDialog from '@/components/features/dashboard/dashboard-dialog'

export type WorkspaceAction = DashboardAction | 'notifications' | 'profile'

export default function WorkspaceLayout({
  title,
  query,
  onQueryChange,
  onAction,
  notificationCount = 3,
  searchPlaceholder = 'Search products',
  searchLabel,
  children,
}: {
  title: string
  query: string
  onQueryChange: (value: string) => void
  onAction: (value: WorkspaceAction) => void
  notificationCount?: number
  searchPlaceholder?: string
  searchLabel?: string
  children: ReactNode
}) {
  const [mobileNavigation, setMobileNavigation] = useState(false)
  function handleAction(action: WorkspaceAction) {
    setMobileNavigation(false)
    onAction(action)
  }

  return (
    <div className="min-h-[100dvh] min-w-0 bg-[#f0f1f3] text-[#5d687e]">
      <title>{`${title} · Kanban`}</title>
      <a
        href="#workspace-content"
        className="sr-only fixed top-3 left-3 z-30 rounded bg-white p-3 text-blue-600 shadow focus:not-sr-only"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] overflow-y-auto border-r border-[#eef0f3] lg:block xl:w-[280px]">
        <DashboardSidebar onAction={handleAction} />
      </aside>
      <div className="min-w-0 lg:ml-[240px] xl:ml-[280px]">
        <header className="sticky top-0 z-10 flex min-h-20 items-center gap-3 border-b border-[#eef0f3] bg-white px-4 sm:px-8 lg:min-h-[100px]">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileNavigation}
            onClick={() => setMobileNavigation(true)}
            className="grid size-10 shrink-0 place-items-center rounded-md hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500 lg:hidden"
          >
            <ListIcon size={24} />
          </button>
          <div className="relative min-w-0 flex-1 sm:max-w-[400px]">
            <MagnifyingGlassIcon
              size={21}
              weight="regular"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9aa3b5]"
            />
            <label htmlFor="stock-search" className="sr-only">
              {searchLabel ?? `Search ${title.toLowerCase()} products`}
            </label>
            <input
              id="stock-search"
              name="stock-search"
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-11 w-full rounded-md border border-[#e9ecf2] bg-white pr-10 pl-12 text-sm outline-none placeholder:text-[#929db0] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => onQueryChange('')}
                className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-md text-slate-400 hover:text-slate-700"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
            <span
              className="hidden rounded-full border border-[#e7eaf0] bg-[#fafbfc] px-2.5 py-1 text-[10px] font-medium tracking-wide text-[#7c879b] sm:inline-block"
              title="Reference-design sample figures; not live business records"
            >
              Sample data
            </span>
            <button
              type="button"
              aria-label={`Notifications: ${notificationCount} stock alerts`}
              onClick={() => handleAction('notifications')}
              className="grid size-9 place-items-center rounded-full hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <BellIcon size={22} weight="regular" />
            </button>
            <button
              type="button"
              aria-label="Open workspace profile"
              onClick={() => handleAction('profile')}
              className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-500"
            >
              <img
                src="/dashboard/profile.png"
                alt=""
                className="size-10 rounded-full object-cover"
              />
            </button>
          </div>
        </header>
        <main
          id="workspace-content"
          className="mx-auto min-w-0 max-w-[1640px] p-4 sm:p-6 xl:p-8"
          tabIndex={-1}
        >
          <h1 className="sr-only">{title}</h1>
          <p className="mb-3 text-[11px] font-medium text-[#7c879b] sm:hidden">
            {title} · sample data
          </p>
          {children}
        </main>
      </div>
      {mobileNavigation && (
        <DashboardDialog title="Navigation" onClose={() => setMobileNavigation(false)}>
          <DashboardSidebar onAction={handleAction} onClose={() => setMobileNavigation(false)} />
        </DashboardDialog>
      )}
    </div>
  )
}
