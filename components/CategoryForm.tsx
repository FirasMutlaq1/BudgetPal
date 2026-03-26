'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addCategory } from '@/app/actions/categories'

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export default function CategoryForm() {
  const [state, action, pending] = useActionState(addCategory, null)
  const [color, setColor] = useState(COLORS[0])
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      setColor(COLORS[0])
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Namn</label>
        <input
          name="name"
          required
          placeholder="t.ex. Mat, Hyra, Lön"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Typ</label>
        <select
          name="type"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="expense">Utgift</option>
          <option value="income">Inkomst</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Färg</label>
        <input type="hidden" name="color" value={color} />
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: '2px',
                transform: color === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {pending ? 'Sparar...' : '+ Lägg till kategori'}
      </button>
    </form>
  )
}
