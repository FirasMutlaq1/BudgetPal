import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { deleteBudget } from '@/app/actions/budgets'
import BudgetForm from '@/components/BudgetForm'
import { Trash2 } from 'lucide-react'

export default async function BudgetsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = now.toLocaleString('sv-SE', { month: 'long', year: 'numeric' })

  const [{ data: budgets }, { data: categories }, { data: transactions }] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, categories(name, color)')
      .eq('user_id', user!.id)
      .eq('month', currentMonth),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .eq('type', 'expense')
      .order('name'),
    supabase
      .from('transactions')
      .select('amount, category_id, categories(type)')
      .eq('user_id', user!.id)
      .gte('date', `${currentMonth}-01`)
      .lte('date', `${currentMonth}-31`),
  ])

  // Actual spending per category this month
  const spending: Record<string, number> = {}
  transactions?.forEach(t => {
    const cat = t.categories as { type: string } | null
    if (cat?.type === 'expense' && t.category_id) {
      spending[t.category_id] = (spending[t.category_id] ?? 0) + Number(t.amount)
    }
  })

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: budget list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-gray-900">Budgetar</h1>
          <span className="text-sm text-gray-600 capitalize">{monthLabel}</span>
        </div>

        {!budgets?.length ? (
          <div className="flex items-center justify-center h-32 text-gray-600">
            <p className="text-sm">Inga budgetar för den här månaden.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map(b => {
              const spent = spending[b.category_id] ?? 0
              const pct = Math.min((spent / b.amount) * 100, 100)
              const over = spent > b.amount
              const deleteAction = deleteBudget.bind(null, b.id)

              return (
                <div key={b.id} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.categories?.color }} />
                      <p className="text-sm font-medium text-gray-900">{b.categories?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-700">
                        {spent.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} / {Number(b.amount).toLocaleString('sv-SE', { minimumFractionDigits: 0 })} kr
                      </p>
                      <form action={deleteAction}>
                        <button type="submit" className="p-1 text-gray-700 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-gray-900'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {over && (
                    <p className="text-xs text-red-500 mt-1">
                      Överskred med {(spent - b.amount).toLocaleString('sv-SE', { minimumFractionDigits: 0 })} kr
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: form */}
      <div className="w-72 shrink-0 border-l border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Sätt budget</h2>
        <p className="text-xs text-gray-600 mb-4 capitalize">{monthLabel}</p>
        <BudgetForm categories={categories ?? []} currentMonth={currentMonth} />
      </div>
    </div>
  )
}
