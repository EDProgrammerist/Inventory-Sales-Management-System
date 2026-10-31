import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './use-auth'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { useWorkspace } from './workspace-context'
import WorkspaceLoading from '@/components/common/workspace-loading'

export default function ProtectedRoute() {
  const { user, loading, error, retry } = useAuth()
  const location = useLocation()
  const workspace = useWorkspace()
  if (loading || error) {
    return (
      <main className="grid min-h-dvh place-items-center bg-loading-highlight p-6 text-loading-foreground">
        <div className="grid max-w-sm justify-items-center gap-4 text-center text-sm">
          {loading ? <p role="status" className="flex items-center gap-3"><LoadingSpinner className="text-brand" />Checking your session…</p> : (
            <><p role="alert">{error}</p><button type="button" onClick={retry} className="inventory-button">Try again</button></>
          )}
        </div>
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  if (workspace.loading) return <WorkspaceLoading />
  if (workspace.error) return (
    <main className="grid min-h-dvh place-items-center bg-loading-highlight p-6 text-loading-foreground">
      <div className="grid max-w-sm justify-items-center gap-4 text-center text-sm">
        <p role="alert">{workspace.error}</p>
        <button type="button" onClick={workspace.retry} className="inventory-button">Try again</button>
      </div>
    </main>
  )
  return <Outlet />
}
