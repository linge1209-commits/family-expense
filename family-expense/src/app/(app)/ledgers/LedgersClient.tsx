'use client'

import { useState, useTransition } from 'react'
import { addLedger, deleteLedger, transferBetweenLedgers } from '@/actions/ledgers'
import { formatCurrency } from '@/lib/utils'

interface LedgerWithBalance {
  id: string
  name: string
  icon: string
  initial_balance: number
  balance: number
  spent: number
  income: number
  transferIn: number
  transferOut: number
  created_by: string | null
}

interface Props {
  ledgers: LedgerWithBalance[]
  currentUserId: string
}

const ICON_OPTIONS = ['💰', '🏦', '💳', '🏧', '💵', '🪙', '🏠', '🚗', '✈️', '🎒']
type Mode = 'list' | 'add' | 'transfer'

export default function LedgersClient({ ledgers, currentUserId }: Props) {
  const [mode, setMode] = useState<Mode>('list')
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
        setMode('list')
        setIcon('💰')
      } catch (err) {
        setError(err instanceof Error ? err.message : '新增失敗')
      }
    })
  }

  function handleTransfer(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await transferBetweenLedgers(formData)
        setMode('list')
      } catch (err) {
        setError(err instanceof Error ? err.message : '轉帳失敗')
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

  function cancel() {
    setMode('list')
    setError(null)
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
                      初始 {formatCurrency(l.initial_balance)} · 支出 {formatCurrency(l.spent)}
                      {l.income > 0 && <span className="text-green-500"> · 收入 +{formatCurrency(l.income)}</span>}
                      {l.transferIn > 0 && <span className="text-blue-500"> · 轉入 +{formatCurrency(l.transferIn)}</span>}
                      {l.transferOut > 0 && <span className="text-orange-500"> · 轉出 -{formatCurrency(l.transferOut)}</span>}
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
              {l.initial_balance > 0 && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${l.balance < 0 ? 'bg-red-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(100, Math.max(0, (l.balance / l.initial_balance) * 100))}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    剩餘 {Math.round((l.balance / l.initial_balance) * 100)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 轉帳表單 */}
      {mode === 'transfer' && (
        <form action={handleTransfer} className="bg-white rounded-xl p-4 border-2 border-orange-200 space-y-4">
          <h3 className="font-semibold text-gray-700">帳本轉帳</h3>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">轉出帳本</label>
            <select
              name="from_ledger_id"
              required
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            >
              <option value="">請選擇</option>
              {ledgers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.icon} {l.name} ({formatCurrency(l.balance)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center text-2xl text-gray-400">→</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">轉入帳本</label>
            <select
              name="to_ledger_id"
              required
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            >
              <option value="">請選擇</option>
              {ledgers.map(l => (
                <option key={l.id} value={l.id}>
                  {l.icon} {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="1"
              min="1"
              max="1000000"
              required
              placeholder="0"
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註（選填）</label>
            <input
              name="note"
              type="text"
              maxLength={100}
              placeholder="例：撥款給旅遊基金"
              className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {isPending ? '轉帳中...' : '確認轉帳'}
            </button>
            <button type="button" onClick={cancel} className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl">
              取消
            </button>
          </div>
        </form>
      )}

      {/* 新增帳本表單 */}
      {mode === 'add' && (
        <form action={handleAdd} className="bg-white rounded-xl p-4 border-2 border-blue-200 space-y-4">
          <h3 className="font-semibold text-gray-700">新增帳本</h3>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
          )}

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
            <button type="submit" disabled={isPending} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50">
              {isPending ? '新增中...' : '新增'}
            </button>
            <button type="button" onClick={cancel} className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl">
              取消
            </button>
          </div>
        </form>
      )}

      {/* 底部按鈕 */}
      {mode === 'list' && (
        <div className="flex gap-2">
          {ledgers.length >= 2 && (
            <button
              onClick={() => setMode('transfer')}
              className="flex-1 py-4 bg-white border-2 border-dashed border-orange-300 text-orange-500 font-semibold rounded-xl hover:bg-orange-50 active:scale-95 transition-all"
            >
              🔄 帳本轉帳
            </button>
          )}
          <button
            onClick={() => setMode('add')}
            className="flex-1 py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 active:scale-95 transition-all"
          >
            ➕ 新增帳本
          </button>
        </div>
      )}
    </div>
  )
}
