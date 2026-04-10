'use client'

import { useState, useTransition } from 'react'
import { addLedger, deleteLedger } from '@/actions/ledgers'
import { formatCurrency } from '@/lib/utils'

interface LedgerWithBalance {
  id: string
  name: string
  icon: string
  initial_balance: number
  balance: number
  spent: number
  created_by: string | null
}

interface Props {
  ledgers: LedgerWithBalance[]
  currentUserId: string
}

const ICON_OPTIONS = ['💰', '🏦', '💳', '🏧', '💵', '🪙', '🏠', '🚗', '✈️', '🎒']

export default function LedgersClient({ ledgers, currentUserId }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [icon, setIcon] = useState('💰')
  const [error, setError] = useState<string | null>(null)

  function handleAdd(formData: FormData) {
    formData.set('icon', icon)
    setError(null)
    startTransition(async () => {
      try {
        await addLedger(formData)
        setShowForm(false)
        setIcon('💰')
      } catch (err) {
        setError(err instanceof Error ? err.message : '新增失敗')
      }
    })
  }

  function handleDelete(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
      return
    }
    startTransition(async () => {
      await deleteLedger(id)
      setConfirmDelete(null)
    })
  }

  return (
    <div className="space-y-4">
      {/* 帳本列表 */}
      {ledgers.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl mb-2">📒</div>
          <div>還沒有帳本，新增一個吧！</div>
        </div>
      ) : (
        <div className="space-y-3">
          {ledgers.map(l => (
            <div key={l.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{l.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{l.name}</div>
                    <div className="text-xs text-gray-400">
                      初始 {formatCurrency(l.initial_balance)} · 已支出 {formatCurrency(l.spent)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold ${l.balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatCurrency(l.balance)}
                  </div>
                  {l.created_by === currentUserId && (
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={isPending}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                        confirmDelete === l.id
                          ? 'bg-red-500 text-white'
                          : 'text-gray-300 hover:text-red-400'
                      }`}
                    >
                      {confirmDelete === l.id ? '確認' : '✕'}
                    </button>
                  )}
                </div>
              </div>
              {/* 餘額進度條 */}
              {l.initial_balance > 0 && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${l.balance < 0 ? 'bg-red-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(100, Math.max(0, (l.balance / l.initial_balance) * 100))}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    剩餘 {l.initial_balance > 0 ? Math.round((l.balance / l.initial_balance) * 100) : 0}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 新增帳本表單 */}
      {showForm ? (
        <form action={handleAdd} className="bg-white rounded-xl p-4 border-2 border-blue-200 space-y-4">
          <h3 className="font-semibold text-gray-700">新增帳本</h3>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Icon 選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">圖示</label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`text-2xl w-10 h-10 rounded-xl border-2 transition-all ${
                    icon === i ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">帳本名稱</label>
            <input
              name="name"
              type="text"
              required
              maxLength={50}
              placeholder="例：家庭公費、旅遊基金"
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">初始金額</label>
            <input
              name="initial_balance"
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              required
              defaultValue="0"
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {isPending ? '新增中...' : '新增'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null) }}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl"
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
        >
          ➕ 新增帳本
        </button>
      )}
    </div>
  )
}
