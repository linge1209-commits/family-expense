import { Suspense } from 'react'
import { signOut } from '@/actions/auth'
import SpecialDayGreeting from '@/components/SpecialDayGreeting'
import NavLinkWithLoading from '@/components/ui/NavLinkWithLoading'
import MonthlyStatsCard from './MonthlyStatsCard'
import LedgerBalances from './LedgerBalances'
import RecentTransactions from './RecentTransactions'

function StatsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg space-y-3">
        <div className="h-10 w-40 bg-blue-400/50 rounded animate-pulse" />
        <div className="h-4 w-20 bg-blue-400/40 rounded animate-pulse" />
      </div>
    </div>
  )
}

function LedgersSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 h-20 animate-pulse" />
      ))}
    </div>
  )
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 h-16 animate-pulse" />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-4">
        <div className="text-2xl font-bold text-gray-800">本月支出</div>
        <form action={signOut}>
          <button className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200">
            登出
          </button>
        </form>
      </div>

      <SpecialDayGreeting />

      <Suspense fallback={<StatsSkeleton />}>
        <MonthlyStatsCard />
      </Suspense>

      <Suspense fallback={<LedgersSkeleton />}>
        <LedgerBalances />
      </Suspense>

      <NavLinkWithLoading
        href="/add"
        className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
      >
        <span className="text-xl">➕</span> 新增支出
      </NavLinkWithLoading>

      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactions />
      </Suspense>
    </div>
  )
}
