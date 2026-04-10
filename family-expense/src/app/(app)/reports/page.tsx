import { getTransactions } from '@/actions/transactions'
import { getCategories } from '@/actions/categories'
import { getCurrentYearMonth, formatCurrency, formatMonthYear } from '@/lib/utils'
import CategoryChart from '@/components/reports/CategoryChart'
import MonthlyChart from '@/components/reports/MonthlyChart'

export default async function ReportsPage() {
  const { year, month } = getCurrentYearMonth()

  // 抓最近 6 個月的月份列表
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

  // 本月各分類加總
  const categoryMap: Record<number, { name: string; icon: string; total: number }> = {}
  for (const tx of thisMonthTxns) {
    if (!tx.category_id) continue
    const cat = categories.find(c => c.id === tx.category_id)
    if (!cat) continue
    if (!categoryMap[tx.category_id]) {
      categoryMap[tx.category_id] = { name: cat.name, icon: cat.icon, total: 0 }
    }
    categoryMap[tx.category_id].total += tx.amount
  }
  const categoryData = Object.values(categoryMap).sort((a, b) => b.total - a.total)

  // 每月加總
  const monthlyData = allTxns.map((txns, i) => ({
    label: formatMonthYear(months[i].year, months[i].month),
    total: txns.reduce((sum, tx) => sum + tx.amount, 0),
  })).reverse()

  const thisMonthTotal = thisMonthTxns.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-800">報表分析</h1>
        <p className="text-gray-500 text-sm mt-1">{formatMonthYear(year, month)}</p>
      </div>

      {/* 本月總計 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="text-sm text-gray-500">本月總支出</div>
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
          <h2 className="font-bold text-gray-700 mb-3">本月分類排行</h2>
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
