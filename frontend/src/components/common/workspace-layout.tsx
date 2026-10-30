import { useState, type ReactNode } from 'react'
import { BellIcon, MagnifyingGlassIcon, ListIcon, UserCircleIcon, XIcon } from '@phosphor-icons/react'
import DashboardSidebar, {
  type DashboardAction,
} from '@/components/features/dashboard/dashboard-sidebar'
import MobileMenu from './mobile-menu'

export type WorkspaceAction = DashboardAction | 'notifications' | 'profile'

export default function WorkspaceLayout({
  title,
  query,
  onQueryChange,
  onAction,
  notificationCount = 0,
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
    <div className="min-h-[100dvh] min-w-0 bg-workspace text-ink">
      <title>{`${title} · Shenban`}</title>
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
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-divider bg-surface px-4 py-3 sm:min-h-20 sm:flex-nowrap sm:gap-3 sm:px-6 sm:py-0 xl:px-8">
          <button
            type="button"
            aria-label="Open menu"
            aria-controls="workspace-mobile-menu"
            aria-expanded={mobileNavigation}
            onClick={() => setMobileNavigation(true)}
            className="workspace-icon-button lg:hidden"
          >
            <ListIcon size={24} />
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink sm:hidden">SHENBAN</span>
          <div className="relative order-last basis-full sm:order-none sm:min-w-0 sm:flex-1 sm:basis-auto sm:max-w-[400px]">
            <MagnifyingGlassIcon
              size={21}
              weight="regular"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <label htmlFor="stock-search" className="sr-only">
              {searchLabel ?? searchPlaceholder}
            </label>
            <input
              id="stock-search"
              name="stock-search"
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-11 w-full rounded-md border border-control bg-surface pr-12 pl-10 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => onQueryChange('')}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted hover:text-ink"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              aria-label={`Notifications: ${notificationCount} stock alerts`}
              onClick={() => handleAction('notifications')}
              className="workspace-icon-button"
            >
              <BellIcon size={22} weight="regular" />
            </button>
            <button
              type="button"
              aria-label="Open workspace profile"
              onClick={() => handleAction('profile')}
              className="workspace-icon-button"
            >
              <UserCircleIcon size={28} aria-hidden="true" />
            </button>
          </div>
        </header>
        <main
          id="workspace-content"
          className="mx-auto min-w-0 max-w-[1640px] p-4 sm:p-6 xl:p-8"
          tabIndex={-1}
        >
          <h1 className="mb-5 text-[24px] leading-8 font-semibold tracking-[-0.025em] text-ink">{title}</h1>
          {children}
        </main>
      </div>
      <MobileMenu open={mobileNavigation} onClose={() => setMobileNavigation(false)} onAction={handleAction} />
    </div>
  )
}
