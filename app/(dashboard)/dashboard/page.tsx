import { createSupabaseServerClient } from '@/lib/supabaseServer'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Get start of current week (Monday)
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))

  const [{ data: transactions }, { data: budgets }, { data: categories }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, categories(name, type, color)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false }),
    supabase
      .from('budgets')
      .select('*, categories(name, color)')
      .eq('user_id', user!.id)
      .eq('month', currentMonth),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('type')
      .order('name'),
  ])

  const all = transactions ?? []
  // Lokal datum-hjälp (undviker UTC-förskjutning)
  const localDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const today = localDate(now)

  // Bara transaktioner t.o.m. idag räknas i saldot
  const settled = all.filter(t => t.date <= today)
  const income = settled.filter(t => t.categories?.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = settled.filter(t => t.categories?.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  // Procent av inkomst som är kvar efter utgifter
  const savingsPct = income > 0 ? Math.min(100, Math.max(0, Math.round((balance / income) * 100))) : 0

  // Monthly activity (last 7 months) — net (income - expense)
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1)
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthTx = all.filter(t => t.date?.startsWith(m))
    const mIncome = monthTx.filter(t => t.categories?.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const mExpense = monthTx.filter(t => t.categories?.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { v: Math.max(0, mIncome - mExpense) }
  })

  return (
    <DashboardClient
      balance={balance}
      income={income}
      expense={expense}
      recent={all.slice(0, 4)}
      allTransactions={all}
      budgets={budgets ?? []}
      activityData={activityData}
      savingsPct={savingsPct}
      categories={categories ?? []}
    />
  )
}
