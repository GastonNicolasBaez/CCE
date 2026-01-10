'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

/**
 * Admin Sidebar Component
 * Navigation menu for super admin panel
 */

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: '📊'
  },
  {
    label: 'Tenants',
    href: '/admin/tenants',
    icon: '🏢'
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Super Admin</h1>
            <p className="text-xs text-indigo-300">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white shadow-lg scale-105'
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white hover:scale-105'
                  }
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-700">
        <div className="text-xs text-indigo-300 text-center">
          <p>Sistema Multi-Tenant</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
