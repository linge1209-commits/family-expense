'use client'

import { useState, useTransition } from 'react'
import { updateTransaction } from '@/actions/transactions'
import type { Category, FamilyMember, TransactionWithCategory } from '@/lib/supabase/types'

interface Props {
  transaction: TransactionWithCategory
  categories: Category[]
  members: FamilyMember[]
  onClose: () => void
}

export default function EditTransactionModal({ transaction: tx, categories, members, onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(tx.category_id)
  const [payer, setPayer] = useState(tx.payer)

  const filteredCategories = categories.filter(c => c.type === tx.type)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (selectedCategory) formData.set('category_id', String(selectedCategory))
    else formData.delete('category_id')
    formData.set('payer', payer)

    startTransition(async () => {
      try {
        await updateTransaction(tx.id, formData)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : '更新失敗')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">修改記錄</h2>
          <button type="button" onClick={onClose} className="text-gray-400 text-xl leading-none">✕</button>
        </div>

        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {tx.type === 'income' ? '收入' : '支出'}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
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
                defaultValue={tx.amount}
                className="w-full pl-8 pr-4 py-3 text-xl font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 分類 */}
          {filteredCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      selectedCategory === cat.id
                        ? tx.type === 'income'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-100 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs mt-1 font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 說明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
            <input
              name="description"
              type="text"
              maxLength={200}
              defaultValue={tx.description}
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* 付款人 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tx.type === 'income' ? '收款人' : '付款人'}
            </label>
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
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              name="date"
              type="date"
              defaultValue={tx.date}
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !payer}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-all"
          >
            {isPending ? '儲存中...' : '儲存變更'}
          </button>
        </form>
      </div>
    </div>
  )
}
