import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useStorefront } from '@/components/context/storefront-context'
import LoadingSpinner from '@/components/ui/loading-spinner'
import '@/styles/landing.css'

function CatalogLoading() {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000)
    return () => clearTimeout(timer)
  }, [])
  return <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 text-center" role="status">
    <div className="flex items-center gap-3"><LoadingSpinner />Loading products…</div>
    {slow && <p className="max-w-md text-sm">The store is taking longer to respond. We’re retrying automatically. Please keep this page open.</p>}
  </main>
}

export default function StorefrontLayout() {
  const { pathname, state } = useLocation()
  const previousPath = useRef<string | null>(null)
  const {catalogLoading,catalogError,reloadCatalog} = useStorefront()
  useLayoutEffect(() => {
    if (previousPath.current === pathname) return
    const productRoute = /^\/products\/[^/]+$/
    const selectingModel = state?.productSelection === true && previousPath.current !== null && productRoute.test(previousPath.current) && productRoute.test(pathname)
    previousPath.current = pathname
    if (!selectingModel) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, state])
  return <div className="storefront-page">
    {pathname.startsWith('/account/orders')?<Outlet/>:catalogLoading ? <CatalogLoading /> : catalogError ? <main className="shop-container cart-empty"><h1 className="mb-3 text-[22px] font-medium">Products are unavailable</h1><p role="alert">{catalogError}</p><button className="shop-button shop-button-solid" onClick={reloadCatalog}>Try again</button></main> : <Outlet />}
  </div>
}
