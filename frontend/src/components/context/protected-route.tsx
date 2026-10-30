import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './use-auth'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function ProtectedRoute() {
  const { user, loading, error, retry } = useAuth()
  const location = useLocation()
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
  return <Outlet />
}
