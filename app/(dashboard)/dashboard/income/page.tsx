import { createSupabaseServerClient } from '@/lib/supabaseServer'
import IncomePageClient from '@/components/IncomePageClient'

export default async function IncomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: categories }, { data: transactions }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .eq('type', 'income')
      .order('name'),
    supabase
      .from('transactions')
      .select('*, categories(name, type, color)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false }),
  ])

  const incomeTransactions = transactions?.filter(t => t.categories?.type === 'income') ?? []
  const total = incomeTransactions.reduce((s, t) => s + Number(t.amount), 0)

  return (
    <IncomePageClient
      categories={categories ?? []}
      transactions={incomeTransactions}
      total={total}
    />
  )
}
