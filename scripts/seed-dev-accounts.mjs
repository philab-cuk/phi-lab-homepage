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

const accounts = [
  { email: 'researcher@philab.org', password: 'philab123', role: 'researcher', name: '[DEV] researcher' },
  { email: 'alumni@philab.org',     password: 'philab123', role: 'alumni',     name: '[DEV] alumni' },
  // non-whitelist: Auth 만 있고 admin_users 매핑 없음
  { email: 'nonwhitelist@philab.org', password: 'philab123', role: null, name: null },
]

const { data: list } = await admin.auth.admin.listUsers()

for (const acc of accounts) {
  const existing = list.users.find(u => u.email === acc.email)
  let userId
  if (existing) {
    userId = existing.id
    await admin.auth.admin.updateUserById(userId, { password: acc.password, email_confirm: true })
    console.log(`✓ updated existing user: ${acc.email}`)
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
    })
    if (error) { console.error('createUser failed:', acc.email, error); process.exit(1) }
    userId = data.user.id
    console.log(`✓ created user: ${acc.email}`)
  }

  // admin_users 매핑
  if (acc.role) {
    const { error } = await admin.from('admin_users').upsert({
      email: acc.email,
      role: acc.role,
      display_name: acc.name,
      invited_by: 'guboc11@gmail.com',
    }, { onConflict: 'email' })
    if (error) { console.error('admin_users upsert failed:', error); process.exit(1) }
    console.log(`  mapped admin_users: ${acc.email} (${acc.role})`)
  } else {
    // non-whitelist 라면 admin_users 에 있으면 안 됨
    await admin.from('admin_users').delete().eq('email', acc.email)
    console.log(`  ensured NOT in admin_users: ${acc.email}`)
  }
}
console.log('\n=== dev accounts ready ===')
