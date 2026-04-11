'use client'

import { useRef, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction } from '@/actions/transactions'
import type { Category, FamilyMember, Ledger } from '@/lib/supabase/types'
import AmountInput from './AmountInput'

interface Props {
  categories: Category[]
  members: FamilyMember[]
  currentUserEmail: string
  ledgers: Ledger[]
}

const LS_LEDGER = 'tx_last_ledger'
const LS_PAYER  = 'tx_last_payer'

export default function TransactionForm({ categories, members, currentUserEmail, ledgers }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [txType, setTxType] = useState<'expense' | 'income'>('expense')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [amountValid, setAmountValid] = useState(false)

  const currentMember = members.find(m => m.email === currentUserEmail)

  // 初始值先用 currentMember / 第一個帳本，useEffect 再從 localStorage 覆蓋
  const [selectedLedger, setSelectedLedger] = useState<string | null>(ledgers[0]?.id ?? null)
  const [payer, setPayer] = useState(currentMember?.display_name ?? '')

  useEffect(() => {
    const savedLedger = localStorage.getItem(LS_LEDGER)
    const savedPayer  = localStorage.getItem(LS_PAYER)
    if (savedLedger && ledgers.some(l => l.id === savedLedger)) {
      setSelectedLedger(savedLedger)
    }
    if (savedPayer && members.some(m => m.display_name === savedPayer)) {
      setPayer(savedPayer)
    }
  }, [])

  function handleSetLedger(id: string | null) {
    setSelectedLedger(id)
    if (id) localStorage.setItem(LS_LEDGER, id)
    else localStorage.removeItem(LS_LEDGER)
  }

  function handleSetPayer(name: string) {
    setPayer(name)
    localStorage.setItem(LS_PAYER, name)
  }

  const filteredCategories = categories.filter(c => c.type === txType)

  function handleTypeChange(type: 'expense' | 'income') {
    setTxType(type)
    setSelectedCategory(null)
    setAmountValid(false)
  }

  function playSuccessSound() {
    try {
      const ctx = new AudioContext()
      const now = ctx.currentTime
      ;[659, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = now + i * 0.12
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.25, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        osc.start(t)
        osc.stop(t + 0.35)
      })
    } catch {
      // AudioContext not available (e.g. SSR)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    if (selectedCategory) formData.set('category_id', String(selectedCategory))
    formData.set('type', txType)

    startTransition(async () => {
      try {
        await addTransaction(formData)
        playSuccessSound()
        formRef.current?.reset()
        setSelectedCategory(null)
        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : '新增失敗')
      }
    })
  }

  const isIncome = txType === 'income'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {/* 收入 / 支出切換 */}
      <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 py-3 font-semibold text-sm transition-colors ${
            !isIncome ? 'bg-red-500 text-white' : 'bg-white text-gray-500'
          }`}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 py-3 font-semibold text-sm transition-colors ${
            isIncome ? 'bg-green-500 text-white' : 'bg-white text-gray-500'
          }`}
        >
          收入
        </button>
      </div>

      {/* 帳本 */}
      {ledgers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">帳本</label>
          <div className="flex gap-2 flex-wrap">
            {ledgers.map(ledger => (
              <button
                key={ledger.id}
                type="button"
                onClick={() => handleSetLedger(selectedLedger === ledger.id ? null : ledger.id)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  selectedLedger === ledger.id
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {ledger.icon} {ledger.name}
              </button>
            ))}
          </div>
          <input type="hidden" name="ledger_id" value={selectedLedger ?? ''} />
        </div>
      )}

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
        <AmountInput
          isIncome={isIncome}
          autoFocus
          onChange={v => setAmountValid(v !== null)}
        />
      </div>

      {/* 分類 */}
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
                  ? isIncome
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

      {/* 說明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
        <input
          name="description"
          type="text"
          maxLength={200}
          placeholder={isIncome ? '例：三月薪資' : '例：麥當勞午餐'}
          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* 付款人 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isIncome ? '收款人' : '付款人'}
        </label>
        <div className="flex gap-2 flex-wrap">
          {members.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleSetPayer(member.display_name)}
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
        <div className="w-full overflow-hidden">
          <input
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full max-w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !payer || !amountValid}
        className={`w-full py-4 text-white text-lg font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-all ${
          isIncome ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isPending ? '新增中...' : isIncome ? '記錄收入' : '記帳'}
      </button>
    </form>
  )
}
