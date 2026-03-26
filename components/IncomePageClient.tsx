'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addTransaction, updateTransaction, deleteTransaction } from '@/app/actions/transactions'
import { Trash2, Pencil, X } from 'lucide-react'

type Category = { id: string; name: string; color: string }
type Transaction = {
  id: string
  amount: number
  description: string | null
  date: string
  category_id: string | null
  categories: { name: string; color: string } | null
}

export default function IncomePageClient({
  categories,
  transactions,
  total,
}: {
  categories: Category[]
  transactions: Transaction[]
  total: number
}) {
  const [editing, setEditing] = useState<Transaction | null>(null)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: income list */}
      <div className="flex-1 overflow-y-auto p-6 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-gray-900">Inkomster</h1>
          <div className="bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            Totalt: {total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
          </div>
        </div>

        {!transactions.length ? (
          <div className="flex items-center justify-center h-40 text-gray-600">
            <p className="text-sm">Inga inkomster tillagda ännu.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${editing?.id === t.id ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
                <div
                  className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${t.categories?.color ?? '#10b981'}22` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.categories?.color ?? '#10b981' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{t.categories?.name}</p>
                  {t.description && <p className="text-xs text-gray-600">{t.description}</p>}
                </div>
                <p className="text-xs text-gray-600 shrink-0">{t.date}</p>
                <p className="text-sm font-semibold text-green-600 shrink-0">
                  +{Number(t.amount).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                </p>
                <button
                  onClick={() => setEditing(editing?.id === t.id ? null : t)}
                  className="p-1 text-gray-600 hover:text-indigo-500 transition-colors"
                >
                  {editing?.id === t.id ? <X size={14} /> : <Pencil size={14} />}
                </button>
                <form action={deleteTransaction.bind(null, t.id)}>
                  <button type="submit" className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: add or edit form */}
      <div className="w-80 shrink-0 border-l border-gray-100 p-6">
        {editing ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Redigera inkomst</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <EditForm categories={categories} transaction={editing} onDone={() => setEditing(null)} />
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Lägg till inkomst</h2>
            <AddForm categories={categories} />
          </>
        )}
      </div>
    </div>
  )
}

function AddForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(addTransaction, null)
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? '')
  const formRef = useRef<HTMLFormElement>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="category_id" value={selectedId} />
      <CategoryPicker categories={categories} selected={selectedId} onChange={setSelectedId} />
      <AmountInput />
      <DateInput defaultValue={today} />
      <NoteInput />
      {state?.error && <ErrorMsg msg={state.error} />}
      <SubmitBtn pending={pending} label="+ Lägg till inkomst" />
    </form>
  )
}

function EditForm({ categories, transaction, onDone }: { categories: Category[]; transaction: Transaction; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateTransaction, null)
  const [selectedId, setSelectedId] = useState(transaction.category_id ?? categories[0]?.id ?? '')

  useEffect(() => {
    if (state?.success) onDone()
  }, [state])

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={transaction.id} />
      <input type="hidden" name="category_id" value={selectedId} />
      <CategoryPicker categories={categories} selected={selectedId} onChange={setSelectedId} />
      <AmountInput defaultValue={String(transaction.amount)} />
      <DateInput defaultValue={transaction.date} />
      <NoteInput defaultValue={transaction.description ?? ''} />
      {state?.error && <ErrorMsg msg={state.error} />}
      <SubmitBtn pending={pending} label="Spara ändringar" />
    </form>
  )
}

function CategoryPicker({ categories, selected, onChange }: { categories: Category[]; selected: string; onChange: (id: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-2">Typ av inkomst</label>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button key={c.id} type="button" onClick={() => onChange(c.id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={selected === c.id
              ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' }
              : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function AmountInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Belopp (kr)</label>
      <input name="amount" type="number" step="0.01" min="0.01" required
        placeholder="0.00" defaultValue={defaultValue}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  )
}

function DateInput({ defaultValue }: { defaultValue: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Datum</label>
      <input name="date" type="date" required defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  )
}

function NoteInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Anteckning <span className="text-gray-600">(valfri)</span>
      </label>
      <input name="description" placeholder="t.ex. mars lön" defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{msg}</p>
}

function SubmitBtn({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Sparar...' : label}
    </button>
  )
}
