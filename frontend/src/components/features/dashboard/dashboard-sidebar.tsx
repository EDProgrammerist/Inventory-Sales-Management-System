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
import { Link, NavLink } from 'react-router'
import logo from '@/assets/kanban-logo.svg'

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
  return (
    <div className="flex h-full min-h-[600px] flex-col bg-white px-6 py-7">
      <div className="mb-10 flex items-center justify-between gap-3">
        <Link
          to="/dashboard"
          aria-label="Kanban dashboard"
          onClick={onClose}
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <img src={logo} alt="" className="h-12 w-12" />
          <span className="text-[22px] font-semibold tracking-wide text-[#1872ef]">KANBAN</span>
        </Link>
        {onClose && (
          <button
            aria-label="Close navigation"
            onClick={onClose}
            className="grid size-8 place-items-center rounded hover:bg-slate-50"
          >
            <XIcon size={20} />
          </button>
        )}
      </div>
      <nav aria-label="Main navigation" className="space-y-3">
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
      <div className="mt-auto space-y-3 pt-12">
        <button onClick={() => onAction('settings')} className="dashboard-nav">
          <GearSixIcon size={23} weight="regular" />
          Settings
        </button>
        <Link
          to="/login"
          className="dashboard-nav"
          title="Return to login; this dashboard is a sample preview"
        >
          <SignOutIcon size={23} weight="regular" />
          Log Out
        </Link>
      </div>
    </div>
  )
}
