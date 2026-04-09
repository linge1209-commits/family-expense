import { createClient } from '@/lib/supabase/server'
import { getCategories, getFamilyMembers } from '@/actions/categories'
import TransactionForm from '@/components/transactions/TransactionForm'

export default async function AddPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [categories, members] = await Promise.all([
    getCategories(),
    getFamilyMembers(),
  ])

  return (
    <div className="p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-800">新增支出</h1>
      </div>
      <TransactionForm
        categories={categories}
        members={members}
        currentUserEmail={user?.email ?? ''}
      />
    </div>
  )
}
