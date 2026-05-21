import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envText = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@philab.org',
  password: 'philab123',
})
console.log('data:', JSON.stringify(data, null, 2))
console.log('error:', error)
