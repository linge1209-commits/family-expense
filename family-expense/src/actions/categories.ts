'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getMonthlyBudgets(year: number, month: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_budgets')
    .select('*, categories(name, icon)')
    .eq('year', year)
    .eq('month', month)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertMonthlyBudget(
  categoryId: number,
  year: number,
  month: number,
  budget: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('請先登入')

  if (budget < 0 || budget > 10_000_000) throw new Error('預算金額無效')

  const { error } = await supabase
    .from('monthly_budgets')
    .upsert({ category_id: categoryId, year, month, budget })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/settings')
}

export async function getFamilyMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('created_at')

  if (error) throw new Error(error.message)
  return data ?? []
}
