
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = 'https://mdjhaeygzdpywzrwnacx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kamhhZXlnemRweXd6cnduYWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTkxMjEsImV4cCI6MjA2NTU5NTEyMX0.3NvVLKAwlJ73PwyGOfBsEAjKknK4yv0yX9vuExIX4LM'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
