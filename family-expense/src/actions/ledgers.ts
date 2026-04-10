'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { LedgerInsert } from '@/lib/supabase/types'

export async function getLedgers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ledgers')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addLedger(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('請先登入')

  const name = (formData.get('name') as string).trim()
  if (!name || name.length > 50) throw new Error('名稱長度需在 1~50 字之間')

  const icon = (formData.get('icon') as string).trim() || '💰'
  const initial_balance = parseFloat(formData.get('initial_balance') as string)
  if (isNaN(initial_balance) || initial_balance < 0) throw new Error('初始金額無效')

  const insert: LedgerInsert = {
    name,
    icon,
    initial_balance,
    created_by: user.id,
  }

  const { error } = await supabase.from('ledgers').insert(insert)
  if (error) throw new Error('新增失敗：' + error.message)

  revalidatePath('/ledgers')
  revalidatePath('/dashboard')
}

export async function deleteLedger(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('請先登入')

  const { error } = await supabase
    .from('ledgers')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) throw new Error('刪除失敗：' + error.message)

  revalidatePath('/ledgers')
  revalidatePath('/dashboard')
}

export async function getLedgersWithBalance() {
  const supabase = await createClient()

  const { data: ledgers, error } = await supabase
    .from('ledgers')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  if (!ledgers || ledgers.length === 0) return []

  const { data: txns } = await supabase
    .from('transactions')
    .select('ledger_id, amount')
    .not('ledger_id', 'is', null)

  const spentByLedger = (txns ?? []).reduce<Record<string, number>>((acc, tx) => {
    if (tx.ledger_id) acc[tx.ledger_id] = (acc[tx.ledger_id] ?? 0) + tx.amount
    return acc
  }, {})

  return ledgers.map(l => ({
    ...l,
    balance: l.initial_balance - (spentByLedger[l.id] ?? 0),
    spent: spentByLedger[l.id] ?? 0,
  }))
}
