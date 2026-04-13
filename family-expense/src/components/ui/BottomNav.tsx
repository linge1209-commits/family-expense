'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NavLinkWithLoading from './NavLinkWithLoading'

const navItems = [
  { href: '/dashboard', label: '首頁', icon: '🏠' },
  { href: '/add', label: '記帳', icon: '➕' },
  { href: '/history', label: '明細', icon: '📋' },
  { href: '/ledgers', label: '帳本', icon: '📒' },
  { href: '/reports', label: '報表', icon: '📊' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex max-w-lg mx-auto">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href
          if (href === '/add') {
            // hard navigation so the browser's native autoFocus opens the keyboard on iOS/PWA
            return (
              <NavLinkWithLoading
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center justify-center py-2 min-h-[56px] text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl mb-0.5">{icon}</span>
                <span>{label}</span>
              </NavLinkWithLoading>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center py-2 min-h-[56px] text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl mb-0.5">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
