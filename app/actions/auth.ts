'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export async function login(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function register(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  // Seed default categories for new user
  if (data.user) {
    await supabase.from('categories').insert([
      { user_id: data.user.id, name: 'Lön', type: 'income', color: '#10b981' },
      { user_id: data.user.id, name: 'Bidrag', type: 'income', color: '#3b82f6' },
      { user_id: data.user.id, name: 'Freelance', type: 'income', color: '#8b5cf6' },
      { user_id: data.user.id, name: 'Mat & dryck', type: 'expense', color: '#f59e0b' },
      { user_id: data.user.id, name: 'Hyra', type: 'expense', color: '#f43f5e' },
      { user_id: data.user.id, name: 'Transport', type: 'expense', color: '#6366f1' },
      { user_id: data.user.id, name: 'Nöje', type: 'expense', color: '#ec4899' },
      { user_id: data.user.id, name: 'Hälsa', type: 'expense', color: '#14b8a6' },
      { user_id: data.user.id, name: 'Övrigt', type: 'expense', color: '#9ca3af' },
    ])
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
