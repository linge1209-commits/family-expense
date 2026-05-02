import { connection } from 'next/server'
import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { getCurrentYearMonth, formatCurrency, formatMonthYear } from '@/lib/utils'

export default async function MonthlyStatsCard() {
  await connection()
  const { year, month } = getCurrentYearMonth()
  const [txns, categories] = await Promise.all([
    getTransactions(year, month),
    getCategories(),
  ])

  const expenses = txns.filter(tx => tx.type !== 'income')
  const expenseTotal = expenses.reduce((sum, tx) => sum + tx.amount, 0)
  const incomeTotal = txns.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0)

  const categoryTotals = expenses.reduce<Record<number, number>>((acc, tx) => {
    if (tx.category_id) acc[tx.category_id] = (acc[tx.category_id] ?? 0) + tx.amount
    return acc
  }, {})

  const topCategories = categories
    .filter(c => categoryTotals[c.id])
    .sort((a, b) => (categoryTotals[b.id] ?? 0) - (categoryTotals[a.id] ?? 0))
    .slice(0, 4)

  return (
    <>
      <div className="text-sm text-gray-500 -mb-2">{formatMonthYear(year, month)}</div>
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-4xl font-bold">{formatCurrency(expenseTotal)}</div>
        <div className="text-blue-200 text-sm mt-1">{txns.length} 筆記錄</div>
        {incomeTotal > 0 && (
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-green-300">收入 +{formatCurrency(incomeTotal)}</span>
            <span className="text-red-300">支出 -{formatCurrency(expenseTotal)}</span>
            <span className={incomeTotal >= expenseTotal ? 'text-green-200' : 'text-red-200'}>
              淨 {incomeTotal >= expenseTotal ? '+' : ''}{formatCurrency(incomeTotal - expenseTotal)}
            </span>
          </div>
        )}
        {topCategories.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {topCategories.map(cat => (
              <div key={cat.id} className="bg-blue-500/40 rounded-lg px-3 py-1.5 text-sm text-white font-medium">
                {cat.icon} {cat.name} <span className="text-blue-100">{formatCurrency(categoryTotals[cat.id] ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
