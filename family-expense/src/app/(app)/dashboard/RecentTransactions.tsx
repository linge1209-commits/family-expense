import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRecentTransactions } from '@/actions/transactions'
import { getCategories, getFamilyMembers } from '@/actions/categories'
import TransactionCard from '@/components/transactions/TransactionCard'

export default async function RecentTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [transactions, categories, members] = await Promise.all([
    getRecentTransactions(20),
    getCategories(),
    getFamilyMembers(),
  ])

  return (
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
              categories={categories}
              members={members}
            />
          ))}
        </div>
      )}
    </div>
  )
}
