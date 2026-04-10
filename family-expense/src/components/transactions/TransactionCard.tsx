'use client'

import { useState, useTransition } from 'react'
import { deleteTransaction } from '@/actions/transactions'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithCategory } from '@/lib/supabase/types'

interface Props {
  transaction: TransactionWithCategory
  currentUserId: string
}

export default function TransactionCard({ transaction: tx, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isOwner = tx.added_by === currentUserId

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    startTransition(async () => {
      await deleteTransaction(tx.id)
    })
  }

  return (
    <div className={`flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 ${isPending ? 'opacity-50' : ''}`}>
      <div className="text-3xl">{tx.categories?.icon ?? '📦'}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 truncate">{tx.description}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {tx.categories?.name ?? '其他'} · {tx.payer} · {formatDate(tx.date)}
          {tx.ledgers && <span className="ml-1">· {tx.ledgers.icon} {tx.ledgers.name}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-base font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
          {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
        </span>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white'
                : 'text-gray-300 hover:text-red-400'
            }`}
          >
            {confirmDelete ? '確認' : '✕'}
          </button>
        )}
      </div>
    </div>
  )
}
