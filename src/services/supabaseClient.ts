import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY가 설정되어 있지 않습니다. .env를 확인하세요.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
