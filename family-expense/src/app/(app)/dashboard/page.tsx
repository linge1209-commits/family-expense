import { createClient } from '@/lib/supabase/server'
import { getRecentTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { getLedgersWithBalance } from '@/actions/ledgers'
import TransactionCard from '@/components/transactions/TransactionCard'
import { formatCurrency, formatMonthYear, getCurrentYearMonth } from '@/lib/utils'
import { signOut } from '@/actions/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { year, month } = getCurrentYearMonth()
  const [transactions, categories, ledgers] = await Promise.all([
    getRecentTransactions(20),
    getCategories(),
    getLedgersWithBalance(),
  ])

  // 本月統計
  const thisMonthTxns = transactions.filter(tx => {
    const d = new Date(tx.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
  const totalThisMonth = thisMonthTxns.reduce((sum, tx) => sum + tx.amount, 0)

  // 分類小計
  const categoryTotals = thisMonthTxns.reduce<Record<number, number>>((acc, tx) => {
    if (tx.category_id) {
      acc[tx.category_id] = (acc[tx.category_id] ?? 0) + tx.amount
    }
    return acc
  }, {})

  const topCategories = categories
    .filter(c => categoryTotals[c.id])
    .sort((a, b) => (categoryTotals[b.id] ?? 0) - (categoryTotals[a.id] ?? 0))
    .slice(0, 4)

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <div className="text-sm text-gray-500">{formatMonthYear(year, month)}</div>
          <div className="text-2xl font-bold text-gray-800">本月支出</div>
        </div>
        <form action={signOut}>
          <button className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200">
            登出
          </button>
        </form>
      </div>

      {/* 總金額卡片 */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="text-4xl font-bold">{formatCurrency(totalThisMonth)}</div>
        <div className="text-blue-200 text-sm mt-1">{thisMonthTxns.length} 筆記錄</div>

        {topCategories.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {topCategories.map(cat => (
              <div key={cat.id} className="bg-blue-500/40 rounded-lg px-3 py-1.5 text-sm">
                {cat.icon} {cat.name} {formatCurrency(categoryTotals[cat.id] ?? 0)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 帳本餘額 */}
      {ledgers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-700">帳本餘額</h2>
            <Link href="/ledgers" className="text-sm text-blue-500">管理</Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ledgers.map(l => (
              <div key={l.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-sm font-medium text-gray-700 truncate">{l.name}</span>
                </div>
                <div className={`text-lg font-bold ${l.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {formatCurrency(l.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速記帳按鈕 */}
      <Link
        href="/add"
        className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
      >
        <span className="text-xl">➕</span> 新增支出
      </Link>

      {/* 最近記錄 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-700">最近記錄</h2>
          <Link href="/history" className="text-sm text-blue-500">查看全部</Link>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">📭</div>
            <div>還沒有記錄，開始記帳吧！</div>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                currentUserId={user?.id ?? ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
