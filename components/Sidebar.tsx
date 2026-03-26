'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Home, TrendingUp, CreditCard, Tag, Target, Settings, LogOut, DollarSign } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: Home },
  { href: '/dashboard/income', icon: TrendingUp },
  { href: '/dashboard/transactions', icon: CreditCard },
  { href: '/dashboard/categories', icon: Tag },
  { href: '/dashboard/budgets', icon: Target },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-16 shrink-0 bg-gray-900 flex-col items-center py-5 gap-2">
        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
          <DollarSign size={18} className="text-white" />
        </div>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {navItems.map(({ href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-6 bg-white rounded-r-full" />
                )}
                <Icon size={17} />
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <button title="Inställningar" className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors">
            <Settings size={17} />
          </button>
          <form action={logout}>
            <button
              type="submit"
              title="Logga ut"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 flex items-center justify-around px-2 py-2 z-50">
        {navItems.map(({ href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
            </Link>
          )
        })}
        <form action={logout}>
          <button
            type="submit"
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-gray-500"
          >
            <LogOut size={20} />
          </button>
        </form>
      </nav>
    </>
  )
}
