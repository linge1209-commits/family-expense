'use client'

import { useState, useTransition } from 'react'
import { getMonthlyStats, type MonthlyStatsData } from '@/actions/reports'
import { formatCurrency, formatMonthYear, getCurrentYearMonth } from '@/lib/utils'

interface Props {
  initialYear: number
  initialMonth: number
  initialData: MonthlyStatsData
}

export default function MonthSwitcherClient({ initialYear, initialMonth, initialData }: Props) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const isCurrentMonth = year === currentYear && month === currentMonth

  function navigate(newYear: number, newMonth: number) {
    startTransition(async () => {
      const newData = await getMonthlyStats(newYear, newMonth)
      setYear(newYear)
      setMonth(newMonth)
      setData(newData)
    })
  }

  function goPrev() {
    const d = new Date(year, month - 2, 1)
    navigate(d.getFullYear(), d.getMonth() + 1)
  }

  function goNext() {
    const d = new Date(year, month, 1)
    navigate(d.getFullYear(), d.getMonth() + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between px-1">
        <button
          onClick={goPrev}
          disabled={isPending}
          className="w-8 h-8 flex items-center justify-center text-xl text-gray-400 hover:text-gray-700 disabled:opacity-40 rounded-lg"
        >
          ‹
        </button>
        <div className="text-sm text-gray-500 font-medium">{formatMonthYear(year, month)}</div>
        <button
          onClick={goNext}
          disabled={isPending || isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center text-xl text-gray-400 hover:text-gray-700 disabled:invisible rounded-lg"
        >
          ›
        </button>
      </div>

      <div className={`bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg transition-opacity duration-150 ${isPending ? 'opacity-50' : ''}`}>
        <div className="text-4xl font-bold">{formatCurrency(data.expenseTotal)}</div>
        <div className="text-blue-200 text-sm mt-1">{data.txnCount} 筆記錄</div>
        {data.incomeTotal > 0 && (
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-green-300">收入 +{formatCurrency(data.incomeTotal)}</span>
            <span className="text-red-300">支出 -{formatCurrency(data.expenseTotal)}</span>
            <span className={data.incomeTotal >= data.expenseTotal ? 'text-green-200' : 'text-red-200'}>
              淨 {data.incomeTotal >= data.expenseTotal ? '+' : ''}{formatCurrency(data.incomeTotal - data.expenseTotal)}
            </span>
          </div>
        )}
        {data.topCategories.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {data.topCategories.map(cat => (
              <div key={cat.id} className="bg-blue-500/40 rounded-lg px-3 py-1.5 text-sm text-white font-medium">
                {cat.icon} {cat.name} <span className="text-blue-100">{formatCurrency(cat.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
