import Sidebar from '@/components/Sidebar'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

const DEFAULT_CATEGORIES = [
  { name: 'Lön', type: 'income', color: '#10b981' },
  { name: 'Bidrag', type: 'income', color: '#3b82f6' },
  { name: 'Freelance', type: 'income', color: '#8b5cf6' },
  { name: 'Mat & dryck', type: 'expense', color: '#f59e0b' },
  { name: 'Hyra', type: 'expense', color: '#f43f5e' },
  { name: 'Transport', type: 'expense', color: '#6366f1' },
  { name: 'Nöje', type: 'expense', color: '#ec4899' },
  { name: 'Hälsa', type: 'expense', color: '#14b8a6' },
  { name: 'Övrigt', type: 'expense', color: '#9ca3af' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: existing } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', user.id)

    const existingNames = new Set(existing?.map(c => c.name) ?? [])
    const missing = DEFAULT_CATEGORIES.filter(c => !existingNames.has(c.name))

    if (missing.length > 0) {
      await supabase.from('categories').insert(
        missing.map(c => ({ ...c, user_id: user.id }))
      )
    }
  }

  return (
    <div className="flex h-full bg-[#eef0f4]">
      <Sidebar />
      <div className="flex-1 p-4 overflow-hidden">
        <div className="bg-white rounded-2xl h-full overflow-hidden shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
