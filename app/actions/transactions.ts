'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function addTransaction(_prev: unknown, formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string)
  const description = (formData.get('description') as string) || null
  const date = formData.get('date') as string
  const category_id = (formData.get('category_id') as string) || null

  if (!amount || amount <= 0) return { error: 'Ange ett giltigt belopp' }
  if (!date) return { error: 'Datum krävs' }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount,
    description,
    date,
    category_id,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/income')
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTransaction(_prev: unknown, formData: FormData) {
  const id = formData.get('id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const description = (formData.get('description') as string) || null
  const date = formData.get('date') as string
  const category_id = (formData.get('category_id') as string) || null

  if (!amount || amount <= 0) return { error: 'Ange ett giltigt belopp' }
  if (!date) return { error: 'Datum krävs' }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase
    .from('transactions')
    .update({ amount, description, date, category_id })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/income')
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('transactions').delete().eq('id', id)
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
}
