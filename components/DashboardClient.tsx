'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis,
} from 'recharts'
import { Bell, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { addTransaction } from '@/app/actions/transactions'

type Transaction = {
  id: string
  amount: number
  description: string | null
  date: string
  categories: { name: string; type: string; color: string } | null
}

type Budget = {
  id: string
  amount: number
  category_id: string
  categories: { name: string; color: string } | null
}

type Category = {
  id: string
  name: string
  type: string
  color: string
}

type Props = {
  balance: number
  income: number
  expense: number
  recent: Transaction[]
  allTransactions: Transaction[]
  budgets: Budget[]
  activityData: { v: number }[]
  savingsPct: number
  categories: Category[]
}

const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

function QuickAddForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(addTransaction, null)
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? '')
  const formRef = useRef<HTMLFormElement>(null)
  const today = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Snabb transaktion</h3>
      <form ref={formRef} action={action} className="space-y-3">
        <input type="hidden" name="category_id" value={selectedId} />

        {/* Category selector */}
        <div>
          {incomeCategories.length > 0 && (
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Inkomst</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {incomeCategories.map(c => (
              <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                style={selectedId === c.id
                  ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' }
                  : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }}
              >
                {c.name}
              </button>
            ))}
          </div>
          {expenseCategories.length > 0 && (
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Utgift</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {expenseCategories.map(c => (
              <button key={c.id} type="button" onClick={() => setSelectedId(c.id)}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                style={selectedId === c.id
                  ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' }
                  : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <input name="amount" type="number" step="0.01" min="0.01" required
          placeholder="Belopp (kr)"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <input name="date" type="date" required defaultValue={today}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        {state?.error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}
        <button type="submit" disabled={pending}
          className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Sparar...' : '+ Lägg till'}
        </button>
      </form>
    </div>
  )
}

function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMondayOfWeek(offset: number) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function buildWeeklyData(transactions: Transaction[], monday: Date) {
  return dayNames.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = localDate(d)
    const dayTx = transactions.filter(t => t.date === dateStr)
    const income = dayTx.filter(t => t.categories?.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = dayTx.filter(t => t.categories?.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { day, income, expense }
  })
}

export default function DashboardClient({
  balance, income, expense, recent, allTransactions, budgets, activityData, savingsPct, categories,
}: Props) {
  const [weekOffset, setWeekOffset] = useState(0)

  const monday = getMondayOfWeek(weekOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const weeklyData = buildWeeklyData(allTransactions, monday)

  const weekLabel = `${monday.getDate()}/${monday.getMonth() + 1} – ${sunday.getDate()}/${sunday.getMonth() + 1}`

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 min-w-0">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
            <input
              readOnly
              placeholder="Sök transaktioner..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100 cursor-default"
            />
          </div>
          <button className="relative p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Bell size={17} className="text-gray-700" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Balance Summary */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Saldo</h2>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0">
                <PieChart width={96} height={96}>
                  <Pie
                    data={[{ value: savingsPct }, { value: Math.max(0, 100 - savingsPct) }]}
                    cx={48} cy={48}
                    innerRadius={30} outerRadius={42}
                    startAngle={90} endAngle={-270}
                    dataKey="value" strokeWidth={0}
                  >
                    <Cell fill="#111827" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                  {savingsPct}%
                </span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {balance.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                </p>
                <p className="text-xs text-gray-600 mb-2">Tillgängligt saldo</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {savingsPct}% kvar
                </span>
              </div>
            </div>
            <div className="flex gap-8 mt-4">
              <div>
                <p className="text-[11px] text-gray-600 mb-0.5">Inkomster</p>
                <p className="text-sm font-semibold text-green-600">+{income.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-600 mb-0.5">Utgifter</p>
                <p className="text-sm font-semibold text-red-500">-{expense.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</p>
              </div>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Betalningsstatistik</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
                  <ChevronLeft size={14} className="text-gray-600" />
                </button>
                <span className="text-xs text-gray-600 px-1">{weekLabel}</span>
                <button onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 0} className="p-1 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30">
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#4b5563' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                <Area type="monotone" dataKey="income" stroke="#111827" strokeWidth={2} fill="url(#gradIncome)" dot={false} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#gradExpense)" dot={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString('sv-SE')} kr`, name === 'income' ? 'Inkomst' : 'Utgift']}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Senaste transaktioner</h2>
          {!recent.length ? (
            <p className="text-sm text-gray-600">Inga transaktioner än.</p>
          ) : (
            <div className="space-y-4">
              {recent.map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${t.categories?.color ?? '#e5e7eb'}22` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.categories?.color ?? '#9ca3af' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.description ?? '—'}</p>
                    <p className="text-xs text-gray-600">{t.categories?.name ?? 'Ingen kategori'}</p>
                  </div>
                  <p className="text-xs text-gray-600 shrink-0">{t.date}</p>
                  <p className={`text-sm font-semibold shrink-0 ${t.categories?.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                    {t.categories?.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-60 shrink-0 border-l border-gray-100 flex flex-col gap-6 overflow-y-auto p-5">

        {/* Summary card */}
        <div className="bg-gray-900 rounded-2xl p-4 text-white">
          <p className="text-xs text-gray-400 mb-1">Totalt saldo</p>
          <p className="text-2xl font-bold mb-3">{balance.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</p>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-gray-500 text-[10px] mb-0.5">INKOMSTER</p>
              <p className="text-green-400 font-medium">+{income.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} kr</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] mb-0.5">UTGIFTER</p>
              <p className="text-red-400 font-medium">-{expense.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} kr</p>
            </div>
          </div>
        </div>

        {/* Quick add transaction */}
        <QuickAddForm categories={categories} />

        {/* Budgets */}
        {budgets.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Månadsbudgetar</h3>
            <div className="space-y-3">
              {budgets.map(b => (
                <div key={b.id}>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-600 truncate pr-2">{b.categories?.name}</p>
                    <p className="text-xs font-semibold text-gray-900 shrink-0">
                      {Number(b.amount).toLocaleString('sv-SE', { minimumFractionDigits: 0 })} kr
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full w-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Aktivitet</h3>
            <span className="text-sm font-semibold text-gray-900">
              {(income + expense).toLocaleString('sv-SE', { minimumFractionDigits: 0 })} kr
            </span>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <BarChart data={activityData} barSize={7} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="v" fill="#111827" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
