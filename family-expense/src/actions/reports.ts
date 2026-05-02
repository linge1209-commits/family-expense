'use server'

import { getTransactions } from './transactions'
import { getCategories } from './categories'

export type MonthlyStatsData = {
  expenseTotal: number
  incomeTotal: number
  txnCount: number
  topCategories: { id: number; name: string; icon: string; amount: number }[]
}

export async function getMonthlyStats(year: number, month: number): Promise<MonthlyStatsData> {
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
    .map(c => ({ id: c.id, name: c.name, icon: c.icon, amount: categoryTotals[c.id] ?? 0 }))

  return { expenseTotal, incomeTotal, txnCount: txns.length, topCategories }
}
