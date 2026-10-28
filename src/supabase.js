import { createClient } from '@supabase/supabase-js'

// Toma los datos del archivo .env o usa tus valores reales por defecto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dyzfvgfdyzjpytknzofw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RHfkVP8E8-P_HqT73K6lJw_1XMZCxzM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)