// admin 에 프로토콜 없이 저장된 주소가 실제로 있다(예: 'www.example.com').
// 그대로 href 에 넣으면 상대경로로 해석돼 사이트 안쪽(/members/www.example.com)으로
// 잘못 이동하므로 https:// 를 붙여준다. 빈 값이면 null → 호출부에서 링크를 생략한다.
export function normalizeUrl(value) {
  const s = String(value ?? '').trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  return `https://${s}`
}
