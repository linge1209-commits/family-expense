'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction } from '@/actions/transactions'
import type { Category, FamilyMember } from '@/lib/supabase/types'

interface Props {
  categories: Category[]
  members: FamilyMember[]
  currentUserEmail: string
}

export default function TransactionForm({ categories, members, currentUserEmail }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const currentMember = members.find(m => m.email === currentUserEmail)
  const [payer, setPayer] = useState(currentMember?.display_name ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    if (selectedCategory) formData.set('category_id', String(selectedCategory))

    startTransition(async () => {
      try {
        await addTransaction(formData)
        formRef.current?.reset()
        setSelectedCategory(null)
        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : '新增失敗')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            step="1"
            min="1"
            max="1000000"
            required
            placeholder="0"
            className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 分類 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                selectedCategory === cat.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-100 bg-gray-50 text-gray-600'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs mt-1 font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 說明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
        <input
          name="description"
          type="text"
          maxLength={200}
          placeholder="例：麥當勞午餐"
          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* 付款人 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">付款人</label>
        <div className="flex gap-2 flex-wrap">
          {members.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => setPayer(member.display_name)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                payer === member.display_name
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {member.display_name}
            </button>
          ))}
        </div>
        <input type="hidden" name="payer" value={payer} />
      </div>

      {/* 日期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
        <input
          name="date"
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !payer}
        className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
      >
        {isPending ? '新增中...' : '記帳'}
      </button>
    </form>
  )
}
