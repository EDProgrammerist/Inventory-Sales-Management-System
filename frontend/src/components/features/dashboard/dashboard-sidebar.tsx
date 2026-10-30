import {
  HouseIcon,
  TruckIcon,
  ChartBarIcon,
  UserCircleIcon,
  PackageIcon,
  ClipboardTextIcon,
  GearSixIcon,
  SignOutIcon,
  XIcon,
  type Icon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/components/context/use-auth'
import LoadingSpinner from '@/components/ui/loading-spinner'
import logo from '@/assets/shenban-logo.png'

export type DashboardAction =
  'inventory' | 'reports' | 'suppliers' | 'orders' | 'store' | 'settings'

const navigation: { label: string; icon: Icon; path?: string; action?: DashboardAction }[] = [
  { label: 'Dashboard', icon: HouseIcon, path: '/dashboard' },
  { label: 'Inventory', icon: TruckIcon, path: '/inventory' },
  { label: 'Reports', icon: ChartBarIcon, path: '/reports' },
  { label: 'Suppliers', icon: UserCircleIcon, path: '/suppliers' },
  { label: 'Orders', icon: PackageIcon, path: '/orders' },
  { label: 'Manage Store', icon: ClipboardTextIcon, path: '/manage-store' },
]

export default function DashboardSidebar({
  onAction,
  onClose,
}: {
  onAction: (action: DashboardAction) => void
  onClose?: () => void
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      onClose?.()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Unable to log out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className={`flex flex-col bg-white px-6 ${onClose ? 'min-h-full py-5' : 'h-full min-h-[600px] py-7'}`}>
      <div className={`flex items-center justify-between gap-3 ${onClose ? 'mb-6 border-b border-loading-base pb-5' : 'mb-10'}`}>
        <Link
          to="/dashboard"
          aria-label="Shenban dashboard"
          onClick={onClose}
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <img src={logo} alt="" className={`object-contain ${onClose ? 'size-10' : 'size-12'}`} />
          <span className={`${onClose ? 'text-xl' : 'text-[22px]'} font-semibold tracking-wide text-[#1872ef]`}>SHENBAN</span>
        </Link>
        {onClose && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="workspace-icon-button"
          >
            <XIcon size={20} />
          </button>
        )}
      </div>
      <nav aria-label="Main navigation" className={onClose ? 'space-y-1' : 'space-y-3'}>
        {navigation.map(({ label, icon: NavIcon, action, path }) =>
          action ? (
            <button key={label} onClick={() => onAction(action)} className="dashboard-nav">
              <NavIcon size={23} weight="regular" />
              {label}
            </button>
          ) : (
            <NavLink key={label} to={path!} onClick={onClose} className="dashboard-nav">
              <NavIcon size={23} weight="regular" />
              {label}
            </NavLink>
          ),
        )}
      </nav>
      <div className={`mt-auto ${onClose ? 'space-y-1 border-t border-loading-base pt-4' : 'space-y-3 pt-12'}`}>
        <button onClick={() => onAction('settings')} className="dashboard-nav">
          <GearSixIcon size={23} weight="regular" />
          Settings
        </button>
        <button
          type="button"
          disabled={loggingOut}
          onClick={handleLogout}
          className="dashboard-nav"
          aria-busy={loggingOut}
        >
          {loggingOut ? <LoadingSpinner /> : <SignOutIcon size={23} weight="regular" />}
          {loggingOut ? 'Logging out…' : 'Log Out'}
        </button>
        {logoutError && <p role="alert" className="px-3 text-xs text-red-700">{logoutError}</p>}
      </div>
    </div>
  )
}
