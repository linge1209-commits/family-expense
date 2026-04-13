'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  href: string
  className?: string
  children: React.ReactNode
}

export default function NavLinkWithLoading({ href, className, children }: Props) {
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    window.location.href = href
  }

  return (
    <>
      {loading && createPortal(
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>,
        document.body
      )}
      <button onClick={handleClick} className={className}>
        {children}
      </button>
    </>
  )
}
