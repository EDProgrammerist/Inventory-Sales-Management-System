import { AutoSkeleton } from 'auto-skeleton-react'
import { useLocation } from 'react-router'
import WorkspaceLayout from './workspace-layout'
import LoadingSpinner from '@/components/ui/loading-spinner'

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  inventory: 'Inventory',
  reports: 'Reports',
  suppliers: 'Suppliers',
  orders: 'Orders',
  'manage-store': 'Manage Store',
}

const skeletonConfig = {
  animation: 'none' as const,
  baseColor: 'var(--color-loading-base)',
  highlightColor: 'var(--color-loading-highlight)',
  borderRadius: 6,
}

export default function WorkspaceLoading() {
  const { pathname } = useLocation()
  const section = pathname.split('/')[1]
  const title = pageTitles[section] ?? 'Workspace'
  const charts = section === 'dashboard' || section === 'reports'

  return (
    <WorkspaceLayout title={title} query="" onQueryChange={() => {}} onAction={() => {}} notificationCount={0}>
      <div role="status" className="mb-4 flex items-center gap-2 text-sm text-loading-foreground">
        <LoadingSpinner className="text-brand" />
        <span>Loading {title.toLowerCase()}…</span>
      </div>
      <div aria-busy="true" aria-label={`${title} content`}>
        <div aria-hidden="true" inert>
          <AutoSkeleton loading config={skeletonConfig}>
            <div className="grid gap-5">
              <div className="dashboard-card grid grid-cols-2 gap-6 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="grid gap-4">
                    <span className="block h-5 w-24">Loading</span>
                    <span className="block h-7 w-16">Loading</span>
                  </div>
                ))}
              </div>
              {charts ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  {Array.from({ length: 2 }, (_, index) => (
                    <div key={index} className="dashboard-card">
                      <h2 className="mb-6 h-6 w-40">Loading chart</h2>
                      <div data-skeleton-role="image" className="h-64 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card overflow-hidden">
                  <h2 className="mb-6 h-6 w-40">Loading records</h2>
                  {Array.from({ length: 6 }, (_, row) => (
                    <div key={row} className="grid grid-cols-3 gap-6 py-5 sm:grid-cols-4">
                      {Array.from({ length: 4 }, (_, column) => (
                        <span key={column} className={`block h-5 w-full max-w-28 ${column === 3 ? 'hidden sm:block' : ''}`}>Loading</span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AutoSkeleton>
        </div>
      </div>
    </WorkspaceLayout>
  )
}
