import Link from 'next/link'
import { getLedgersWithBalance } from '@/actions/ledgers'
import { formatCurrency } from '@/lib/utils'

export default async function LedgerBalances() {
  const ledgers = await getLedgersWithBalance()
  if (ledgers.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-gray-700">帳本餘額</h2>
        <Link href="/ledgers" className="text-sm text-blue-500">管理</Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ledgers.map(l => (
          <div key={l.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1 min-w-0">
              <span className="text-xl shrink-0">{l.icon}</span>
              <span className="text-base font-medium text-gray-700 truncate">{l.name}</span>
            </div>
            <div className={`text-xl font-bold truncate ${l.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatCurrency(l.balance)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
