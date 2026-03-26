'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function addCategory(_prev: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const color = formData.get('color') as string

  if (!name?.trim()) return { error: 'Namn krävs' }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: name.trim(),
    type,
    color: color || '#6366f1',
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/categories')
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/budgets')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/dashboard/categories')
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/budgets')
}
