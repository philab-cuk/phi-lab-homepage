import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i=l.indexOf('='); return [l.slice(0,i), l.slice(i+1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const action = process.argv[2]
if (action === 'add') {
  const { error } = await admin.from('members').insert({
    id: '_livetest', name: 'LIVE LINK TEST', role: 'Undergraduate Researcher',
    status: 'current', display_order: 9999,
  })
  console.log(error ? 'ERR '+error.message : 'added _livetest')
} else if (action === 'remove') {
  await admin.from('members').delete().eq('id', '_livetest')
  console.log('removed _livetest')
}
