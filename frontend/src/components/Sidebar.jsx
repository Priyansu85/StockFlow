import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  X,
  Tags,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'



const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
  {
    label: 'Products',
    path: '/products',
    icon: Package,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: Truck,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
  {
    label: 'Purchases',
    path: '/purchases',
    icon: ShoppingCart,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    label: 'Sales',
    path: '/sales',
    icon: ClipboardList,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Boxes,
    roles: ['ADMIN', 'MANAGER', 'STAFF'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER'],
  },
  
  {
    label: 'Categories',
    path: '/categories',
    icon: Tags,
  },
  {
    label: 'User Management',
    path: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
]


function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const visibleItems = menuItems.filter((item) => {
  if (!user) return false

  if (!item.roles) return true

  return item.roles.includes(user.role)
})

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-slate-900 text-white
          transform transition-transform duration-200
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-5">
          <div>
            <h1 className="text-xl font-bold">
              StockFlow
            </h1>

            <p className="text-xs text-slate-400">
              Inventory Management
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <div className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                      flex items-center gap-3 rounded-lg px-3 py-2.5
                      text-sm font-medium transition
                      ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar