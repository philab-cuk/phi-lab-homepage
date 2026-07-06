// 역할 라벨 + 멤버 이름(영문 'JunSeok Her' 형식·한글) 데이터 시드.
// 멱등(여러 번 실행해도 동일). 로컬에 즉석 SQL 로 넣었던 변경을 재현 가능하게 남긴 것.
// PI/학부연구생 라벨은 영문(Principal Investigator / Undergraduate Members),
// Research Engineer 역할을 목록 맨 아래에 추가. 나머지 대학원 역할은 한글 유지.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)] }))
const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// ── 1) 역할 목록 (표시 순서) ────────────────────────────────────────────────
// PI·학부연구생은 영문 라벨, Research Engineer 는 맨 아래(90), 대학원 역할은 한글 유지.
const ROLES = [
  ['Principal Investigator', 10], ['박사과정', 20], ['석박통합과정', 30], ['석사과정', 40],
  ['Undergraduate Members', 50], ['박사', 60], ['석사', 70], ['상임연구원', 80],
  ['Research Engineer', 90],
]
const ROLE_LABELS = ROLES.map(r => r[0])
// 옛 라벨 → 현재 라벨 (멤버 role 값 마이그레이션 + 잔재 정리). 멱등.
const ROLE_RENAME = {
  '지도교수': 'Principal Investigator',
  '학부연구생': 'Undergraduate Members',
  'Undergraduate Researcher': 'Undergraduate Members',
}

// 멤버 role 값 영문→한글 먼저 (member_roles 정리 전에)
for (const [en, ko] of Object.entries(ROLE_RENAME)) {
  await admin.from('members').update({ role: ko }).eq('role', en)
}
// member_roles: 우리 8종만 남기고(영문 잔재 삭제), upsert
await admin.from('member_roles').delete().not('label', 'in', `(${ROLE_LABELS.map(l => `"${l}"`).join(',')})`)
for (const [label, sort_order] of ROLES) {
  const { data: ex } = await admin.from('member_roles').select('id').eq('label', label).maybeSingle()
  if (ex) await admin.from('member_roles').update({ sort_order }).eq('label', label)
  else await admin.from('member_roles').insert({ label, sort_order })
}

// ── 2) 멤버 이름: 영문 'JunSeok Her' 형식 + 한글 ────────────────────────────
// match: 운영의 공백형/로컬의 결합형 둘 다 매칭되도록 변형을 나열.
const NAMES = [
  { match: ['Hyo Jung Kim', 'HyoJung Kim'], name: 'HyoJung Kim', name_ko: '김효정' },
  { match: ['Jun Seok Her', 'JunSeok Her'], name: 'JunSeok Her', name_ko: '허준석' },
  { match: ['Jin Woo Yoo', 'JinWoo Yoo'], name: 'JinWoo Yoo', name_ko: '유진우' },
  { match: ['Eun Jin Jeong', 'EunJin Jeong'], name: 'EunJin Jeong', name_ko: '정은진' },
  { match: ['Yeseo Lee'], name: 'Yeseo Lee', name_ko: '이예서' },
  { match: ['Eun Ji Kim', 'EunJi Kim'], name: 'EunJi Kim', name_ko: '김은지' },
  { match: ['Sang Min Lim', 'SangMin Lim'], name: 'SangMin Lim', name_ko: '임상민' },
  { match: ['Jae Hyeok Han', 'JaeHyeok Han'], name: 'JaeHyeok Han', name_ko: '한재혁' },
]
for (const n of NAMES) {
  await admin.from('members').update({ name: n.name, name_ko: n.name_ko }).in('name', n.match)
}

console.log(`✓ 역할 ${ROLES.length}종 + 멤버 이름(영문 결합형·한글) 시드 완료`)
