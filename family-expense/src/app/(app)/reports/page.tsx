import { connection } from 'next/server'
import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { getCurrentYearMonth, formatCurrency, formatMonthYear } from '@/lib/utils'
import CategoryChart from '@/components/reports/CategoryChart'
import MonthlyChart from '@/components/reports/MonthlyChart'
import MonthSwitcher from '@/components/reports/MonthSwitcher'

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function ReportsPage({ searchParams }: Props) {
  await connection()
  const params = await searchParams
  const current = getCurrentYearMonth()
  const year = params.year ? parseInt(params.year) : current.year
  const month = params.month ? parseInt(params.month) : current.month

  // 抓所選月份往前 6 個月的月份列表
  const months: { year: number; month: number }[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(year, month - 1 - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }

  const [categories, ...allTxns] = await Promise.all([
    getCategories(),
    ...months.map(m => getTransactions(m.year, m.month)),
  ])

  const thisMonthTxns = allTxns[0]

  // 所選月份各分類加總（只算支出）
  const categoryMap: Record<number, { name: string; icon: string; total: number }> = {}
  for (const tx of thisMonthTxns) {
    if (tx.type === 'income') continue
    if (!tx.category_id) continue
    const cat = categories.find(c => c.id === tx.category_id)
    if (!cat) continue
    if (!categoryMap[tx.category_id]) {
      categoryMap[tx.category_id] = { name: cat.name, icon: cat.icon, total: 0 }
    }
    categoryMap[tx.category_id].total += tx.amount
  }
  const categoryData = Object.values(categoryMap).sort((a, b) => b.total - a.total)

  // 每月加總（只算支出）
  const monthlyData = allTxns.map((txns, i) => ({
    label: formatMonthYear(months[i].year, months[i].month),
    total: txns.filter(tx => tx.type !== 'income').reduce((sum, tx) => sum + tx.amount, 0),
  })).reverse()

  const thisMonthTotal = thisMonthTxns.filter(tx => tx.type !== 'income').reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-800">報表分析</h1>
      </div>

      <MonthSwitcher year={year} month={month} />

      {/* 所選月份總計 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="text-sm text-gray-500">{formatMonthYear(year, month)} 總支出</div>
        <div className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(thisMonthTotal)}</div>
      </div>

      {/* 分類圓餅圖 */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">分類佔比</h2>
          <CategoryChart data={categoryData} />
        </div>
      )}

      {/* 月份柱狀圖 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h2 className="font-bold text-gray-700 mb-4">近 6 個月趨勢</h2>
        <MonthlyChart data={monthlyData} />
      </div>

      {/* 分類排行 */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">分類排行</h2>
          <div className="space-y-3">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-800">{cat.name}</span>
                    <span className="text-gray-800">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(cat.total / thisMonthTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
