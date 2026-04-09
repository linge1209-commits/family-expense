'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TransactionInsert, TransactionWithCategory } from '@/lib/supabase/types'

function sanitizeDescription(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('=') || trimmed.startsWith('+') || trimmed.startsWith('-') || trimmed.startsWith('@')) {
    throw new Error('描述欄位包含非法字元')
  }
  return trimmed
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('請先登入')

  const amount = parseFloat(formData.get('amount') as string)
  if (isNaN(amount) || amount <= 0 || amount > 1_000_000) {
    throw new Error('金額無效（需介於 1 ~ 1,000,000）')
  }

  const description = sanitizeDescription(formData.get('description') as string)
  if (!description || description.length > 200) {
    throw new Error('描述長度需在 1~200 字之間')
  }

  const payer = (formData.get('payer') as string).trim()
  if (!payer || payer.length > 50) throw new Error('付款人欄位無效')

  const categoryId = formData.get('category_id')
  const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0]

  const insert: TransactionInsert = {
    amount,
    description,
    payer,
    category_id: categoryId ? parseInt(categoryId as string) : null,
    date,
    added_by: user.id,
    added_by_email: user.email!,
  }

  const { error } = await supabase.from('transactions').insert(insert)
  if (error) throw new Error('新增失敗：' + error.message)

  revalidatePath('/dashboard')
  revalidatePath('/history')
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('請先登入')

  // RLS 已確保只能刪除自己的記錄，但在此再做一次明確過濾
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('added_by', user.id)

  if (error) throw new Error('刪除失敗：' + error.message)

  revalidatePath('/dashboard')
  revalidatePath('/history')
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('請先登入')

  const amount = parseFloat(formData.get('amount') as string)
  if (isNaN(amount) || amount <= 0 || amount > 1_000_000) {
    throw new Error('金額無效')
  }

  const description = sanitizeDescription(formData.get('description') as string)
  const payer = (formData.get('payer') as string).trim()
  const categoryId = formData.get('category_id')
  const date = formData.get('date') as string

  const { error } = await supabase
    .from('transactions')
    .update({ amount, description, payer, category_id: categoryId ? parseInt(categoryId as string) : null, date })
    .eq('id', id)
    .eq('added_by', user.id)

  if (error) throw new Error('更新失敗：' + error.message)

  revalidatePath('/dashboard')
  revalidatePath('/history')
}

export async function getTransactions(year: number, month: number) {
  const supabase = await createClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(id, name, icon)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as TransactionWithCategory[]
}

export async function getRecentTransactions(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(id, name, icon)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as TransactionWithCategory[]
}
