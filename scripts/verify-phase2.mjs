import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }),
)

const newClient = () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

let failures = 0
const check = (label, ok, info) => {
  console.log(`${ok ? '✓' : '✗'} ${label}${info ? ' — ' + JSON.stringify(info) : ''}`)
  if (!ok) failures++
}

const accounts = [
  { email: 'admin@philab.org',        password: 'philab123', role: 'admin',        whitelisted: true,  editor: true  },
  { email: 'researcher@philab.org',   password: 'philab123', role: 'researcher',   whitelisted: true,  editor: false },
  { email: 'alumni@philab.org',       password: 'philab123', role: 'alumni',       whitelisted: true,  editor: false },
  { email: 'nonwhitelist@philab.org', password: 'philab123', role: null,           whitelisted: false, editor: false },
]

for (const acc of accounts) {
  console.log(`\n--- ${acc.email} (expected: ${acc.role || 'no whitelist'}) ---`)
  const sb = newClient()
  const { error: signErr } = await sb.auth.signInWithPassword({ email: acc.email, password: acc.password })
  check(`signIn`, !signErr, signErr?.message)
  if (signErr) continue

  // is_site_editor
  const { data: ed } = await sb.rpc('is_site_editor')
  check(`is_site_editor=${acc.editor}`, ed === acc.editor, { actual: ed })

  // is_whitelist_member
  const { data: wl } = await sb.rpc('is_whitelist_member')
  check(`is_whitelist_member=${acc.whitelisted}`, wl === acc.whitelisted, { actual: wl })

  // admin_users SELECT — whitelisted 면 자기 행 보임, editor 면 모두 보임
  const { data: users, error: usersErr } = await sb.from('admin_users').select('email, role')
  const userRows = users?.length ?? 0
  if (acc.editor) {
    check(`admin_users SELECT (editor: 모두)`, !usersErr && userRows >= 4, { rows: userRows, err: usersErr?.message })
  } else if (acc.whitelisted) {
    check(`admin_users SELECT (self only)`, !usersErr && userRows === 1, { rows: userRows, err: usersErr?.message })
  } else {
    check(`admin_users SELECT (non-whitelist: 0행)`, !usersErr && userRows === 0, { rows: userRows, err: usersErr?.message })
  }

  // members SELECT — whitelisted 면 OK, non-whitelist 면 0행
  const { data: members } = await sb.from('members').select('id')
  if (acc.whitelisted) {
    check(`members SELECT (whitelisted: 가능)`, members !== null, { rows: members?.length })
  } else {
    check(`members SELECT (non-whitelist: 0행)`, members?.length === 0, { rows: members?.length })
  }

  // members INSERT — editor 만 통과
  const tmpId = `_v_${acc.email.split('@')[0]}`
  const { error: insErr } = await sb.from('members').insert({ id: tmpId, name: 'tmp', role: 'student', status: 'current' })
  if (acc.editor) {
    check(`members INSERT (editor: 가능)`, !insErr, insErr?.message)
    await sb.from('members').delete().eq('id', tmpId)
  } else {
    check(`members INSERT (non-editor: 403)`, !!insErr, { error: insErr?.message })
  }

  // news INSERT — whitelisted 면 author_email=self 일 때 가능
  const { data: newsIns, error: newsErr } = await sb.from('news').insert({
    title: 'tmp', body_short: 'v',
    author_email: acc.email,
    status: 'draft',
  }).select()
  if (acc.whitelisted) {
    check(`news INSERT (whitelisted, author=self: 가능)`, !newsErr, newsErr?.message)
    if (newsIns?.[0]) await sb.from('news').delete().eq('id', newsIns[0].id)
  } else {
    check(`news INSERT (non-whitelist: 403)`, !!newsErr, { error: newsErr?.message })
  }

  // news INSERT 거짓 author — author_email 가 본인 아니면 차단 (whitelisted 라도)
  if (acc.whitelisted) {
    const { error: spoofErr } = await sb.from('news').insert({
      title: 'spoof', body_short: 'v',
      author_email: 'admin@philab.org',  // 일부러 다른 이메일
      status: 'draft',
    })
    // admin 본인은 author_email=admin 이라 통과. 다른 사람은 차단.
    if (acc.email === 'admin@philab.org') {
      check(`news INSERT spoof (admin → admin: 정상)`, !spoofErr, spoofErr?.message)
      await sb.from('news').delete().eq('author_email', 'admin@philab.org')
    } else {
      check(`news INSERT spoof author (차단)`, !!spoofErr, { error: spoofErr?.message })
    }
  }

  await sb.auth.signOut()
}

console.log()
if (failures === 0) {
  console.log('=== ALL PASS ===')
} else {
  console.log(`=== ${failures} FAILURE(S) ===`)
  process.exit(1)
}
