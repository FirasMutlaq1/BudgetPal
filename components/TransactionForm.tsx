'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addTransaction } from '@/app/actions/transactions'

type Category = { id: string; name: string; type: string; color: string }

export default function TransactionForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(addTransaction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  const income = categories.filter(c => c.type === 'income')
  const expense = categories.filter(c => c.type === 'expense')

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Belopp (kr)</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Beskrivning</label>
        <input
          name="description"
          placeholder="Valfri beskrivning"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Datum</label>
        <input
          name="date"
          type="date"
          required
          defaultValue={today}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
        <select
          name="category_id"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">— Ingen kategori —</option>
          {income.length > 0 && (
            <optgroup label="Inkomster">
              {income.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          )}
          {expense.length > 0 && (
            <optgroup label="Utgifter">
              {expense.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          )}
        </select>
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Sparar...' : '+ Lägg till transaktion'}
      </button>
    </form>
  )
}
