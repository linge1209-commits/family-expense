'use client'

import { useRouter } from 'next/navigation'

interface Props {
  year: number
  month: number
}

export default function MonthSwitcher({ year, month }: Props) {
  const router = useRouter()

  const go = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    router.push(`/reports?year=${d.getFullYear()}&month=${d.getMonth() + 1}`)
  }

  const now = new Date()
  const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => go(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-600"
      >
        ‹
      </button>
      <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
        {year} 年 {month} 月
      </span>
      <button
        onClick={() => go(1)}
        disabled={isCurrent}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  )
}
