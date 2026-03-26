'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function upsertBudget(_prev: unknown, formData: FormData) {
  const category_id = formData.get('category_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const month = formData.get('month') as string

  if (!category_id) return { error: 'Välj en kategori' }
  if (!amount || amount <= 0) return { error: 'Ange ett giltigt belopp' }
  if (!month) return { error: 'Månad krävs' }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase.from('budgets').upsert(
    { user_id: user.id, category_id, amount, month },
    { onConflict: 'user_id,category_id,month' }
  )

  if (error) return { error: error.message }

  revalidatePath('/dashboard/budgets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteBudget(id: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('budgets').delete().eq('id', id)
  revalidatePath('/dashboard/budgets')
  revalidatePath('/dashboard')
}
