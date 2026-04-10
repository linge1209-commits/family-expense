import { createClient } from '@/lib/supabase/server'
import { getLedgersWithBalance } from '@/actions/ledgers'
import LedgersClient from './LedgersClient'

export default async function LedgersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ledgers = await getLedgersWithBalance()

  return (
    <div className="p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-800">帳本管理</h1>
        <p className="text-sm text-gray-500 mt-1">管理各帳本的預算與餘額</p>
      </div>
      <LedgersClient ledgers={ledgers} currentUserId={user?.id ?? ''} />
    </div>
  )
}
