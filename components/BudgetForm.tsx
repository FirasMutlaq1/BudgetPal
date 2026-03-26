'use client'

import { useActionState, useEffect, useRef } from 'react'
import { upsertBudget } from '@/app/actions/budgets'

type Category = { id: string; name: string; color: string }

export default function BudgetForm({ categories, currentMonth }: { categories: Category[]; currentMonth: string }) {
  const [state, action, pending] = useActionState(upsertBudget, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="month" value={currentMonth} />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
        <select
          name="category_id"
          required
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Välj kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Budgetbelopp (kr)</label>
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

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Sparar...' : '+ Sätt budget'}
      </button>
    </form>
  )
}
