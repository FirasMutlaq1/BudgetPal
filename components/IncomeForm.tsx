'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addTransaction } from '@/app/actions/transactions'

type Category = { id: string; name: string; color: string }

export default function IncomeForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(addTransaction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? '')
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  if (!categories.length) {
    return (
      <p className="text-sm text-gray-600 text-center py-4">
        Inga inkomstkategorier hittades.
      </p>
    )
  }

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <input type="hidden" name="category_id" value={selectedId} />

      {/* Category buttons */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Typ av inkomst</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={
                selectedId === c.id
                  ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' }
                  : { backgroundColor: '#f9fafb', borderColor: '#f3f4f6', color: '#4b5563' }
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Belopp (kr)</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* Date */}
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

      {/* Optional note */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Anteckning <span className="text-gray-600">(valfri)</span></label>
        <input
          name="description"
          placeholder="t.ex. mars lön"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">Inkomst sparad!</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Sparar...' : '+ Lägg till inkomst'}
      </button>
    </form>
  )
}
