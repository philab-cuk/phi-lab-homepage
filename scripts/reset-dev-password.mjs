import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data: list, error: listErr } = await admin.auth.admin.listUsers()
if (listErr) { console.error(listErr); process.exit(1) }

const target = list.users.find(u => u.email === 'admin@philab.org')
if (!target) { console.error('admin@philab.org 사용자 없음'); process.exit(1) }

console.log('found:', { id: target.id, email: target.email, confirmed_at: target.email_confirmed_at })

const { data, error } = await admin.auth.admin.updateUserById(target.id, {
  password: 'philab123',
  email_confirm: true,
})
console.log('update:', { ok: !error, error: error?.message })
