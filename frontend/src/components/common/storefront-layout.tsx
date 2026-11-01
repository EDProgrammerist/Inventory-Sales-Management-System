import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useStorefront } from '@/components/context/storefront-context'
import LoadingSpinner from '@/components/ui/loading-spinner'
import '@/styles/landing.css'

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
    {pathname.startsWith('/account/orders')?<Outlet/>:catalogLoading ? <main className="flex min-h-[60dvh] items-center justify-center gap-3" role="status"><LoadingSpinner />Loading products…</main> : catalogError ? <main className="shop-container cart-empty"><h1 className="mb-3 text-[22px] font-medium">Products are unavailable</h1><p role="alert">{catalogError}</p><button className="shop-button shop-button-solid" onClick={reloadCatalog}>Try again</button></main> : <Outlet />}
  </div>
}
