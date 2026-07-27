// 구성원 외부 링크 — 값이 있는 항목만 아이콘으로 표시하고 새 탭으로 연다.
// (개인 홈페이지 · Google Scholar · LinkedIn)

// admin 에 프로토콜 없이 저장된 값이 실제로 있다(예: 'www.example.com').
// 그대로 href 에 넣으면 상대경로로 해석돼 사이트 안쪽(/members/www.example.com)으로
// 잘못 이동하므로 https:// 를 붙여준다.
export function normalizeUrl(value) {
  const s = String(value ?? '').trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  return `https://${s}`
}

const SVG = {
  className: 'block',
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
}

function GlobeIcon() {
  return (
    <svg {...SVG} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.6 3.7 5.6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z" />
    </svg>
  )
}

// 학사모 — Google Scholar
function ScholarIcon() {
  return (
    <svg {...SVG} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 2.6 9 12 14l9.4-5L12 4z" />
      <path d="M6.6 11.3V16c0 1.4 2.4 2.5 5.4 2.5s5.4-1.1 5.4-2.5v-4.7" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg {...SVG} fill="currentColor">
      <path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6zM8.3 18.7H5.4V9.4h2.9v9.3zM6.9 8.1c-.9 0-1.7-.8-1.7-1.7s.8-1.7 1.7-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zm11.8 10.6h-2.9v-4.5c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4v4.6H9.6V9.4h2.8v1.3h.1c.4-.7 1.3-1.5 2.7-1.5 2.9 0 3.5 1.9 3.5 4.4v5.1z" />
    </svg>
  )
}

export default function SocialLinks({ member, showEmail = true, className = '' }) {
  const links = [
    member.personalSite && { key: 'site', label: 'Personal site', Icon: GlobeIcon, href: normalizeUrl(member.personalSite) },
    member.googleScholar && { key: 'gs', label: 'Google Scholar', Icon: ScholarIcon, href: normalizeUrl(member.googleScholar) },
    member.linkedin && { key: 'li', label: 'LinkedIn', Icon: LinkedInIcon, href: normalizeUrl(member.linkedin) },
  ].filter((l) => l && l.href)

  const withEmail = showEmail && member.email
  if (!withEmail && links.length === 0) return null

  return (
    <p className={`my-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] ${className}`}>
      {withEmail && <a href={`mailto:${member.email}`}>{member.email}</a>}
      {links.length > 0 && (
        <span className="flex items-center gap-2.5">
          {links.map(({ key, label, href, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              aria-label={label}
              className="text-meta no-underline transition-colors hover:text-brand-700"
            >
              <Icon />
            </a>
          ))}
        </span>
      )}
    </p>
  )
}
