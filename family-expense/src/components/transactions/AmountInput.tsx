'use client'

import { useRef, useState } from 'react'

/** Evaluates a +/- only expression. Returns null if invalid or result ≤ 0. */
function evalExpr(raw: string): number | null {
  const s = raw.replace(/\s/g, '')
  if (!s) return null
  if (!/^\d+(\.\d+)?([+\-]\d+(\.\d+)?)*$/.test(s)) return null
  const parts = s.match(/[+\-]?\d+(\.\d+)?/g)
  if (!parts) return null
  const result = parts.reduce((acc, p) => acc + parseFloat(p), 0)
  return Number.isFinite(result) && result > 0 ? Math.round(result * 100) / 100 : null
}

interface Props {
  defaultValue?: number
  /** Focus border color: true=green, false=red, undefined=blue */
  isIncome?: boolean
  /** Smaller size variant for modals */
  compact?: boolean
  onChange?: (value: number | null) => void
}

export default function AmountInput({ defaultValue, isIncome, compact = false, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [expr, setExpr] = useState(defaultValue != null ? String(defaultValue) : '')

  const computed = evalExpr(expr)
  const showPreview = /\d[+\-]/.test(expr) && computed !== null

  const focusCls =
    isIncome === true  ? 'focus:border-green-500' :
    isIncome === false ? 'focus:border-red-400'   :
                         'focus:border-blue-500'

  const sizeCls = compact ? 'py-3 text-xl' : 'py-4 text-2xl'
  const previewColor = isIncome === true ? 'text-green-600' : 'text-blue-600'

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    // Only allow digits, dot, and +/-
    if (val && !/^[\d.+\-]*$/.test(val)) return
    setExpr(val)
    onChange?.(evalExpr(val))
  }

  function handleOp(op: '+' | '-') {
    if (!expr || /[+\-]$/.test(expr)) return
    const next = expr + op
    setExpr(next)
    onChange?.(evalExpr(next))
    inputRef.current?.focus()
  }

  return (
    <div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={expr}
          onChange={handleChange}
          placeholder="0"
          className={`w-full pl-8 pr-20 ${sizeCls} font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:outline-none ${focusCls}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button
            type="button"
            onClick={() => handleOp('+')}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 font-bold text-lg transition-colors select-none"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleOp('-')}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 font-bold text-lg transition-colors select-none"
          >
            −
          </button>
        </div>
        <input type="hidden" name="amount" value={computed ?? ''} />
      </div>
      {showPreview && (
        <div className={`text-sm mt-1.5 ml-1 font-semibold ${previewColor}`}>
          = {computed!.toLocaleString('zh-TW')}
        </div>
      )}
    </div>
  )
}
