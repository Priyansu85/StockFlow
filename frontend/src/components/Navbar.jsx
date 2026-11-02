import {
  LogOut,
  Menu,
  UserCircle,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'


function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">

      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            Inventory Management
          </p>

          <p className="hidden text-xs text-gray-500 sm:block">
            Manage your business efficiently
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">

        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle
            size={32}
            className="text-gray-500"
          />

          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-800">
              {user?.first_name || user?.username}
            </p>

            <p className="text-xs text-gray-500">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">
            Logout
          </span>
        </button>

      </div>

    </header>
  )
}

export default Navbar