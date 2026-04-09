import { createClient } from '@/lib/supabase/server'
import { getTransactions } from '@/actions/transactions'
import TransactionCard from '@/components/transactions/TransactionCard'
import { formatMonthYear, getCurrentYearMonth } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function HistoryPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const year = parseInt(params.year ?? String(currentYear))
  const month = parseInt(params.month ?? String(currentMonth))

  const transactions = await getTransactions(year, month)
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  // 產生最近 6 個月選項
  const monthOptions: { year: number; month: number; label: string }[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1)
    monthOptions.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: formatMonthYear(d.getFullYear(), d.getMonth() + 1),
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-800">消費明細</h1>
      </div>

      {/* 月份切換 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {monthOptions.map(opt => {
          const isActive = opt.year === year && opt.month === month
          return (
            <a
              key={`${opt.year}-${opt.month}`}
              href={`/history?year=${opt.year}&month=${opt.month}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {opt.label}
            </a>
          )
        })}
      </div>

      {/* 月份小計 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="text-sm text-gray-500">{formatMonthYear(year, month)} 共 {transactions.length} 筆</div>
        <div className="text-2xl font-bold text-gray-800 mt-1">
          NT$ {total.toLocaleString('zh-TW')}
        </div>
      </div>

      {/* 交易列表 */}
      {transactions.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl mb-2">📭</div>
          <div>這個月沒有記錄</div>
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
  )
}
