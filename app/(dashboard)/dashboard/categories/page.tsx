import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { deleteCategory } from '@/app/actions/categories'
import CategoryForm from '@/components/CategoryForm'
import { Trash2 } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user!.id)
    .order('name')

  // Seed default categories if user has none
  if (!categories?.length) {
    const defaults = [
      { user_id: user!.id, name: 'Lön', type: 'income', color: '#10b981' },
      { user_id: user!.id, name: 'Bidrag', type: 'income', color: '#3b82f6' },
      { user_id: user!.id, name: 'Freelance', type: 'income', color: '#8b5cf6' },
      { user_id: user!.id, name: 'Mat & dryck', type: 'expense', color: '#f59e0b' },
      { user_id: user!.id, name: 'Hyra', type: 'expense', color: '#f43f5e' },
      { user_id: user!.id, name: 'Transport', type: 'expense', color: '#6366f1' },
      { user_id: user!.id, name: 'Nöje', type: 'expense', color: '#ec4899' },
      { user_id: user!.id, name: 'Hälsa', type: 'expense', color: '#14b8a6' },
      { user_id: user!.id, name: 'Övrigt', type: 'expense', color: '#9ca3af' },
    ]
    await supabase.from('categories').insert(defaults)
    const { data: seeded } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('name')
    categories = seeded
  }

  const income = categories?.filter(c => c.type === 'income') ?? []
  const expense = categories?.filter(c => c.type === 'expense') ?? []

  return (
    <div className="flex flex-col md:flex-row md:h-full md:overflow-hidden">
      {/* Left: category list */}
      <div className="flex-1 p-4 md:p-6 md:overflow-y-auto">
        <h1 className="text-lg font-bold text-gray-900 mb-6">Kategorier</h1>

        {categories?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-600">
            <p className="text-sm">Inga kategorier än. Lägg till en till höger!</p>
          </div>
        )}

        {income.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Inkomster</p>
            <div className="space-y-2">
              {income.map(cat => (
                <CategoryRow key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        )}

        {expense.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Utgifter</p>
            <div className="space-y-2">
              {expense.map(cat => (
                <CategoryRow key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: form */}
      <div className="md:w-72 md:shrink-0 border-t md:border-t-0 md:border-l border-gray-100 p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Ny kategori</h2>
        <CategoryForm />
      </div>
    </div>
  )
}

function CategoryRow({ category }: { category: { id: string; name: string; type: string; color: string } }) {
  const deleteAction = deleteCategory.bind(null, category.id)
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
      <p className="flex-1 text-sm font-medium text-gray-900">{category.name}</p>
      <form action={deleteAction}>
        <button type="submit" className="p-1 text-gray-700 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  )
}
