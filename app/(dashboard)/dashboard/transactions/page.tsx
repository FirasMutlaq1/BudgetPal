import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { deleteTransaction } from '@/app/actions/transactions'
import TransactionForm from '@/components/TransactionForm'
import { Trash2 } from 'lucide-react'

export default async function TransactionsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, categories(name, type, color)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('name'),
  ])

  const income = transactions?.filter(t => t.categories?.type === 'income').reduce((s, t) => s + t.amount, 0) ?? 0
  const expense = transactions?.filter(t => t.categories?.type === 'expense').reduce((s, t) => s + t.amount, 0) ?? 0
  const balance = income - expense

  return (
    <div className="flex flex-col md:flex-row md:h-full md:overflow-hidden">
      {/* Left: transactions */}
      <div className="flex-1 p-4 md:p-6 md:overflow-y-auto min-w-0">
        <h1 className="text-lg font-bold text-gray-900 mb-5">Transaktioner</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Totala inkomster</p>
            <p className="text-xl font-bold text-green-700">{income.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4">
            <p className="text-xs text-red-500 font-medium mb-1">Totala utgifter</p>
            <p className="text-xl font-bold text-red-600">{expense.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-700 font-medium mb-1">Saldo</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {balance.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
            </p>
          </div>
        </div>

        {/* Transaction list */}
        {!transactions?.length ? (
          <div className="flex items-center justify-center h-32 text-gray-600">
            <p className="text-sm">Inga transaktioner än.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => {
              const deleteAction = deleteTransaction.bind(null, t.id)
              return (
                <div key={t.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
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
                  <form action={deleteAction}>
                    <button type="submit" className="p-1 text-gray-700 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: form */}
      <div className="md:w-72 md:shrink-0 border-t md:border-t-0 md:border-l border-gray-100 p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Ny transaktion</h2>
        <TransactionForm categories={categories ?? []} />
      </div>
    </div>
  )
}
